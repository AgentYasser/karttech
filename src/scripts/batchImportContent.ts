/**
 * Batch import script to import content for all books missing chapters
 * Run with: npm run import:content or tsx src/scripts/batchImportContent.ts
 */
import { importAllMissingContent } from '../utils/bookContentManager';

async function main() {
    console.log('🚀 Starting batch content import...\n');
    
    const result = await importAllMissingContent((current, total, bookTitle) => {
        console.log(`[${current}/${total}] Processing: ${bookTitle}`);
    });
    
    console.log('\n📊 Import Summary:');
    console.log(`  ✅ Successfully imported: ${result.imported} books`);
    console.log(`  ❌ Failed: ${result.failed} books`);
    
    if (result.errors.length > 0) {
        console.log('\n❌ Errors:');
        result.errors.forEach(({ book, error }) => {
            console.log(`  - ${book}: ${error}`);
        });
    }
    
    console.log('\n✅ Batch import complete!');
    process.exit(0);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

