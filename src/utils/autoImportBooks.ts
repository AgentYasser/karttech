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
 * This ensures books are ready to read without manual intervention
 */
export async function autoImportBooksOnFirstRun(): Promise<void> {
  // Skip if already imported
  if (hasImportedBooks()) {
    console.log("📚 Books already imported, skipping auto-import");
    return;
  }

  try {
    console.log("📚 First run detected - auto-importing book content...");
    
    // Get books without content
    const booksWithoutContent = await getBooksWithoutContent();
    
    if (booksWithoutContent.length === 0) {
      console.log("✅ All books already have content");
      markBooksAsImported();
      return;
    }

    console.log(`📥 Starting import of ${booksWithoutContent.length} books...`);
    
    // Import all missing content
    const result = await importAllMissingContent((current, total, bookTitle) => {
      console.log(`  [${current}/${total}] Importing: ${bookTitle}`);
    });

    console.log(`✅ Import complete! Imported: ${result.imported}, Failed: ${result.failed}`);
    
    // Mark as imported
    markBooksAsImported();
    
  } catch (error) {
    console.error("Error during auto-import:", error);
    // Don't mark as imported if failed - will retry next time
  }
}

/**
 * Force re-import (for admin use)
 */
export function resetImportFlag() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(IMPORT_FLAG_KEY);
  console.log("🔄 Import flag reset - books will be imported on next page load");
}

