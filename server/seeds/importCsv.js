const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const csv = require('csv-parser');
const Book = require('../models/Book');
const Category = require('../models/Category');
dotenv.config({ path: '../.env' }); // Make sure we load the right .env since this will be run from seeds dir or server dir

const CSV_FILE = 'C:\\Users\\agnik\\Downloads\\google_books_dataset.csv';
const MAX_BOOKS = 200;

async function run() {
    try {
        // Find .env depending on execution dir
        const envPath = fs.existsSync('.env') ? '.env' : '../.env';
        dotenv.config({ path: envPath });

        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const results = [];

        // Create a default category just in case
        let defaultCategory = await Category.findOne({ name: 'General' });
        if (!defaultCategory) {
            defaultCategory = await Category.create({ name: 'General', description: 'General books' });
        }

        // Cache categories
        const categoryMap = new Map();

        console.log('Reading CSV file...');
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (data) => {
                if (results.length < MAX_BOOKS) {
                    results.push(data);
                }
            })
            .on('end', async () => {
                console.log(`Parsed ${results.length} rows. Starting import...`);
                let insertedCount = 0;

                for (const row of results) {
                    try {
                        // get or create category
                        let categoryId = defaultCategory._id;
                        let catNames = row.categories ? row.categories.split(',') : [];
                        if (catNames.length > 0) {
                            let mainCatName = catNames[0].trim();
                            if (mainCatName) {
                                if (categoryMap.has(mainCatName)) {
                                    categoryId = categoryMap.get(mainCatName);
                                } else {
                                    let cat = await Category.findOne({ name: mainCatName });
                                    if (!cat) {
                                        cat = await Category.create({ name: mainCatName });
                                    }
                                    categoryMap.set(mainCatName, cat._id);
                                    categoryId = cat._id;
                                }
                            }
                        }

                        // prepare book
                        const isbn = row.isbn_13 || row.isbn_10 || `ISBN-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

                        const bookExists = await Book.findOne({ isbn });
                        if (!bookExists) {
                            const totalCopies = Math.floor(Math.random() * 10) + 1; // 1 to 10 copies
                            const book = new Book({
                                title: row.title || 'Unknown Title',
                                author: row.authors || 'Unknown Author',
                                isbn: isbn,
                                description: row.description || '',
                                publisher: row.publisher || 'Unknown Publisher',
                                publishedDate: row.published_date ? new Date(row.published_date) : new Date(),
                                pageCount: parseInt(row.page_count) || 100,
                                coverImage: row.thumbnail || '',
                                category: categoryId,
                                genres: catNames.map(c => c.trim()),
                                language: row.language || 'en',
                                totalCopies: totalCopies,
                                availableCopies: totalCopies,
                                averageRating: parseFloat(row.average_rating) || 0,
                                numReviews: parseInt(row.ratings_count) || 0,
                            });
                            await book.save();

                            // Update category count
                            await Category.findByIdAndUpdate(categoryId, { $inc: { bookCount: 1 } });

                            insertedCount++;
                            if (insertedCount % 50 === 0) {
                                console.log(`Imported ${insertedCount} books...`);
                            }
                        }
                    } catch (err) {
                        console.error(`Failed to insert book "${row.title}":`, err.message);
                    }
                }

                console.log(`Successfully inserted ${insertedCount} new books.`);
                process.exit(0);
            });
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
