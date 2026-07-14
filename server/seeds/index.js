const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const seedAdmin = require('./seedUsers');
const seedCategories = require('./seedCategories');
const seedBooks = require('./seedBooks');

const seedAll = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB...');

  await seedCategories();
  await seedAdmin();
  await seedBooks();

  console.log('All seed data loaded!');
  process.exit(0);
};

seedAll();
