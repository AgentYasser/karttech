/**
 * Auto-import books on first run
 * FULLY AUTOMATIC - Creates book metadata AND imports content
 * No manual setup required!
 */
import { supabase } from "@/integrations/supabase/client";
import { importAllMissingContent, importBookContent } from "./bookContentManager";
import { GUTENBERG_BOOKS } from "@/data/gutenbergCatalog";

const IMPORT_FLAG_KEY = "karttech_books_imported";

/**
 * Check if books have already been imported
 */
export function hasImportedBooks(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(IMPORT_FLAG_KEY) === "true";
}

/**
 * Mark books as imported
 */
function markBooksAsImported() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(IMPORT_FLAG_KEY, "true");
}

/**
 * FULLY AUTOMATIC SETUP
 * 1. Creates all book metadata (if missing)
 * 2. Imports all book content from Project Gutenberg
 * 3. Runs in background without blocking user
 */
export async function autoImportBooksOnFirstRun(): Promise<void> {
  // Skip if already imported
  if (hasImportedBooks()) {
    console.log("📚 Books already imported, skipping auto-import");
    return;
  }

  // DON'T AWAIT - Let this run in background
  setTimeout(async () => {
    try {
      console.log("🚀 KARTTECH AUTO-SETUP: Starting full library initialization...");
      
      // STEP 1: Ensure all books exist in database
      console.log("📖 Step 1/2: Creating book entries...");
      const { data: existingBooks, error: fetchError } = await supabase
        .from("books")
        .select("gutenberg_id, id");

      if (fetchError) {
        console.error("❌ Failed to fetch existing books:", fetchError);
        return;
      }

      const existingGutenbergIds = new Set(existingBooks?.map(b => b.gutenberg_id) || []);
      const booksToCreate = GUTENBERG_BOOKS.filter(book => !existingGutenbergIds.has(book.gutenberg_id));

      if (booksToCreate.length > 0) {
        console.log(`  Creating ${booksToCreate.length} book entries...`);
        const inserts = booksToCreate.map(bookData => ({
          title: bookData.title,
          author: bookData.author,
          description: bookData.description,
          category: bookData.category,
          content_type: bookData.contentType,
          gutenberg_id: bookData.gutenberg_id,
          word_count: bookData.estimatedWordCount,
          estimated_reading_time: Math.ceil(bookData.estimatedWordCount / 250),
          is_featured: false,
          requires_points: false,
          points_cost: 0,
          is_trending: false,
          active_readers_count: 0,
          total_completions: 0,
          content_available: false,
        }));

        const { error: insertError } = await supabase.from("books").insert(inserts);
        if (insertError) {
          console.error("❌ Failed to create books:", insertError);
          return;
        }
        console.log(`  ✅ Created ${booksToCreate.length} book entries!`);
      } else {
        console.log("  ✅ All book entries already exist!");
      }

      // STEP 2: Import content for all books
      console.log("📥 Step 2/2: Importing book content from Project Gutenberg...");
      
      // Get all books without content
      const { data: allBooks, error: booksError } = await supabase
        .from("books")
        .select("id, title, gutenberg_id, content_available")
        .eq("content_available", false)
        .not("gutenberg_id", "is", null);

      if (booksError) {
        console.error("❌ Failed to fetch books:", booksError);
        return;
      }

      if (!allBooks || allBooks.length === 0) {
        console.log("  ✅ All books already have content!");
        markBooksAsImported();
        return;
      }

      console.log(`  Importing content for ${allBooks.length} books...`);
      let imported = 0;
      let failed = 0;

      // Import content for each book
      for (let i = 0; i < allBooks.length; i++) {
        const book = allBooks[i];
        const progress = `[${i + 1}/${allBooks.length}]`;
        
        console.log(`  ${progress} Importing: ${book.title}...`);
        
        // Dispatch progress event for UI
        window.dispatchEvent(new CustomEvent('book-import-progress', {
          detail: { current: i + 1, total: allBooks.length, bookTitle: book.title }
        }));

        if (book.gutenberg_id) {
          try {
            const result = await importBookContent(book.id, book.gutenberg_id);
            if (result.success) {
              imported++;
              console.log(`  ${progress} ✅ ${book.title} (${result.chaptersCreated} chapters)`);
            } else {
              failed++;
              console.log(`  ${progress} ❌ ${book.title} - ${result.error}`);
            }
          } catch (error: any) {
            failed++;
            console.log(`  ${progress} ❌ ${book.title} - ${error.message}`);
          }
        } else {
          failed++;
          console.log(`  ${progress} ⚠️  ${book.title} - No Gutenberg ID`);
        }

        // Small delay to avoid rate limits
        if (i < allBooks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log(`\n🎉 LIBRARY SETUP COMPLETE!`);
      console.log(`   ✅ Imported: ${imported} books`);
      console.log(`   ❌ Failed: ${failed} books`);
      
      // Mark as imported
      markBooksAsImported();
      
      // Notify UI
      window.dispatchEvent(new CustomEvent('book-import-complete', {
        detail: { imported, failed, total: allBooks.length }
      }));
      
    } catch (error) {
      console.error("❌ Error during auto-setup:", error);
      // Don't mark as imported if failed - will retry next time
    }
  }, 2000); // Start after 2 seconds (let app initialize first)
}

/**
 * Force re-import (for admin use)
 */
export function resetImportFlag() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(IMPORT_FLAG_KEY);
  console.log("🔄 Import flag reset - books will be imported on next page load");
}

