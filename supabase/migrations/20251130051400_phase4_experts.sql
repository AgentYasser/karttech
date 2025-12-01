-- Phase 4: Expert Sessions - Database Schema

-- Experts table
CREATE TABLE IF NOT EXISTS experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL, -- e.g. "Professor of Literature", "Award-winning Author"
  bio text NOT NULL,
  expertise_areas text[] NOT NULL, -- e.g. ["Shakespeare", "Modernism", "Poetry"]
  hourly_rate integer DEFAULT 5000, -- in cents
  is_verified boolean DEFAULT false,
  rating numeric(3, 2) DEFAULT 5.0,
  review_count integer DEFAULT 0,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Expert sessions (bookings)
CREATE TABLE IF NOT EXISTS expert_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid REFERENCES experts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_type text NOT NULL CHECK (session_type IN ('7_min_qa', 'extended')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  cost_points integer DEFAULT 0,
  cost_amount integer DEFAULT 0, -- in cents
  notes text,
  meeting_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Expert content (essays/deep-dives)
CREATE TABLE IF NOT EXISTS expert_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid REFERENCES experts(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id), -- Optional link to specific book
  title text NOT NULL,
  content text NOT NULL, -- Markdown content
  summary text,
  is_premium boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_experts_verified ON experts(is_verified);
CREATE INDEX IF NOT EXISTS idx_expert_sessions_expert ON expert_sessions(expert_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_expert_sessions_user ON expert_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_content_expert ON expert_content(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_content_book ON expert_content(book_id);

-- RLS Policies

-- Experts: Public read, Admin/Owner write
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experts are viewable by everyone"
  ON experts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own expert profile"
  ON experts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Experts can update their own profile"
  ON experts FOR UPDATE
  USING (auth.uid() = user_id);

-- Expert Sessions: Involved parties read/write
ALTER TABLE expert_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON expert_sessions FOR SELECT
  USING (auth.uid() = user_id OR 
         auth.uid() IN (SELECT user_id FROM experts WHERE id = expert_id));

CREATE POLICY "Users can create sessions"
  ON expert_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Involved parties can update sessions"
  ON expert_sessions FOR UPDATE
  USING (auth.uid() = user_id OR 
         auth.uid() IN (SELECT user_id FROM experts WHERE id = expert_id));

-- Expert Content: Public read (premium check in app logic or separate policy), Expert write
ALTER TABLE expert_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content is viewable by everyone"
  ON expert_content FOR SELECT
  USING (true);

CREATE POLICY "Experts can manage their content"
  ON expert_content FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM experts WHERE id = expert_id));

-- Seed some mock experts (linking to random users if they existed, but we'll just insert placeholder data for now if no users)
-- Note: In a real app we'd need valid user_ids. For now we'll skip seeding or rely on manual creation.
