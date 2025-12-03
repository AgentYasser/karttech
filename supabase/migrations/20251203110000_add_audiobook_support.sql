-- Add audiobook and multi-source support to books table
-- Enables LibriVox audiobooks and Standard Ebooks integration

-- Add columns for audiobook support
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS librivox_id INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS librivox_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS audio_duration_minutes INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS has_audiobook BOOLEAN DEFAULT FALSE;

-- Add columns for Standard Ebooks integration
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS standard_ebooks_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS epub_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS has_enhanced_formatting BOOLEAN DEFAULT FALSE;

-- Add content source tracking (can have multiple sources)
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS content_sources TEXT[] DEFAULT ARRAY['gutenberg'];

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_books_librivox_id ON public.books(librivox_id);
CREATE INDEX IF NOT EXISTS idx_books_has_audiobook ON public.books(has_audiobook);
CREATE INDEX IF NOT EXISTS idx_books_has_enhanced_formatting ON public.books(has_enhanced_formatting);

-- Comments for documentation
COMMENT ON COLUMN public.books.librivox_id IS 'LibriVox audiobook ID for this book';
COMMENT ON COLUMN public.books.librivox_url IS 'Direct URL to LibriVox audiobook page';
COMMENT ON COLUMN public.books.audio_duration_minutes IS 'Total audiobook duration in minutes';
COMMENT ON COLUMN public.books.has_audiobook IS 'Whether this book has an audiobook version available';
COMMENT ON COLUMN public.books.standard_ebooks_url IS 'URL to Standard Ebooks version (better formatting)';
COMMENT ON COLUMN public.books.epub_url IS 'Direct download URL for EPUB format';
COMMENT ON COLUMN public.books.has_enhanced_formatting IS 'Whether Standard Ebooks version is available';
COMMENT ON COLUMN public.books.content_sources IS 'Array of sources: gutenberg, standard_ebooks, librivox';

