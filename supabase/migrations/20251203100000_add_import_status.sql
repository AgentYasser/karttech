-- Add system configuration table for tracking import status
-- This ensures import runs once globally, not per-user

CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial import status
INSERT INTO public.system_config (config_key, config_value) 
VALUES ('book_import_status', 'pending')
ON CONFLICT (config_key) DO NOTHING;

-- Add import progress tracking
INSERT INTO public.system_config (config_key, config_value) 
VALUES ('book_import_progress', '{"current": 0, "total": 0, "errors": []}')
ON CONFLICT (config_key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (for checking import status)
CREATE POLICY "Anyone can read system config"
  ON public.system_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can update (Edge Functions)
CREATE POLICY "Service role can update system config"
  ON public.system_config
  FOR UPDATE
  TO service_role
  USING (true);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_config_key ON public.system_config(config_key);

COMMENT ON TABLE public.system_config IS 'Global system configuration and status tracking';
COMMENT ON COLUMN public.system_config.config_key IS 'Unique configuration key';
COMMENT ON COLUMN public.system_config.config_value IS 'JSON or text value for the configuration';

