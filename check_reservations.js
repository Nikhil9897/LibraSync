const mongoose = require('mongoose');
const Book = require('./server/models/Book');
const Reservation = require('./server/models/Reservation');
const User = require('./server/models/User');

const MONGODB_URI = "mongodb://adminnik:23l5WYIQIXSq3TEh@ac-gyhcr3z-shard-00-00.fk6oule.mongodb.net:27017,ac-gyhcr3z-shard-00-01.fk6oule.mongodb.net:27017,ac-gyhcr3z-shard-00-02.fk6oule.mongodb.net:27017/librasync?ssl=true&authSource=admin&replicaSet=atlas-sjphuz-shard-0&retryWrites=true&w=majority&appName=Cluster0";

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
