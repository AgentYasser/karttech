-- Create table to track user book purchases/unlocks
CREATE TABLE public.user_book_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL DEFAULT 0,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable RLS
ALTER TABLE public.user_book_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.user_book_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create purchases (spend points)
CREATE POLICY "Users can create purchases"
  ON public.user_book_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_book_purchases_user ON public.user_book_purchases(user_id);
CREATE INDEX idx_user_book_purchases_book ON public.user_book_purchases(book_id);