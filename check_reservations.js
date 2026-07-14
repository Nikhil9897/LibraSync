const mongoose = require('mongoose');
const Book = require('./server/models/Book');
const Reservation = require('./server/models/Reservation');
const User = require('./server/models/User');

require('dotenv').config({ path: './server/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");
        
        const reservations = await Reservation.find();
        console.log("All reservations:", reservations.length);
        if (reservations.length > 0) {
            console.log(reservations);
        }

        const books = await Book.find({ availableCopies: 0 }).limit(1);
        if (books.length === 0) {
            console.log("No books with 0 available copies found. Modifying one book to test reservations...");
            const bookToModify = await Book.findOne();
            if (bookToModify) {
                bookToModify.availableCopies = 0;
                await bookToModify.save();
                console.log(`Modified book '${bookToModify.title}' to have 0 available copies for reservation testing.`);
            } else {
                console.log("No books found in DB.");
            }
        } else {
            console.log(`Found a book with 0 available copies: ${books[0].title}`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
