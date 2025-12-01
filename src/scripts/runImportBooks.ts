// Runner script to import Gutenberg books from command line
import { importAllGutenbergBooks, importBookById } from './importGutenbergBooks';

const args = process.argv.slice(2);

async function main() {
    if (args.length === 0) {
        // Import all books
        console.log('Importing all books from catalog...');
        await importAllGutenbergBooks(undefined, (current, total) => {
            console.log(`Progress: ${current}/${total} books`);
        });
    } else {
        // Import specific book by ID
        const gutenbergId = parseInt(args[0], 10);
        if (isNaN(gutenbergId)) {
            console.error('Please provide a valid Gutenberg ID');
            process.exit(1);
        }

        console.log(`Importing book with Gutenberg ID: ${gutenbergId}...`);
        await importBookById(gutenbergId);
    }
}

main().catch(console.error);
