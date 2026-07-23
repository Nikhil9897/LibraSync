require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const books = await Book.find({}, { isbn: 1, title: 1 });
    let updated = 0;

    for (const book of books) {
        if (book.isbn) {
            const cleanIsbn = book.isbn.replace(/-/g, '');
            const coverUrl = 'https://covers.openlibrary.org/b/isbn/' + cleanIsbn + '-L.jpg';
            await Book.updateOne({ _id: book._id }, { coverImage: coverUrl });
            console.log('Updated:', book.title);
            updated++;
        }
    }

    console.log('\nDone! Updated ' + updated + ' book covers to Open Library URLs');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
