-- Phase 3: Gamification Refinements - Database Schema

-- Streak shields table
CREATE TABLE IF NOT EXISTS streak_shields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  shields_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Daily quests table
CREATE TABLE IF NOT EXISTS daily_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_type text NOT NULL CHECK (quest_type IN ('read_time', 'word_lookup', 'discussion_comment', 'chapter_complete')),
  title text NOT NULL,
  description text NOT NULL,
  target_value integer NOT NULL DEFAULT 1,
  points_reward integer DEFAULT 10,
  icon text DEFAULT 'target',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User quest progress table
CREATE TABLE IF NOT EXISTS user_quest_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id uuid REFERENCES daily_quests(id) ON DELETE CASCADE,
  progress integer DEFAULT 0,
  target integer NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  quest_date date DEFAULT CURRENT_DATE,
  UNIQUE(user_id, quest_id, quest_date)
);

-- Flash events table
CREATE TABLE IF NOT EXISTS flash_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text CHECK (event_type IN ('author_bonus', 'genre_bonus', 'weekend_challenge', 'double_points')),
  multiplier numeric DEFAULT 2.0,
  target_author text,
  target_genre text,
  target_literary_category text,
  bonus_points integer DEFAULT 0,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User event participation tracking
CREATE TABLE IF NOT EXISTS user_event_participation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_id uuid REFERENCES flash_events(id) ON DELETE CASCADE,
  points_earned integer DEFAULT 0,
  participated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_streak_shields_user ON streak_shields(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_progress_user ON user_quest_progress(user_id, quest_date);
CREATE INDEX IF NOT EXISTS idx_user_quest_progress_quest ON user_quest_progress(quest_id, quest_date);
CREATE INDEX IF NOT EXISTS idx_flash_events_active ON flash_events(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_user_event_participation_user ON user_event_participation(user_id);

-- Enable RLS
ALTER TABLE streak_shields ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_participation ENABLE ROW LEVEL SECURITY;

-- RLS Policies for streak_shields
CREATE POLICY "Users can view own shields"
  ON streak_shields FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own shields"
  ON streak_shields FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own shields"
  ON streak_shields FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily quests (everyone can view)
CREATE POLICY "Anyone can view active daily quests"
  ON daily_quests FOR SELECT
  USING (is_active = true);

-- RLS Policies for user quest progress
CREATE POLICY "Users can view own quest progress"
  ON user_quest_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quest progress"
  ON user_quest_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quest progress"
  ON user_quest_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for flash events (everyone can view active)
CREATE POLICY "Anyone can view active flash events"
  ON flash_events FOR SELECT
  USING (is_active = true AND starts_at <= now() AND ends_at >= now());

-- RLS Policies for user event participation
CREATE POLICY "Users can view own event participation"
  ON user_event_participation FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own event participation"
  ON user_event_participation FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Seed default daily quests
INSERT INTO daily_quests (quest_type, title, description, target_value, points_reward, icon) VALUES
('read_time', 'Daily Reading', 'Read for 10 minutes today', 10, 10, 'book-open'),
('word_lookup', 'Vocabulary Builder', 'Look up 3 new words', 3, 15, 'sparkles'),
('discussion_comment', 'Join the conversation', 'Leave a comment in a discussion', 1, 20, 'message-circle'),
('chapter_complete', 'Chapter Master', 'Complete a chapter', 1, 25, 'bookmark')
ON CONFLICT DO NOTHING;

-- Function to reset daily quests (run via cron jo or trigger)
CREATE OR REPLACE FUNCTION reset_daily_quests()
RETURNS void AS $$
BEGIN
  -- Archive completed quests older than 30 days
  DELETE FROM user_quest_progress 
  WHERE quest_date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to check and use streak shield
CREATE OR REPLACE FUNCTION use_streak_shield(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  shield_count integer;
BEGIN
  -- Get current shield count
  SELECT shields_count INTO shield_count
  FROM streak_shields
  WHERE user_id = p_user_id;
  
  -- If no shields, return false
  IF shield_count IS NULL OR shield_count <= 0 THEN
    RETURN false;
  END IF;
  
  -- Use one shield
  UPDATE streak_shields
  SET shields_count = shields_count - 1,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to award streak shield
CREATE OR REPLACE FUNCTION award_streak_shield(p_user_id uuid, p_count integer DEFAULT 1)
RETURNS void AS $$
BEGIN
  INSERT INTO streak_shields (user_id, shields_count)
  VALUES (p_user_id, p_count)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    shields_count = streak_shields.shields_count + p_count,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;
