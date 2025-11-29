-- Create enum for room participant roles
CREATE TYPE public.room_role AS ENUM ('creator', 'moderator', 'member');

-- Create enum for room status
CREATE TYPE public.room_status AS ENUM ('scheduled', 'live', 'ended');

-- Audio discussion rooms table
CREATE TABLE public.discussion_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.reading_groups(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status room_status NOT NULL DEFAULT 'scheduled',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discussion_rooms ENABLE ROW LEVEL SECURITY;

-- RLS policies for discussion_rooms
CREATE POLICY "Anyone can view rooms" ON public.discussion_rooms
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms" ON public.discussion_rooms
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their rooms" ON public.discussion_rooms
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their rooms" ON public.discussion_rooms
    FOR DELETE USING (auth.uid() = created_by);

-- Room participants table
CREATE TABLE public.discussion_room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.discussion_rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role room_role NOT NULL DEFAULT 'member',
    is_muted BOOLEAN DEFAULT false,
    is_speaking BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(room_id, user_id)
);

-- Enable RLS
ALTER TABLE public.discussion_room_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for participants
CREATE POLICY "Anyone can view participants" ON public.discussion_room_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join rooms" ON public.discussion_room_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation" ON public.discussion_room_participants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Moderators can update participants" ON public.discussion_room_participants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.discussion_room_participants p
            WHERE p.room_id = discussion_room_participants.room_id
            AND p.user_id = auth.uid()
            AND p.role IN ('creator', 'moderator')
        )
    );

CREATE POLICY "Users can leave rooms" ON public.discussion_room_participants
    FOR DELETE USING (auth.uid() = user_id);

-- Text messages for discussion rooms
CREATE TABLE public.discussion_room_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.discussion_rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discussion_room_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages
CREATE POLICY "Participants can view messages" ON public.discussion_room_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.discussion_room_participants
            WHERE room_id = discussion_room_messages.room_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Participants can send messages" ON public.discussion_room_messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.discussion_room_participants
            WHERE room_id = discussion_room_messages.room_id
            AND user_id = auth.uid()
        )
    );

-- Point awards for discussion contributions
CREATE TABLE public.discussion_point_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.discussion_rooms(id) ON DELETE CASCADE NOT NULL,
    from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    points INTEGER NOT NULL CHECK (points IN (5, 10, 15, 20, 50)),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT different_users CHECK (from_user_id != to_user_id)
);

-- Enable RLS
ALTER TABLE public.discussion_point_awards ENABLE ROW LEVEL SECURITY;

-- RLS policies for point awards
CREATE POLICY "Participants can view awards" ON public.discussion_point_awards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.discussion_room_participants
            WHERE room_id = discussion_point_awards.room_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Participants can give awards" ON public.discussion_point_awards
    FOR INSERT WITH CHECK (
        auth.uid() = from_user_id AND
        EXISTS (
            SELECT 1 FROM public.discussion_room_participants
            WHERE room_id = discussion_point_awards.room_id
            AND user_id = auth.uid()
        )
    );

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_point_awards;

-- Indexes for performance
CREATE INDEX idx_room_participants_room ON public.discussion_room_participants(room_id);
CREATE INDEX idx_room_participants_user ON public.discussion_room_participants(user_id);
CREATE INDEX idx_room_messages_room ON public.discussion_room_messages(room_id);
CREATE INDEX idx_point_awards_room ON public.discussion_point_awards(room_id);
CREATE INDEX idx_point_awards_to_user ON public.discussion_point_awards(to_user_id);