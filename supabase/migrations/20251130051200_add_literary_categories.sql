-- Add literary categorization columns to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS google_books_id text;
ALTER TABLE books ADD COLUMN IF NOT EXISTS literary_category text;
ALTER TABLE books ADD COLUMN IF NOT EXISTS published_year integer;
ALTER TABLE books ADD COLUMN IF NOT EXISTS average_rating numeric(3, 2);
ALTER TABLE books ADD COLUMN IF NOT EXISTS ratings_count integer;

-- Create index for literary category filtering
CREATE INDEX IF NOT EXISTS idx_books_literary_category ON books(literary_category);
CREATE INDEX IF NOT EXISTS idx_books_google_id ON books(google_books_id);

-- Create index for combined filtering (category + author)
CREATE INDEX IF NOT EXISTS idx_books_category_author ON books(category, author);
CREATE INDEX IF NOT EXISTS idx_books_literary_cat_author ON books(literary_category, author);
