// Script to import contemporary books metadata from Google Books API
import { supabase } from '../integrations/supabase/client';
import {
    getContemporaryBooksByCategory,
    mapToLiteraryCategory,
    formatAuthors,
    estimateReadingTime,
    hasReadableContent,
    type GoogleBook
} from '../utils/googleBooksApi';

const CONTEMPORARY_CATEGORIES = [
    'Literary Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery & Thriller',
    'Contemporary Romance',
    'Historical Fiction',
    'Non-Fiction',
    'Poetry',
];

/**
 * Import a Google Book to Supabase
 */
async function importGoogleBook(googleBook: GoogleBook, category: string) {
    const { volumeInfo, accessInfo } = googleBook;

    // Check if book already exists
    const { data: existingBook } = await supabase
        .from('books')
        .select('id')
        .eq('title', volumeInfo.title)
        .eq('author', formatAuthors(volumeInfo.authors))
        .single();

    if (existingBook) {
        console.log(`  ✓ Book already exists: ${volumeInfo.title}`);
        return;
    }

    const contentAccess = hasReadableContent(googleBook);
    const readingTime = estimateReadingTime(volumeInfo.pageCount);

    // Determine points cost based on access
    let pointsCost = 0;
    let requiresPoints = false;

    if (!contentAccess.isPublicDomain && !contentAccess.hasFullText) {
        // Preview only - requires points to "unlock" full preview
        pointsCost = 100;
        requiresPoints = true;
    }

    // Insert book
    const { error } = await supabase
        .from('books')
        .insert({
            title: volumeInfo.title,
            author: formatAuthors(volumeInfo.authors),
            description: volumeInfo.description || `A ${category} book by ${formatAuthors(volumeInfo.authors)}`,
            category: 'contemporary',
            content_type: category.includes('Poetry') ? 'poem' : 'novel',
            cover_image_url: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || '',
            google_books_id: googleBook.id,
            word_count: (volumeInfo.pageCount || 0) * 250, // Estimate: 250 words per page
            estimated_reading_time: readingTime,
            is_featured: false,
            requires_points: requiresPoints,
            points_cost: pointsCost,
            is_trending: false,
            active_readers_count: 0,
            total_completions: 0,
            // Store additional metadata in JSON column if available
            literary_category: mapToLiteraryCategory(volumeInfo.categories),
            published_year: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : null,
            average_rating: volumeInfo.averageRating,
            ratings_count: volumeInfo.ratingsCount,
        });

    if (error) {
        console.error(`  ✗ Error inserting ${volumeInfo.title}:`, error);
        return;
    }

    console.log(`  ✓ Imported: ${volumeInfo.title} by ${formatAuthors(volumeInfo.authors)}`);
}

/**
 * Import contemporary books by category
 */
export async function importContemporaryBooks(
    booksPerCategory: number = 10,
    onProgress?: (category: string, current: number, total: number) => void
) {
    console.log(`\n📚 Importing contemporary books from Google Books API...\n`);

    for (const category of CONTEMPORARY_CATEGORIES) {
        console.log(`\n📖 Category: ${category}`);

        try {
            const books = await getContemporaryBooksByCategory(category, booksPerCategory);
            console.log(`  Found ${books.length} books`);

            for (let i = 0; i < books.length; i++) {
                await importGoogleBook(books[i], category);

                if (onProgress) {
                    onProgress(category, i + 1, books.length);
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } catch (error) {
            console.error(`  ✗ Error importing category ${category}:`, error);
        }
    }

    console.log(`\n✅ Contemporary books import complete!\n`);
}

/**
 * Update existing books with literary categories
 */
export async function updateBooksWithCategories() {
    console.log('\n🏷️  Updating books with literary categories...\n');

    // This would iterate through existing books and update their categories
    // Implementation depends on having a literary_category column

    console.log('✅ Categories updated!\n');
}
