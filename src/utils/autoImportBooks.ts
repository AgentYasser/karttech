/**
 * Auto-import books on first run
 * This runs once to populate the library with content
 */
import { supabase } from "@/integrations/supabase/client";
import { importAllMissingContent, getBooksWithoutContent } from "./bookContentManager";

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
 * Auto-import all book content on first run
 * NON-BLOCKING - Runs in background without halting user experience
 * Users can browse while import happens
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
      console.log("📚 Starting background book import...");
      
      // Get books without content
      const booksWithoutContent = await getBooksWithoutContent();
      
      if (booksWithoutContent.length === 0) {
        console.log("✅ All books already have content");
        markBooksAsImported();
        return;
      }

      console.log(`📥 Importing ${booksWithoutContent.length} books in background...`);
      
      // Import all missing content (runs in background)
      const result = await importAllMissingContent((current, total, bookTitle) => {
        console.log(`  [${current}/${total}] Importing: ${bookTitle}`);
        // Dispatch custom event for UI to listen to
        window.dispatchEvent(new CustomEvent('book-import-progress', {
          detail: { current, total, bookTitle }
        }));
      });

      console.log(`✅ Background import complete! Imported: ${result.imported}, Failed: ${result.failed}`);
      
      // Mark as imported
      markBooksAsImported();
      
      // Notify UI
      window.dispatchEvent(new CustomEvent('book-import-complete', {
        detail: { imported: result.imported, failed: result.failed }
      }));
      
    } catch (error) {
      console.error("Error during auto-import:", error);
      // Don't mark as imported if failed - will retry next time
    }
  }, 1000); // Start after 1 second delay (let app initialize first)
}

/**
 * Force re-import (for admin use)
 */
export function resetImportFlag() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(IMPORT_FLAG_KEY);
  console.log("🔄 Import flag reset - books will be imported on next page load");
}

