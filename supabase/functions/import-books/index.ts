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
      // Fetch full text from Gutenberg and import chapters
      const textUrl = `https://www.gutenberg.org/files/${gutenberg_id}/${gutenberg_id}-0.txt`;
      console.log(`Fetching book content for Gutenberg ID ${gutenberg_id}`);
      
      try {
        let content = '';
        
        // Try primary URL first
        const response = await fetch(textUrl);
        if (response.ok) {
          content = await response.text();
        } else {
          // Try alternate URL format
          const altUrl = `https://www.gutenberg.org/cache/epub/${gutenberg_id}/pg${gutenberg_id}.txt`;
          console.log(`Primary URL failed, trying alternate: ${altUrl}`);
          const altResponse = await fetch(altUrl);
          if (!altResponse.ok) {
            throw new Error(`Could not fetch book content from either URL (status: ${altResponse.status})`);
          }
          content = await altResponse.text();
        }
        
        // Clean Gutenberg header/footer
        const startMarkers = ['*** START OF THE PROJECT GUTENBERG', '*** START OF THIS PROJECT GUTENBERG'];
        const endMarkers = ['*** END OF THE PROJECT GUTENBERG', '*** END OF THIS PROJECT GUTENBERG', 'End of the Project Gutenberg'];
        
        let cleanedContent = content;
        for (const marker of startMarkers) {
          const startIndex = cleanedContent.indexOf(marker);
          if (startIndex !== -1) {
            const lineEnd = cleanedContent.indexOf('\n', startIndex);
            if (lineEnd !== -1) {
              cleanedContent = cleanedContent.substring(lineEnd + 1);
              break;
            }
          }
        }
        
        for (const marker of endMarkers) {
          const endIndex = cleanedContent.indexOf(marker);
          if (endIndex !== -1) {
            cleanedContent = cleanedContent.substring(0, endIndex);
            break;
          }
        }
        
        // Split into chapters with improved detection
        const chapterPatterns = [
          /^CHAPTER\s+([IVXLCDM]+|\d+)[:\.\s]/gim,
          /^Chapter\s+(\d+|[IVXLCDM]+)[:\.\s]/gim,
          /^ACT\s+([IVXLCDM]+|\d+)/gim,
          /^SCENE\s+([IVXLCDM]+|\d+)/gim,
          /^PART\s+(\d+|[IVXLCDM]+)/gim,
          /^Book\s+(\d+|[IVXLCDM]+)/gim,
        ];
        
        let chapterMatches: Array<{ index: number; title: string }> = [];
        
        for (const pattern of chapterPatterns) {
          const matches = [...cleanedContent.matchAll(pattern)];
          if (matches.length > 0) {
            chapterMatches = matches.map(match => ({
              index: match.index!,
              title: match[0].trim()
            }));
            break;
          }
        }
        
        let chapters: Array<{ chapter_number: number; title: string; content: string }> = [];
        
        if (chapterMatches.length === 0) {
          // No chapters found - split into reasonable chunks
          const lines = cleanedContent.split('\n');
          const chunkSize = Math.max(100, Math.floor(lines.length / 10));
          
          for (let i = 0; i < lines.length; i += chunkSize) {
            const chunk = lines.slice(i, i + chunkSize).join('\n').trim();
            if (chunk) {
              chapters.push({
                chapter_number: chapters.length + 1,
                title: `Part ${chapters.length + 1}`,
                content: chunk
              });
            }
          }
        } else {
          // Split at chapter markers
          for (let i = 0; i < chapterMatches.length; i++) {
            const start = chapterMatches[i].index;
            const end = i < chapterMatches.length - 1
              ? chapterMatches[i + 1].index
              : cleanedContent.length;
            
            const chapterContent = cleanedContent.substring(start, end).trim();
            
            if (chapterContent && chapterContent.length > 100) {
              chapters.push({
                chapter_number: i + 1,
                title: chapterMatches[i].title,
                content: chapterContent
              });
            }
          }
        }
        
        // If still no chapters, create one big chapter
        if (chapters.length === 0 && cleanedContent.trim().length > 0) {
          chapters.push({
            chapter_number: 1,
            title: 'Full Text',
            content: cleanedContent.trim()
          });
        }
        
        // Insert chapters into database
        if (book_id && chapters.length > 0) {
          console.log(`Inserting ${chapters.length} chapters for book ${book_id}`);
          
          const chapterInserts = chapters.map(chapter => ({
            book_id,
            chapter_number: chapter.chapter_number,
            title: chapter.title,
            content: chapter.content,
            word_count: chapter.content.split(/\s+/).length
          }));
          
          const { error: chaptersError } = await supabase
            .from('chapters')
            .insert(chapterInserts);
          
          if (chaptersError) {
            console.error('Error inserting chapters:', chaptersError);
            throw new Error(`Failed to insert chapters: ${chaptersError.message}`);
          }
          
          // Update book to mark content as available
          const { error: updateError } = await supabase
            .from('books')
            .update({ content_available: true, content_source: 'gutenberg' })
            .eq('id', book_id);
          
          if (updateError) {
            console.error('Error updating book:', updateError);
          }
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          chapters_created: chapters.length,
          book_id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error fetching book content:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ 
          error: 'Failed to fetch book content',
          details: errorMessage 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    if (action === 'import_all_content') {
      // NEW: Bulk import content for all books without content
      console.log('Starting bulk content import...');
      
      try {
        // Check import status
        const { data: config } = await supabase
          .from('system_config')
          .select('config_value')
          .eq('config_key', 'book_import_status')
          .maybeSingle();
        
        if (config?.config_value === 'complete') {
          return new Response(JSON.stringify({ 
            success: true,
            message: 'Import already completed',
            imported: 0
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Update status to in_progress
        await supabase
          .from('system_config')
          .update({ config_value: 'in_progress', updated_at: new Date().toISOString() })
          .eq('config_key', 'book_import_status');
        
        // Get all books without content
        const { data: books, error: booksError } = await supabase
          .from('books')
          .select('id, title, gutenberg_id')
          .eq('content_available', false)
          .not('gutenberg_id', 'is', null)
          .limit(50);
        
        if (booksError) {
          throw new Error(`Failed to fetch books: ${booksError.message}`);
        }
        
        if (!books || books.length === 0) {
          await supabase
            .from('system_config')
            .update({ config_value: 'complete', updated_at: new Date().toISOString() })
            .eq('config_key', 'book_import_status');
          
          return new Response(JSON.stringify({ 
            success: true,
            message: 'All books already have content',
            imported: 0
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        console.log(`Found ${books.length} books without content`);
        
        let imported = 0;
        let failed = 0;
        const errors: Array<{ book: string; error: string }> = [];
        
        for (let i = 0; i < books.length; i++) {
          const book = books[i];
          console.log(`[${i + 1}/${books.length}] Processing: ${book.title}`);
          
          // Update progress
          await supabase
            .from('system_config')
            .update({ 
              config_value: JSON.stringify({ current: i + 1, total: books.length, errors }),
              updated_at: new Date().toISOString()
            })
            .eq('config_key', 'book_import_progress');
          
          try {
            // Recursively call fetch_book_content action
            const contentResponse = await fetch(req.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'fetch_book_content',
                gutenberg_id: book.gutenberg_id,
                book_id: book.id
              })
            });
            
            const contentResult = await contentResponse.json();
            
            if (contentResult.success) {
              imported++;
              console.log(`✅ [${i + 1}/${books.length}] ${book.title} - ${contentResult.chapters_created} chapters`);
            } else {
              failed++;
              errors.push({ book: book.title, error: contentResult.error || 'Unknown error' });
              console.error(`❌ [${i + 1}/${books.length}] ${book.title} - ${contentResult.error}`);
            }
          } catch (error: any) {
            failed++;
            const errorMsg = error.message || 'Unknown error';
            errors.push({ book: book.title, error: errorMsg });
            console.error(`❌ [${i + 1}/${books.length}] ${book.title} - ${errorMsg}`);
          }
          
          // Small delay to avoid rate limiting
          if (i < books.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        // Mark as complete
        await supabase
          .from('system_config')
          .update({ config_value: 'complete', updated_at: new Date().toISOString() })
          .eq('config_key', 'book_import_status');
        
        console.log(`✅ Bulk import complete! Imported: ${imported}, Failed: ${failed}`);
        
        return new Response(JSON.stringify({ 
          success: true,
          imported,
          failed,
          total: books.length,
          errors
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (error: any) {
        console.error('Error in bulk import:', error);
        
        // Reset status to pending so it can be retried
        await supabase
          .from('system_config')
          .update({ config_value: 'pending', updated_at: new Date().toISOString() })
          .eq('config_key', 'book_import_status');
        
        return new Response(JSON.stringify({ 
          error: 'Bulk import failed',
          details: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (action === 'enrich_with_audiobooks') {
      // NEW: Add LibriVox audiobooks to existing books
      console.log('Starting LibriVox audiobook enrichment...');
      
      try {
        const { data: books, error: booksError } = await supabase
          .from('books')
          .select('id, title, author, librivox_id')
          .is('librivox_id', null)
          .limit(50);
        
        if (booksError) {
          throw new Error(`Failed to fetch books: ${booksError.message}`);
        }
        
        if (!books || books.length === 0) {
          return new Response(JSON.stringify({ 
            success: true,
            message: 'All books already checked for audiobooks',
            enriched: 0
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        let enriched = 0;
        let notFound = 0;
        
        for (const book of books) {
          try {
            // Search LibriVox for this book
            const searchUrl = `https://librivox.org/api/feed/audiobooks?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&format=json&extended=1`;
            const response = await fetch(searchUrl);
            
            if (!response.ok) {
              console.log(`⚠️  LibriVox API error for ${book.title}`);
              continue;
            }
            
            const data = await response.json();
            const audiobooks = data.books || [];
            
            if (audiobooks.length > 0) {
              const audiobook = audiobooks[0];
              
              // Update book with audiobook info
              const { error: updateError } = await supabase
                .from('books')
                .update({
                  librivox_id: parseInt(audiobook.id),
                  librivox_url: audiobook.url_librivox,
                  audio_duration_minutes: parseInt(audiobook.totaltimesecs) / 60,
                  has_audiobook: true,
                  content_sources: supabase.sql`array_append(content_sources, 'librivox')`
                })
                .eq('id', book.id);
              
              if (!updateError) {
                enriched++;
                console.log(`✅ Added audiobook for: ${book.title}`);
              }
            } else {
              notFound++;
            }
            
            // Delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
            
          } catch (error: any) {
            console.error(`Error enriching ${book.title}:`, error.message);
          }
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          enriched,
          notFound,
          total: books.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (error: any) {
        console.error('Error in audiobook enrichment:', error);
        return new Response(JSON.stringify({ 
          error: 'Audiobook enrichment failed',
          details: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    if (action === 'enrich_with_standard_ebooks') {
      // NEW: Add Standard Ebooks enhanced formatting
      console.log('Starting Standard Ebooks enrichment...');
      
      try {
        const { data: books } = await supabase
          .from('books')
          .select('id, title, author')
          .is('standard_ebooks_url', null)
          .limit(50);
        
        if (!books || books.length === 0) {
          return new Response(JSON.stringify({ 
            success: true,
            message: 'All books already enriched with Standard Ebooks',
            enriched: 0
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        let enriched = 0;
        
        // Standard Ebooks has consistent URL structure
        // Format: https://standardebooks.org/ebooks/author-name/book-title
        const knownAuthors = [
          'Jane Austen', 'Charles Dickens', 'Mark Twain', 'Oscar Wilde',
          'Mary Shelley', 'Bram Stoker', 'H. G. Wells', 'Jules Verne',
          'Edgar Allan Poe', 'Charlotte Brontë', 'Emily Brontë',
          'Fyodor Dostoevsky', 'Leo Tolstoy', 'Herman Melville',
          'Nathaniel Hawthorne', 'Jack London', 'Robert Louis Stevenson',
          'William Shakespeare', 'Homer', 'Dante Alighieri',
          'Lewis Carroll', 'Daniel Defoe', 'Jonathan Swift',
          'Alexandre Dumas', 'Victor Hugo', 'Arthur Conan Doyle'
        ];
        
        for (const book of books) {
          if (knownAuthors.includes(book.author)) {
            // Generate Standard Ebooks URL
            const authorSlug = book.author.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[àáâä]/g, 'a')
              .replace(/[èéêë]/g, 'e')
              .replace(/['']/g, '')
              .replace(/[^a-z-]/g, '');
            
            const titleSlug = book.title.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/['']/g, '')
              .replace(/[^a-z0-9-]/g, '')
              .replace(/--+/g, '-');
            
            const seUrl = `https://standardebooks.org/ebooks/${authorSlug}/${titleSlug}`;
            const epubUrl = `${seUrl}/downloads/${titleSlug}.epub`;
            
            const { error: updateError } = await supabase
              .from('books')
              .update({
                standard_ebooks_url: seUrl,
                epub_url: epubUrl,
                has_enhanced_formatting: true,
                content_sources: supabase.sql`CASE WHEN 'standard_ebooks' = ANY(content_sources) THEN content_sources ELSE array_append(content_sources, 'standard_ebooks') END`
              })
              .eq('id', book.id);
            
            if (!updateError) {
              enriched++;
              console.log(`✅ Added Standard Ebooks for: ${book.title}`);
            }
          }
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          enriched,
          total: books.length,
          message: `Added Standard Ebooks links to ${enriched} books`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (error: any) {
        console.error('Error in Standard Ebooks enrichment:', error);
        return new Response(JSON.stringify({ 
          error: 'Standard Ebooks enrichment failed',
          details: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action',
      validActions: ['import_by_author', 'import_by_category', 'get_timeless_authors', 'fetch_book_content', 'import_all_content', 'enrich_with_audiobooks', 'enrich_with_standard_ebooks']
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
