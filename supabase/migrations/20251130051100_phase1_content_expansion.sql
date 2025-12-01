-- Phase 1: Content & Library Expansion - Database Schema Updates
-- Adding new columns to books table and creating book suggestions table

-- Update books table with new tracking columns
ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_trending boolean DEFAULT false;
ALTER TABLE books ADD COLUMN IF NOT EXISTS active_readers_count integer DEFAULT 0;
ALTER TABLE books ADD COLUMN IF NOT EXISTS total_completions integer DEFAULT 0;

-- Create index for trending books queries
CREATE INDEX IF NOT EXISTS idx_books_trending ON books(is_trending, active_readers_count DESC);
CREATE INDEX IF NOT EXISTS idx_books_completions ON books(total_completions DESC);

-- Create book suggestions table for community-driven content
CREATE TABLE IF NOT EXISTS book_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text NOT NULL,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz
);

-- Create indexes for book suggestions
CREATE INDEX IF NOT EXISTS idx_book_suggestions_user ON book_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_book_suggestions_status ON book_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_book_suggestions_created ON book_suggestions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE book_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for book_suggestions
-- Users can view their own suggestions
CREATE POLICY "Users can view their own suggestions"
  ON book_suggestions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own suggestions
CREATE POLICY "Users can create suggestions"
  ON book_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending suggestions
CREATE POLICY "Users can update their own pending suggestions"
  ON book_suggestions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Function to update active readers count (called from reading sessions)
CREATE OR REPLACE FUNCTION update_active_readers_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the count of users who have started but not completed this book
  UPDATE books
  SET active_readers_count = (
    SELECT COUNT(DISTINCT user_id)
    FROM reading_sessions
    WHERE book_id = NEW.book_id
    AND is_completed = false
  )
  WHERE id = NEW.book_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update active readers when reading session changes
DROP TRIGGER IF EXISTS trigger_update_active_readers ON reading_sessions;
CREATE TRIGGER trigger_update_active_readers
  AFTER INSERT OR UPDATE ON reading_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_active_readers_count();

-- Function to update total completions (called when book is completed)
CREATE OR REPLACE FUNCTION update_book_completions()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if is_completed changed from false to true
  IF NEW.is_completed = true AND (OLD IS NULL OR OLD.is_completed = false) THEN
    UPDATE books
    SET total_completions = total_completions + 1
    WHERE id = NEW.book_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update completions when reading session is completed
DROP TRIGGER IF EXISTS trigger_update_book_completions ON reading_sessions;
CREATE TRIGGER trigger_update_book_completions
  AFTER INSERT OR UPDATE ON reading_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_book_completions();
