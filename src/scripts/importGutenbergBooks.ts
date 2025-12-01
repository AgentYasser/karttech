// Script to import books from Project Gutenberg into Supabase
import { supabase } from '../integrations/supabase/client';
import { GUTENBERG_BOOKS } from '../data/gutenbergCatalog';
import { getBookCoverUrl } from '../utils/bookCoverGenerator';

interface ChapterData {
    chapter_number: number;
    title: string;
    content: string;
}

/**
 * Fetch book text from Project Gutenberg
 */
async function fetchGutenbergText(gutenbergId: number): Promise<string> {
    const url = `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-0.txt`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch book ${gutenbergId}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error fetching Gutenberg text ${gutenbergId}:`, error);
        throw error;
    }
}

/**
 * Clean Gutenberg text by removing header and footer
 */
function cleanGutenbergText(text: string): string {
    // Remove Project Gutenberg header
    const startMarkers = [
        '*** START OF THE PROJECT GUTENBERG',
        '*** START OF THIS PROJECT GUTENBERG',
        '*END*THE SMALL PRINT',
    ];

    let cleanedText = text;
    for (const marker of startMarkers) {
        const startIndex = cleanedText.indexOf(marker);
        if (startIndex !== -1) {
            // Find the end of this line and the next line
            const lineEnd = cleanedText.indexOf('\n', startIndex);
            if (lineEnd !== -1) {
                cleanedText = cleanedText.substring(lineEnd + 1);
                break;
            }
        }
    }

    // Remove Project Gutenberg footer
    const endMarkers = [
        '*** END OF THE PROJECT GUTENBERG',
        '*** END OF THIS PROJECT GUTENBERG',
        'End of the Project Gutenberg',
        'End of Project Gutenberg',
    ];

    for (const marker of endMarkers) {
        const endIndex = cleanedText.indexOf(marker);
        if (endIndex !== -1) {
            cleanedText = cleanedText.substring(0, endIndex);
            break;
        }
    }

    return cleanedText.trim();
}

/**
 * Split text into chapters based on common patterns
 */
function splitIntoChapters(text: string, bookTitle: string): ChapterData[] {
    const chapters: ChapterData[] = [];

    // Common chapter markers
    const chapterPatterns = [
        /^CHAPTER\s+([IVXLCDM]+|\d+)[:\.\s]/gim,
        /^Chapter\s+(\d+|[IVXLCDM]+)[:\.\s]/gim,
        /^ACT\s+([IVXLCDM]+|\d+)/gim,
        /^SCENE\s+([IVXLCDM]+|\d+)/gim,
        /^PART\s+(\d+|[IVXLCDM]+)/gim,
        /^Book\s+(\d+|[IVXLCDM]+)/gim,
    ];

    let chapterMatches: { index: number; title: string }[] = [];

    // Find all chapter markers
    for (const pattern of chapterPatterns) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length > 0) {
            chapterMatches = matches.map(match => ({
                index: match.index!,
                title: match[0].trim()
            }));
            break; // Use the first pattern that matches
        }
    }

    // If no chapters found, split into reasonable chunks (plays often don't have "chapters")
    if (chapterMatches.length === 0) {
        const lines = text.split('\n');
        const chunkSize = Math.max(100, Math.floor(lines.length / 10)); // At least 10 sections

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
        // Split text at chapter markers
        for (let i = 0; i < chapterMatches.length; i++) {
            const start = chapterMatches[i].index;
            const end = i < chapterMatches.length - 1
                ? chapterMatches[i + 1].index
                : text.length;

            const content = text.substring(start, end).trim();

            if (content) {
                chapters.push({
                    chapter_number: i + 1,
                    title: chapterMatches[i].title,
                    content: content
                });
            }
        }
    }

    // If still no chapters, create a single chapter with all content
    if (chapters.length === 0) {
        chapters.push({
            chapter_number: 1,
            title: bookTitle,
            content: text
        });
    }

    return chapters;
}

/**
 * Import a single book to Supabase
 */
async function importBook(bookData: typeof GUTENBERG_BOOKS[0]) {
    try {
        console.log(`Importing ${bookData.title} by ${bookData.author}...`);

        // 1. Get book cover
        const coverUrl = await getBookCoverUrl({
            title: bookData.title,
            author: bookData.author,
            genre: bookData.genre,
            style: 'classic'
        });

        // 2. Check if book already exists
        const { data: existingBook } = await supabase
            .from('books')
            .select('id')
            .eq('title', bookData.title)
            .eq('author', bookData.author)
            .single();

        if (existingBook) {
            console.log(`  ✓ Book already exists, skipping...`);
            return;
        }

        // 3. Fetch book text from Gutenberg
        const rawText = await fetchGutenbergText(bookData.gutenberg_id);
        const cleanedText = cleanGutenbergText(rawText);

        // 4. Split into chapters
        const chapters = splitIntoChapters(cleanedText, bookData.title);
        console.log(`  Found ${chapters.length} chapters`);

        // 5. Calculate estimated reading time (250 words per minute average)
        const estimatedReadingTime = Math.ceil(bookData.estimatedWordCount / 250);

        // 6. Insert book into database
        const { data: newBook, error: bookError } = await supabase
            .from('books')
            .insert({
                title: bookData.title,
                author: bookData.author,
                description: bookData.description,
                category: bookData.category,
                content_type: bookData.contentType,
                cover_image_url: coverUrl,
                gutenberg_id: bookData.gutenberg_id,
                word_count: bookData.estimatedWordCount,
                estimated_reading_time: estimatedReadingTime,
                is_featured: false,
                requires_points: false,
                points_cost: 0,
                is_trending: false,
                active_readers_count: 0,
                total_completions: 0
            })
            .select()
            .single();

        if (bookError) {
            console.error(`  ✗ Error inserting book:`, bookError);
            return;
        }

        console.log(`  ✓ Book inserted with ID: ${newBook.id}`);

        // 7. Insert chapters
        const chapterInserts = chapters.map(chapter => ({
            book_id: newBook.id,
            chapter_number: chapter.chapter_number,
            title: chapter.title,
            content: chapter.content,
            word_count: chapter.content.split(/\s+/).length
        }));

        const { error: chaptersError } = await supabase
            .from('book_chapters')
            .insert(chapterInserts);

        if (chaptersError) {
            console.error(`  ✗ Error inserting chapters:`, chaptersError);
            return;
        }

        console.log(`  ✓ ${chapters.length} chapters inserted`);
        console.log(`✓ Successfully imported ${bookData.title}\n`);

    } catch (error) {
        console.error(`✗ Error importing ${bookData.title}:`, error);
    }
}

/**
 * Import all books from the catalog
 */
export async function importAllGutenbergBooks(
    limit?: number,
    onProgress?: (current: number, total: number) => void
) {
    const booksToImport = limit ? GUTENBERG_BOOKS.slice(0, limit) : GUTENBERG_BOOKS;
    const total = booksToImport.length;

    console.log(`\n📚 Starting import of ${total} books from Project Gutenberg...\n`);

    for (let i = 0; i < booksToImport.length; i++) {
        const book = booksToImport[i];
        await importBook(book);

        if (onProgress) {
            onProgress(i + 1, total);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ Import complete! Imported ${total} books.\n`);
}

/**
 * Import a specific book by Gutenberg ID
 */
export async function importBookById(gutenbergId: number) {
    const book = GUTENBERG_BOOKS.find(b => b.gutenberg_id === gutenbergId);

    if (!book) {
        console.error(`Book with Gutenberg ID ${gutenbergId} not found in catalog`);
        return;
    }

    await importBook(book);
}
