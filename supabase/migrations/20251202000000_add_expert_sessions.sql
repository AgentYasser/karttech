-- Create expert_sessions table
CREATE TABLE IF NOT EXISTS expert_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 15),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'in_progress')),
  topic TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_expert_sessions_user_id ON expert_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_sessions_expert_id ON expert_sessions(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_sessions_status ON expert_sessions(status);
CREATE INDEX IF NOT EXISTS idx_expert_sessions_start_time ON expert_sessions(start_time);

-- Enable RLS
ALTER TABLE expert_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sessions"
  ON expert_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON expert_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON expert_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_expert_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_expert_sessions_updated_at
  BEFORE UPDATE ON expert_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_expert_sessions_updated_at();

