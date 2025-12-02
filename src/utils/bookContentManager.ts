/**
 * Book Content Manager
 * Verifies and imports content for books that are missing chapters
 */
import { supabase } from "@/integrations/supabase/client";
import { removeDisclaimers } from "./textProcessing";

/**
 * Check if a book has content (chapters)
 */
export async function bookHasContent(bookId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("chapters")
      .select("id")
      .eq("book_id", bookId)
      .limit(1);

    if (error) {
      console.error("Error checking book content:", error);
      return false;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error("Error checking book content:", error);
    return false;
  }
}

/**
 * Fetch book text from Project Gutenberg
 */
async function fetchGutenbergText(gutenbergId: number): Promise<string> {
  const url = `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-0.txt`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Try alternative URL format
      const altUrl = `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`;
      const altResponse = await fetch(altUrl);
      if (!altResponse.ok) {
        throw new Error(`Failed to fetch book ${gutenbergId}`);
      }
      return await altResponse.text();
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
function splitIntoChapters(text: string, bookTitle: string): Array<{ chapter_number: number; title: string; content: string }> {
  const chapters: Array<{ chapter_number: number; title: string; content: string }> = [];

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
      break;
    }
  }

  // If no chapters found, split into reasonable chunks
  if (chapterMatches.length === 0) {
    const lines = text.split('\n');
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
 * Import content for a single book from Gutenberg
 */
export async function importBookContent(bookId: string, gutenbergId: number): Promise<{ success: boolean; chaptersCreated: number; error?: string }> {
  try {
    // Check if book already has content
    const hasContent = await bookHasContent(bookId);
    if (hasContent) {
      return { success: true, chaptersCreated: 0 };
    }

    // Fetch book text
    const rawText = await fetchGutenbergText(gutenbergId);
    const cleanedText = cleanGutenbergText(rawText);
    
    // Get book title for chapter naming
    const { data: book } = await supabase
      .from("books")
      .select("title")
      .eq("id", bookId)
      .single();

    if (!book) {
      return { success: false, chaptersCreated: 0, error: "Book not found" };
    }

    // Split into chapters
    const chapters = splitIntoChapters(cleanedText, book.title);

    // Insert chapters
    const chapterInserts = chapters.map(chapter => ({
      book_id: bookId,
      chapter_number: chapter.chapter_number,
      title: chapter.title,
      content: chapter.content,
      word_count: chapter.content.split(/\s+/).length
    }));

    const { error: chaptersError } = await supabase
      .from("chapters")
      .insert(chapterInserts);

    if (chaptersError) {
      console.error("Error inserting chapters:", chaptersError);
      return { success: false, chaptersCreated: 0, error: chaptersError.message };
    }

    // Update book to mark as having content
    await supabase
      .from("books")
      .update({ content_available: true, content_source: "gutenberg" })
      .eq("id", bookId);

    return { success: true, chaptersCreated: chapters.length };
  } catch (error: any) {
    console.error("Error importing book content:", error);
    return { success: false, chaptersCreated: 0, error: error.message };
  }
}

/**
 * Get all books that are missing content
 */
export async function getBooksWithoutContent(): Promise<Array<{ id: string; title: string; author: string; gutenberg_id: number | null }>> {
  try {
    // Get all books
    const { data: books, error } = await supabase
      .from("books")
      .select("id, title, author, gutenberg_id");

    if (error) {
      console.error("Error fetching books:", error);
      return [];
    }

    if (!books) return [];

    // Check which books have content
    const booksWithoutContent: Array<{ id: string; title: string; author: string; gutenberg_id: number | null }> = [];

    for (const book of books) {
      const hasContent = await bookHasContent(book.id);
      if (!hasContent && book.gutenberg_id) {
        booksWithoutContent.push({
          id: book.id,
          title: book.title,
          author: book.author,
          gutenberg_id: book.gutenberg_id
        });
      }
    }

    return booksWithoutContent;
  } catch (error) {
    console.error("Error getting books without content:", error);
    return [];
  }
}

/**
 * Batch import content for all books that need it
 */
export async function importAllMissingContent(
  onProgress?: (current: number, total: number, bookTitle: string) => void
): Promise<{ imported: number; failed: number; errors: Array<{ book: string; error: string }> }> {
  const booksWithoutContent = await getBooksWithoutContent();
  const total = booksWithoutContent.length;
  let imported = 0;
  let failed = 0;
  const errors: Array<{ book: string; error: string }> = [];

  console.log(`\n📚 Found ${total} books without content. Starting import...\n`);

  for (let i = 0; i < booksWithoutContent.length; i++) {
    const book = booksWithoutContent[i];
    
    if (onProgress) {
      onProgress(i + 1, total, book.title);
    }

    if (!book.gutenberg_id) {
      console.log(`  ⚠ Skipping ${book.title} - no Gutenberg ID`);
      continue;
    }

    console.log(`  [${i + 1}/${total}] Importing ${book.title}...`);
    
    const result = await importBookContent(book.id, book.gutenberg_id);
    
    if (result.success) {
      imported++;
      console.log(`  ✓ Imported ${result.chaptersCreated} chapters for ${book.title}`);
    } else {
      failed++;
      errors.push({ book: book.title, error: result.error || "Unknown error" });
      console.log(`  ✗ Failed to import ${book.title}: ${result.error}`);
    }

    // Small delay to avoid rate limiting
    if (i < booksWithoutContent.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n✅ Import complete! Imported: ${imported}, Failed: ${failed}\n`);

  return { imported, failed, errors };
}

