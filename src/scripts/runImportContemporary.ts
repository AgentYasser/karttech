// Runner script for importing contemporary books
import { importContemporaryBooks } from './importContemporaryBooks';

const args = process.argv.slice(2);
const booksPerCategory = args[0] ? parseInt(args[0], 10) : 10;

async function main() {
    console.log(`Importing ${booksPerCategory} books per category...`);

    await importContemporaryBooks(booksPerCategory, (category, current, total) => {
        console.log(`  ${category}: ${current}/${total}`);
    });
}

main().catch(console.error);
