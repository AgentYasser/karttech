// Google Books API integration for contemporary book metadata
// Free API with no authentication required for basic searches

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1';

export interface GoogleBook {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        publisher?: string;
        publishedDate?: string;
        description?: string;
        pageCount?: number;
        categories?: string[];
        averageRating?: number;
        ratingsCount?: number;
        imageLinks?: {
            smallThumbnail?: string;
            thumbnail?: string;
            small?: string;
            medium?: string;
            large?: string;
        };
        language?: string;
        previewLink?: string;
        infoLink?: string;
    };
    accessInfo?: {
        viewability: 'NO_PAGES' | 'PARTIAL' | 'ALL_PAGES';
        embeddable: boolean;
        publicDomain: boolean;
        textToSpeechPermission?: string;
        epub?: { isAvailable: boolean };
        pdf?: { isAvailable: boolean };
    };
}

export interface GoogleBooksResponse {
    kind: string;
    totalItems: number;
    items?: GoogleBook[];
}

/**
 * Literary categories for easy navigation
 * Maps Google Books categories to our simplified taxonomy
 */
export const LITERARY_CATEGORIES = {
    // Fiction
    'Literary Fiction': ['Fiction / Literary', 'Literary Criticism'],
    'Science Fiction': ['Fiction / Science Fiction', 'Science Fiction'],
    'Fantasy': ['Fiction / Fantasy', 'Fantasy'],
    'Mystery & Thriller': ['Fiction / Mystery', 'Fiction / Thrillers', 'Mystery', 'Thriller'],
    'Romance': ['Fiction / Romance', 'Romance'],
    'Historical Fiction': ['Fiction / Historical', 'Historical Fiction'],
    'Horror': ['Fiction / Horror', 'Horror'],
    'Adventure': ['Fiction / Action & Adventure', 'Adventure'],

    // Non-Fiction
    'Biography & Memoir': ['Biography & Autobiography', 'Biography', 'Memoir'],
    'History': ['History', 'Historical'],
    'Philosophy': ['Philosophy'],
    'Psychology': ['Psychology', 'Self-Help'],
    'Science & Nature': ['Science', 'Nature'],
    'Business & Economics': ['Business & Economics', 'Economics'],
    'Politics & Society': ['Political Science', 'Social Science', 'Sociology'],
    'Art & Culture': ['Art', 'Music', 'Performing Arts', 'Cultural'],

    // Poetry & Drama
    'Poetry': ['Poetry'],
    'Drama & Plays': ['Drama', 'Plays'],

    // Other
    'Essays & Criticism': ['Essays', 'Literary Criticism', 'Criticism'],
    'Short Stories': ['Short Stories', 'Fiction / Short Stories'],
} as const;

/**
 * Map Google Books category to our literary category
 */
export function mapToLiteraryCategory(googleCategories?: string[]): string {
    if (!googleCategories || googleCategories.length === 0) {
        return 'General';
    }

    for (const [literaryCategory, googleMaps] of Object.entries(LITERARY_CATEGORIES)) {
        for (const googleCat of googleCategories) {
            if (googleMaps.some(map => googleCat.includes(map))) {
                return literaryCategory;
            }
        }
    }

    return 'General';
}

/**
 * Search Google Books API
 */
export async function searchGoogleBooks(
    query: string,
    options: {
        maxResults?: number;
        startIndex?: number;
        orderBy?: 'relevance' | 'newest';
        filter?: 'ebooks' | 'free-ebooks' | 'paid-ebooks' | 'full' | 'partial';
        langRestrict?: string;
    } = {}
): Promise<GoogleBooksResponse> {
    const params = new URLSearchParams({
        q: query,
        maxResults: (options.maxResults || 20).toString(),
        startIndex: (options.startIndex || 0).toString(),
        orderBy: options.orderBy || 'relevance',
    });

    if (options.filter) {
        params.append('filter', options.filter);
    }

    if (options.langRestrict) {
        params.append('langRestrict', options.langRestrict);
    }

    const url = `${GOOGLE_BOOKS_API_BASE}/volumes?${params.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Google Books API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching from Google Books:', error);
        throw error;
    }
}

/**
 * Get curated contemporary books by category
 */
export async function getContemporaryBooksByCategory(
    category: string,
    limit: number = 20
): Promise<GoogleBook[]> {
    const categoryQueries: Record<string, string> = {
        'Literary Fiction': 'subject:fiction+literary+inauthor:Zadie Smith OR inauthor:Chimamanda Ngozi Adichie OR inauthor:Ocean Vuong',
        'Science Fiction': 'subject:science fiction+inauthor:N.K. Jemisin OR inauthor:Ted Chiang OR inauthor:Becky Chambers',
        'Fantasy': 'subject:fantasy+inauthor:Brandon Sanderson OR inauthor:V.E. Schwab OR inauthor:Leigh Bardugo',
        'Mystery & Thriller': 'subject:mystery+inauthor:Tana French OR inauthor:Ruth Ware OR inauthor:Alex Michaelides',
        'Contemporary Romance': 'subject:romance+contemporary+inauthor:Casey McQuiston OR inauthor:Emily Henry',
        'Historical Fiction': 'subject:historical fiction+inauthor:Anthony Doerr OR inauthor:Kristin Hannah',
        'Non-Fiction': 'subject:nonfiction+inauthor:Malcolm Gladwell OR inauthor:Yuval Noah Harari OR inauthor:Michelle Obama',
        'Poetry': 'subject:poetry+inauthor:Rupi Kaur OR inauthor:Amanda Gorman OR inauthor:Mary Oliver',
    };

    const query = categoryQueries[category] || `subject:${category}`;

    const response = await searchGoogleBooks(query, {
        maxResults: limit,
        orderBy: 'newest',
        langRestrict: 'en',
    });

    return response.items || [];
}

/**
 * Get book details by Google Books ID
 */
export async function getBookById(googleBooksId: string): Promise<GoogleBook> {
    const url = `${GOOGLE_BOOKS_API_BASE}/volumes/${googleBooksId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Google Books API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching book details:', error);
        throw error;
    }
}

/**
 * Check if book has readable content
 */
export function hasReadableContent(book: GoogleBook): {
    hasPreview: boolean;
    hasFullText: boolean;
    isPublicDomain: boolean;
} {
    const accessInfo = book.accessInfo;

    return {
        hasPreview: accessInfo?.viewability === 'PARTIAL' || accessInfo?.viewability === 'ALL_PAGES',
        hasFullText: accessInfo?.viewability === 'ALL_PAGES',
        isPublicDomain: accessInfo?.publicDomain || false,
    };
}

/**
 * Calculate estimated reading time from page count
 */
export function estimateReadingTime(pageCount?: number): number {
    if (!pageCount) return 0;
    // Average: 250 words per page, 250 words per minute reading speed
    return Math.ceil(pageCount); // Returns minutes
}

/**
 * Format author names for display
 */
export function formatAuthors(authors?: string[]): string {
    if (!authors || authors.length === 0) return 'Unknown Author';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return authors.join(' and ');
    return `${authors[0]} and ${authors.length - 1} others`;
}
