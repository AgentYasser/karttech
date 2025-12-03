// Systematic verification of all books and their content
import { supabase } from '../integrations/supabase/client';

async function verifyAllBooks() {
  console.log('🔍 SYSTEMATIC BOOK VERIFICATION\n');
  console.log('='.repeat(80));
  
  // Step 1: Count total books
  console.log('\n📊 Step 1: Counting total books...\n');
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('id, title, author, gutenberg_id, content_available')
    .order('title');
  
  if (booksError) {
    console.error('❌ Error fetching books:', booksError);
    return;
  }
  
  console.log(`✅ Total Books Found: ${books.length}\n`);
  console.log('='.repeat(80));
  
  // Step 2: Check each book for content
  console.log('\n📚 Step 2: Verifying content for EVERY book...\n');
  
  let booksWithContent = 0;
  let booksWithoutContent = 0;
  let totalChapters = 0;
  
  const results = [];
  const missingBooks: any[] = [];
  
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const progress = `[${i + 1}/${books.length}]`;
    
    // Count chapters for this book
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, chapter_number, title, content')
      .eq('book_id', book.id)
      .order('chapter_number');
    
    const chapterCount = chapters?.length || 0;
    const hasContent = chapterCount > 0;
    const contentLength = chapters?.reduce((sum, ch) => sum + (ch.content?.length || 0), 0) || 0;
    
    if (hasContent) {
      booksWithContent++;
      totalChapters += chapterCount;
      console.log(`${progress} ✅ ${book.title} by ${book.author}`);
      console.log(`       └─ ${chapterCount} chapters, ${Math.round(contentLength / 1000)}KB content`);
    } else {
      booksWithoutContent++;
      missingBooks.push({
        title: book.title,
        author: book.author,
        gutenberg_id: book.gutenberg_id
      });
      console.log(`${progress} ❌ ${book.title} by ${book.author}`);
      console.log(`       └─ NO CONTENT (Gutenberg ID: ${book.gutenberg_id || 'N/A'})`);
    }
    
    results.push({
      title: book.title,
      author: book.author,
      gutenberg_id: book.gutenberg_id,
      content_available_flag: book.content_available,
      actual_chapters: chapterCount,
      actual_content_kb: Math.round(contentLength / 1000),
      status: hasContent ? '✅ HAS CONTENT' : '❌ MISSING'
    });
  }
  
  // Step 3: Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 FINAL SUMMARY:\n');
  console.log(`Total Books:           ${books.length}`);
  console.log(`✅ With Content:       ${booksWithContent} (${Math.round((booksWithContent / books.length) * 100)}%)`);
  console.log(`❌ Without Content:    ${booksWithoutContent} (${Math.round((booksWithoutContent / books.length) * 100)}%)`);
  console.log(`📖 Total Chapters:     ${totalChapters}`);
  
  // Step 4: Show books missing content
  if (booksWithoutContent > 0) {
    console.log('\n⚠️  BOOKS MISSING CONTENT:\n');
    missingBooks.forEach(book => {
      console.log(`   • ${book.title} by ${book.author} (Gutenberg ID: ${book.gutenberg_id || 'N/A'})`);
    });
    
    console.log(`\n💡 To import missing content, run:`);
    console.log(`   Invoke Edge Function with: { "action": "import_all_content" }`);
  } else {
    console.log('\n🎉 ALL BOOKS HAVE CONTENT! Library is complete!');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Verification Complete!\n');
}

verifyAllBooks().catch(console.error);

