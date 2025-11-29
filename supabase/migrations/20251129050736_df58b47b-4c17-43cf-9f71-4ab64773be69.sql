-- Books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('classic', 'contemporary', 'subscriber')),
  content_type TEXT NOT NULL CHECK (content_type IN ('novel', 'play', 'poem')),
  description TEXT,
  cover_image_url TEXT,
  gutenberg_id INTEGER,
  word_count INTEGER DEFAULT 0,
  estimated_reading_time INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  requires_points BOOLEAN DEFAULT FALSE,
  points_cost INTEGER DEFAULT 0,
  early_access_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Chapters table
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, chapter_number)
);

-- Reading sessions table
CREATE TABLE public.reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  current_chapter INTEGER DEFAULT 1,
  current_position INTEGER DEFAULT 0,
  reading_time_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Discussions table
CREATE TABLE public.discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES public.chapters(id),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  discussion_type TEXT NOT NULL CHECK (discussion_type IN ('solo', 'group', 'communal')),
  upvotes INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion messages table
CREATE TABLE public.discussion_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'audio')) DEFAULT 'text',
  audio_url TEXT,
  upvotes INTEGER DEFAULT 0,
  parent_message_id UUID REFERENCES public.discussion_messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading groups table
CREATE TABLE public.reading_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  book_id UUID REFERENCES public.books(id),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  max_members INTEGER DEFAULT 50,
  is_private BOOLEAN DEFAULT FALSE,
  current_chapter INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.reading_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Points transactions table
CREATE TABLE public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'purchased', 'bonus')),
  source TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User vocabulary table
CREATE TABLE public.user_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  word TEXT NOT NULL,
  definition TEXT,
  book_id UUID REFERENCES public.books(id),
  mastery_level INTEGER DEFAULT 0,
  learned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word)
);

-- Enable RLS on all tables
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vocabulary ENABLE ROW LEVEL SECURITY;

-- Books policies (public read)
CREATE POLICY "Anyone can view books" ON public.books FOR SELECT USING (true);

-- Chapters policies (public read)
CREATE POLICY "Anyone can view chapters" ON public.chapters FOR SELECT USING (true);

-- Reading sessions policies
CREATE POLICY "Users can view own reading sessions" ON public.reading_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reading sessions" ON public.reading_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading sessions" ON public.reading_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Discussions policies
CREATE POLICY "Anyone can view discussions" ON public.discussions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create discussions" ON public.discussions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own discussions" ON public.discussions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Discussion messages policies
CREATE POLICY "Anyone can view messages" ON public.discussion_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create messages" ON public.discussion_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Reading groups policies
CREATE POLICY "Anyone can view public groups" ON public.reading_groups FOR SELECT TO authenticated USING (NOT is_private OR created_by = auth.uid());
CREATE POLICY "Users can create groups" ON public.reading_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update groups" ON public.reading_groups FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Members can view group members" ON public.group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Points transactions policies
CREATE POLICY "Users can view own transactions" ON public.points_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create transactions" ON public.points_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User vocabulary policies
CREATE POLICY "Users can view own vocabulary" ON public.user_vocabulary FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add vocabulary" ON public.user_vocabulary FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vocabulary" ON public.user_vocabulary FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vocabulary" ON public.user_vocabulary FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for discussions
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_messages;