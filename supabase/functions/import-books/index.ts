import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Timeless authors by category
const TIMELESS_AUTHORS = {
  classic_fiction: [
    { name: "Jane Austen", gutenberg_search: "austen" },
    { name: "Charles Dickens", gutenberg_search: "dickens" },
    { name: "Mark Twain", gutenberg_search: "twain" },
    { name: "Charlotte Brontë", gutenberg_search: "bronte" },
    { name: "Fyodor Dostoevsky", gutenberg_search: "dostoevsky" },
    { name: "Leo Tolstoy", gutenberg_search: "tolstoy" },
  ],
  modern_classics: [
    { name: "George Orwell", gutenberg_search: "orwell" },
    { name: "Franz Kafka", gutenberg_search: "kafka" },
    { name: "Aldous Huxley", gutenberg_search: "huxley" },
    { name: "John Kennedy Toole", gutenberg_search: "toole" },
    { name: "Albert Camus", gutenberg_search: "camus" },
    { name: "Virginia Woolf", gutenberg_search: "woolf" },
    { name: "James Joyce", gutenberg_search: "joyce" },
    { name: "F. Scott Fitzgerald", gutenberg_search: "fitzgerald" },
    { name: "Ernest Hemingway", gutenberg_search: "hemingway" },
  ],
  drama_poetry: [
    { name: "William Shakespeare", gutenberg_search: "shakespeare" },
    { name: "Homer", gutenberg_search: "homer" },
    { name: "Dante Alighieri", gutenberg_search: "dante" },
    { name: "John Milton", gutenberg_search: "milton" },
    { name: "Walt Whitman", gutenberg_search: "whitman" },
  ],
  philosophy_essays: [
    { name: "Plato", gutenberg_search: "plato" },
    { name: "Marcus Aurelius", gutenberg_search: "aurelius" },
    { name: "Henry David Thoreau", gutenberg_search: "thoreau" },
    { name: "Ralph Waldo Emerson", gutenberg_search: "emerson" },
  ],
  adventure_mystery: [
    { name: "Jules Verne", gutenberg_search: "verne" },
    { name: "Arthur Conan Doyle", gutenberg_search: "doyle" },
    { name: "Edgar Allan Poe", gutenberg_search: "poe" },
    { name: "Robert Louis Stevenson", gutenberg_search: "stevenson" },
    { name: "Jack London", gutenberg_search: "london" },
  ],
};

interface GutenbergBook {
  id: number;
  title: string;
  authors: { name: string; birth_year?: number; death_year?: number }[];
  subjects: string[];
  formats: Record<string, string>;
  download_count: number;
}

interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  subject?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
}

async function fetchGoogleBooksCover(title: string, author: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;
    console.log(`Fetching Google Books cover for: ${title}`);
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    const book = data.items?.[0];
    
    if (book?.volumeInfo?.imageLinks?.thumbnail) {
      // Replace http with https and get larger image
      return book.volumeInfo.imageLinks.thumbnail
        .replace('http://', 'https://')
        .replace('zoom=1', 'zoom=2');
    }
    return null;
  } catch (error) {
    console.error('Google Books API error:', error);
    return null;
  }
}

async function fetchGutenbergBooks(search: string, limit = 10): Promise<GutenbergBook[]> {
  try {
    const url = `https://gutendex.com/books/?search=${encodeURIComponent(search)}&languages=en`;
    console.log(`Fetching from Gutenberg: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Gutenberg API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return (data.results || []).slice(0, limit);
  } catch (error) {
    console.error(`Error fetching from Gutenberg:`, error);
    return [];
  }
}

async function fetchOpenLibraryBooks(author: string, limit = 5): Promise<OpenLibraryBook[]> {
  try {
    const url = `https://openlibrary.org/search.json?author=${encodeURIComponent(author)}&limit=${limit}&language=eng`;
    console.log(`Fetching from Open Library: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Open Library API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error(`Error fetching from Open Library:`, error);
    return [];
  }
}

async function fetchLibriVoxAudiobooks(author: string): Promise<any[]> {
  try {
    const url = `https://librivox.org/api/feed/audiobooks?author=${encodeURIComponent(author)}&format=json`;
    console.log(`Fetching from LibriVox: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`LibriVox API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.books || [];
  } catch (error) {
    console.error(`Error fetching from LibriVox:`, error);
    return [];
  }
}

function determineContentType(book: GutenbergBook): string {
  const subjects = book.subjects.join(' ').toLowerCase();
  const title = book.title.toLowerCase();
  
  if (subjects.includes('drama') || subjects.includes('plays') || title.includes('play')) {
    return 'play';
  }
  if (subjects.includes('poetry') || subjects.includes('poems') || title.includes('poem')) {
    return 'poem';
  }
  return 'novel';
}

function estimateWordCount(downloadCount: number): number {
  // Rough estimation based on typical book lengths
  return Math.floor(40000 + Math.random() * 60000);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { action, author, category, limit = 10, gutenberg_id, book_id } = body;
    console.log(`Import books action: ${action}, author: ${author}, category: ${category}`);

    if (action === 'import_by_author') {
      // Import books by specific author
      const gutenbergBooks = await fetchGutenbergBooks(author, limit);
      const openLibraryBooks = await fetchOpenLibraryBooks(author, limit);
      
      const importedBooks = [];
      
      for (const book of gutenbergBooks) {
        if (!book.authors.length) continue;
        
        const contentType = determineContentType(book);
        const wordCount = estimateWordCount(book.download_count);
        
        // Check if book already exists
        const { data: existing } = await supabase
          .from('books')
          .select('id')
          .eq('gutenberg_id', book.id)
          .maybeSingle();
        
        if (existing) {
          console.log(`Book already exists: ${book.title}`);
          continue;
        }
        
        // Find cover from Google Books or Open Library
        let coverUrl = await fetchGoogleBooksCover(book.title, book.authors[0].name);
        
        if (!coverUrl) {
          const olMatch = openLibraryBooks.find(ol => 
            ol.title?.toLowerCase().includes(book.title.toLowerCase().split(':')[0])
          );
          coverUrl = olMatch?.cover_i 
            ? `https://covers.openlibrary.org/b/id/${olMatch.cover_i}-M.jpg`
            : null;
        }
        
        const bookData = {
          title: book.title,
          author: book.authors[0].name,
          category: 'classic',
          content_type: contentType,
          description: book.subjects.slice(0, 3).join(', '),
          gutenberg_id: book.id,
          cover_image_url: coverUrl,
          word_count: wordCount,
          estimated_reading_time: Math.ceil(wordCount / 200), // ~200 wpm
          is_featured: book.download_count > 10000,
          requires_points: false,
          points_cost: 0,
        };
        
        const { data: inserted, error } = await supabase
          .from('books')
          .insert(bookData)
          .select()
          .single();
        
        if (error) {
          console.error(`Error inserting book ${book.title}:`, error);
        } else {
          importedBooks.push(inserted);
          console.log(`Imported: ${book.title}`);
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        imported: importedBooks.length,
        books: importedBooks 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'import_by_category') {
      const authors = TIMELESS_AUTHORS[category as keyof typeof TIMELESS_AUTHORS];
      if (!authors) {
        return new Response(JSON.stringify({ 
          error: 'Invalid category',
          validCategories: Object.keys(TIMELESS_AUTHORS)
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      let totalImported = 0;
      
      for (const author of authors) {
        const gutenbergBooks = await fetchGutenbergBooks(author.gutenberg_search, 5);
        
        for (const book of gutenbergBooks) {
          if (!book.authors.length) continue;
          
          const { data: existing } = await supabase
            .from('books')
            .select('id')
            .eq('gutenberg_id', book.id)
            .maybeSingle();
          
          if (existing) continue;
          
          const contentType = determineContentType(book);
          const wordCount = estimateWordCount(book.download_count);
          
          const bookData = {
            title: book.title,
            author: book.authors[0].name,
            category: 'classic',
            content_type: contentType,
            description: book.subjects.slice(0, 3).join(', '),
            gutenberg_id: book.id,
            word_count: wordCount,
            estimated_reading_time: Math.ceil(wordCount / 200),
            is_featured: book.download_count > 10000,
            requires_points: false,
            points_cost: 0,
          };
          
          const { error } = await supabase.from('books').insert(bookData);
          if (!error) totalImported++;
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        imported: totalImported,
        category 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'get_timeless_authors') {
      return new Response(JSON.stringify({ 
        authors: TIMELESS_AUTHORS 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'fetch_book_content') {
      // Fetch full text from Gutenberg
      const textUrl = `https://www.gutenberg.org/files/${gutenberg_id}/${gutenberg_id}-0.txt`;
      console.log(`Fetching book content: ${textUrl}`);
      
      try {
        const response = await fetch(textUrl);
        if (!response.ok) {
          // Try alternate URL format
          const altUrl = `https://www.gutenberg.org/cache/epub/${gutenberg_id}/pg${gutenberg_id}.txt`;
          const altResponse = await fetch(altUrl);
          if (!altResponse.ok) {
            throw new Error('Could not fetch book content');
          }
          const content = await altResponse.text();
          return new Response(JSON.stringify({ content }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const content = await response.text();
        
        // Split into chapters (basic heuristic)
        const chapters = content.split(/(?:CHAPTER|Chapter)\s+(?:\d+|[IVXLC]+)/g)
          .filter(c => c.trim().length > 500)
          .slice(0, 50); // Limit to 50 chapters
        
        if (book_id && chapters.length > 0) {
          // Store chapters in database
          for (let i = 0; i < chapters.length; i++) {
            const chapterContent = chapters[i].trim();
            const wordCount = chapterContent.split(/\s+/).length;
            
            await supabase.from('chapters').insert({
              book_id,
              chapter_number: i + 1,
              title: `Chapter ${i + 1}`,
              content: chapterContent,
              word_count: wordCount,
            });
          }
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          chapters_created: chapters.length 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error fetching book content:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch book content' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action',
      validActions: ['import_by_author', 'import_by_category', 'get_timeless_authors', 'fetch_book_content']
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in import-books function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
