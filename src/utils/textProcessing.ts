/**
 * Remove Project Gutenberg and Google Books disclaimers/headers
 */
export function removeDisclaimers(text: string): string {
  let cleaned = text;
  
  // Remove Project Gutenberg headers
  const gutenbergHeaderPatterns = [
    /^.*?\*\*\* START OF THE PROJECT GUTENBERG.*?\*\*\*/is,
    /^.*?\*\*\* START OF THIS PROJECT GUTENBERG.*?\*\*\*/is,
    /^.*?Project Gutenberg.*?EBook.*?/is,
    /^.*?This eBook is for the use of anyone anywhere.*?/is,
    /^.*?Title:.*?Author:.*?Release Date:.*?\[EBook #\d+\].*?/is,
  ];
  
  gutenbergHeaderPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Remove Project Gutenberg footers
  const gutenbergFooterPatterns = [
    /\*\*\* END OF THE PROJECT GUTENBERG.*$/is,
    /\*\*\* END OF THIS PROJECT GUTENBERG.*$/is,
    /End of the Project Gutenberg.*$/is,
    /End of Project Gutenberg.*$/is,
    /End of this Project Gutenberg.*$/is,
  ];
  
  gutenbergFooterPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Remove Google Books disclaimers
  const googleDisclaimers = [
    /This is a digital copy of a book.*?Google Books\./is,
    /Google is proud to partner with libraries.*?/is,
    /This book was digitized.*?Google\./is,
  ];
  
  googleDisclaimers.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Clean up multiple newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

/**
 * Add spacing between chapters for better readability
 */
export function formatChapterContent(content: string): string {
  // Split by double newlines (paragraphs)
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  
  // Join with proper spacing
  return paragraphs.join('\n\n');
}

/**
 * Calculate reading pages (excluding disclaimers)
 * Assumes ~250 words per page
 */
export function calculateReadingPages(text: string): number {
  const cleaned = removeDisclaimers(text);
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  return Math.ceil(words.length / 250);
}

/**
 * Get actual reading content (first N pages, excluding disclaimers)
 */
export function getReadingContent(text: string, maxPages: number = 2): string {
  const cleaned = removeDisclaimers(text);
  const words = cleaned.split(/\s+/);
  const wordsPerPage = 250;
  const maxWords = maxPages * wordsPerPage;
  
  if (words.length <= maxWords) {
    return cleaned;
  }
  
  const limitedWords = words.slice(0, maxWords);
  return limitedWords.join(' ');
}

/**
 * Format text with proper chapter spacing
 * Adds visual separations between chapters and paragraphs for better readability
 */
export function formatTextWithSpacing(text: string): string {
  // Remove disclaimers first
  let cleaned = removeDisclaimers(text);
  
  // Detect chapter markers (Chapter X, CHAPTER X, Chapter X:, etc.)
  const chapterPattern = /^(Chapter\s+\d+|CHAPTER\s+\d+|Chapter\s+\d+[:.]|CHAPTER\s+\d+[:.])/gmi;
  
  // Split by chapter markers
  const parts = cleaned.split(chapterPattern);
  
  if (parts.length > 1) {
    // Reconstruct with chapter markers and extra spacing
    let formatted = parts[0];
    for (let i = 1; i < parts.length; i += 2) {
      const chapterMarker = parts[i];
      const chapterContent = parts[i + 1] || '';
      
      // Add extra spacing before each chapter (except first)
      if (i > 1) {
        formatted += '\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
      }
      
      formatted += chapterMarker;
      if (chapterContent && !chapterContent.startsWith('\n')) {
        formatted += '\n\n';
      }
      formatted += chapterContent;
    }
    cleaned = formatted;
  }
  
  // Format paragraphs with proper spacing
  cleaned = formatChapterContent(cleaned);
  
  // Ensure consistent spacing between paragraphs (double newline = one blank line)
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n'); // Max 3 newlines (one blank line between)
  
  // Add extra spacing after section breaks (multiple blank lines indicate scene breaks)
  cleaned = cleaned.replace(/\n\n\n+/g, '\n\n\n'); // Normalize to max one blank line
  
  return cleaned;
}

