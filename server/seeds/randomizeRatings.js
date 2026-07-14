const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Book = require('../models/Book');

async function run() {
    try {
        const envPath = fs.existsSync('.env') ? '.env' : '../.env';
        dotenv.config({ path: envPath });

        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const books = await Book.find();
        console.log(`Found ${books.length} books. Updating ratings...`);

        let updateCount = 0;
        for (const book of books) {
            // Give them a random rating between 3.0 and 5.0
            const randomRating = (Math.random() * 2) + 3;
            // Give them a random number of reviews between 1 and 100
            const randomNumReviews = Math.floor(Math.random() * 100) + 1;

            book.averageRating = Number(randomRating.toFixed(1));
            book.numReviews = randomNumReviews;
            await book.save();
            updateCount++;
        }

        console.log(`Successfully updated ratings for ${updateCount} books.`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
