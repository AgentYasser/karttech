// Utility to generate book cover images using AI

export interface BookCoverOptions {
    title: string;
    author: string;
    genre?: string;
    style?: 'classic' | 'modern' | 'minimalist';
}

/**
 * Generates a book cover image using AI image generation
 * Returns the path to the generated image
 */
export async function generateBookCover(options: BookCoverOptions): Promise<string> {
    const { title, author, genre = '', style = 'classic' } = options;

    const stylePrompts = {
        classic: 'vintage book cover, ornate typography, classic literature aesthetic, muted colors, elegant design',
        modern: 'modern minimalist book cover, bold typography, contemporary design, vibrant colors',
        minimalist: 'ultra minimalist book cover, simple typography, clean lines, single color accent'
    };

    const prompt = `Professional book cover design for "${title}" by ${author}. ${stylePrompts[style]}. ${genre ? `Genre: ${genre}.` : ''} High quality, print-ready design. No text on cover.`;

    try {
        // Generate image using the image generation tool
        // Note: This would use the generate_image tool in practice
        // For now, we'll return a placeholder path
        const imagePath = `/covers/${encodeURIComponent(title)}.png`;

        console.log(`Would generate cover with prompt: ${prompt}`);

        return imagePath;
    } catch (error) {
        console.error('Error generating book cover:', error);
        // Return placeholder image
        return `/covers/placeholder.png`;
    }
}

/**
 * Get a free cover image from Open Library
 * Fallback option to AI generation
 */
export async function getOpenLibraryCover(title: string, author: string): Promise<string | null> {
    try {
        // Search Open Library API for the book
        const searchQuery = encodeURIComponent(`${title} ${author}`);
        const response = await fetch(`https://openlibrary.org/search.json?q=${searchQuery}&limit=1`);
        const data = await response.json();

        if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
            const coverId = data.docs[0].cover_i;
            // Return cover URL (Large size)
            return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
        }

        return null;
    } catch (error) {
        console.error('Error fetching Open Library cover:', error);
        return null;
    }
}

/**
 * Generate or fetch book cover with fallback options
 * 1. Try AI generation
 * 2. Try Open Library
 * 3. Use placeholder
 */
export async function getBookCoverUrl(options: BookCoverOptions): Promise<string> {
    const { title, author } = options;

    // Try Open Library first (free, no API limits)
    const openLibraryCover = await getOpenLibraryCover(title, author);
    if (openLibraryCover) {
        return openLibraryCover;
    }

    // Fallback to AI generation
    return generateBookCover(options);
}
