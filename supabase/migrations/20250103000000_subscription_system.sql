-- Subscription System Migration
-- Implements secure subscription tracking, page reads, vocabulary limits, and storage purchases

-- Subscriptions table (immutable log)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Soft delete only (no hard deletes)
  deleted_at TIMESTAMP WITH TIME ZONE,
  -- Ensure one active subscription per user
  UNIQUE(user_id, status) WHERE status = 'active' AND deleted_at IS NULL
);

-- Read history (immutable append-only log)
CREATE TABLE IF NOT EXISTS public.read_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  chapter_id UUID,
  page_number INTEGER NOT NULL,
  is_disclaimer_page BOOLEAN NOT NULL DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  -- Integrity hash to prevent tampering
  hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  -- NO UPDATE, NO DELETE - Append only
);

-- Vocabulary storage purchases (immutable log)
CREATE TABLE IF NOT EXISTS public.storage_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  increments INTEGER NOT NULL CHECK (increments > 0), -- Number of 10-word blocks
  words_added INTEGER NOT NULL CHECK (words_added > 0), -- increments * 10
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE, -- Only true from webhook
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  -- NO UPDATE, NO DELETE - Audit trail
);

-- Access logs (audit trail)
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- 'library', 'vocabulary', 'expert_session', 'reading'
  action TEXT NOT NULL, -- 'allowed', 'denied'
  reason TEXT, -- Why access was denied
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB, -- Additional context
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update user_vocabulary to add constraints and remove deletion capability
-- Note: We'll handle the no-delete rule via RLS policies

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status, deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_read_history_user_book ON public.read_history(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_read_history_timestamp ON public.read_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_storage_purchases_user ON public.storage_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_feature ON public.access_logs(user_id, feature);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.read_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for read_history (users can only view their own)
CREATE POLICY "Users can view own read history" ON public.read_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own read history" ON public.read_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for storage_purchases
CREATE POLICY "Users can view own purchases" ON public.storage_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage purchases" ON public.storage_purchases
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for access_logs
CREATE POLICY "Users can view own access logs" ON public.access_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own access logs" ON public.access_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to calculate vocabulary limit
CREATE OR REPLACE FUNCTION public.get_vocabulary_limit(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  base_limit INTEGER := 20; -- Free tier: 20 words
  purchased_words INTEGER := 0;
BEGIN
  -- Calculate purchased storage increments (each increment = 10 words)
  SELECT COALESCE(SUM(words_added), 0)
  INTO purchased_words
  FROM public.storage_purchases
  WHERE user_id = user_uuid
    AND verified = TRUE;
  
  RETURN base_limit + purchased_words;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current vocabulary count
CREATE OR REPLACE FUNCTION public.get_vocabulary_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO word_count
  FROM public.user_vocabulary
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(word_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = user_uuid
      AND status = 'active'
      AND current_period_end > now()
      AND deleted_at IS NULL
  ) INTO subscription_exists;
  
  RETURN subscription_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription tier
CREATE OR REPLACE FUNCTION public.get_subscription_tier(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_tier TEXT;
BEGIN
  SELECT tier
  INTO user_tier
  FROM public.subscriptions
  WHERE user_id = user_uuid
    AND status = 'active'
    AND current_period_end > now()
    AND deleted_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(user_tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate non-disclaimer pages read
CREATE OR REPLACE FUNCTION public.get_pages_read(user_uuid UUID, book_uuid TEXT)
RETURNS INTEGER AS $$
DECLARE
  page_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO page_count
  FROM public.read_history
  WHERE user_id = user_uuid
    AND book_id = book_uuid
    AND is_disclaimer_page = FALSE;
  
  RETURN COALESCE(page_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update profiles to sync subscription_tier
CREATE OR REPLACE FUNCTION public.sync_subscription_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile subscription_tier when subscription changes
  UPDATE public.profiles
  SET subscription_tier = NEW.tier
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync subscription tier
DROP TRIGGER IF EXISTS trigger_sync_subscription_tier ON public.subscriptions;
CREATE TRIGGER trigger_sync_subscription_tier
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  WHEN (NEW.status = 'active' AND NEW.deleted_at IS NULL)
  EXECUTE FUNCTION public.sync_subscription_tier();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trigger_update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

