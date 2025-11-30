-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  points_awarded INTEGER NOT NULL DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Add last_login_date to profiles for daily login tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_date DATE;

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Achievements policies (anyone can view)
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed default achievements
INSERT INTO public.achievements (name, description, icon, points_awarded, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first chapter', 'book-open', 10, 'chapters_read', 1),
('Bookworm', 'Read 10 chapters', 'book', 50, 'chapters_read', 10),
('Voracious Reader', 'Read 50 chapters', 'library', 200, 'chapters_read', 50),
('First Finish', 'Complete your first book', 'bookmark', 100, 'books_completed', 1),
('Five Down', 'Complete 5 books', 'award', 300, 'books_completed', 5),
('Word Collector', 'Learn 10 vocabulary words', 'file-text', 25, 'vocabulary_learned', 10),
('Linguist', 'Learn 50 vocabulary words', 'languages', 100, 'vocabulary_learned', 50),
('Conversationalist', 'Create your first discussion', 'message-circle', 25, 'discussions_created', 1),
('Discussion Leader', 'Create 10 discussions', 'messages-square', 100, 'discussions_created', 10),
('Social Reader', 'Join your first group', 'users', 20, 'groups_joined', 1),
('Week Warrior', 'Maintain a 7-day reading streak', 'flame', 100, 'reading_streak', 7),
('Month Master', 'Maintain a 30-day reading streak', 'zap', 500, 'reading_streak', 30),
('Daily Devotee', 'Log in 30 days', 'calendar', 150, 'daily_logins', 30),
('Point Collector', 'Earn 500 points', 'coins', 50, 'points_earned', 500),
('Point Master', 'Earn 2000 points', 'gem', 200, 'points_earned', 2000);