const Category = require('../models/Category');

const categories = [
    { name: 'Fiction', icon: '📖', description: 'Novels and stories' },
    { name: 'Science', icon: '🔬', description: 'Scientific works' },
    { name: 'Technology', icon: '💻', description: 'Tech and computing' },
    { name: 'History', icon: '🏛️', description: 'Historical works' },
    { name: 'Philosophy', icon: '🤔', description: 'Philosophical texts' },
    { name: 'Biography', icon: '👤', description: 'Life stories' },
    { name: 'Self-Help', icon: '🌟', description: 'Personal development' },
    { name: 'Fantasy', icon: '🐉', description: 'Fantasy fiction' },
    { name: 'Mystery', icon: '🔍', description: 'Mystery and thriller' },
    { name: 'Poetry', icon: '✍️', description: 'Poetry collections' },
];

const seedCategories = async () => {
    for (const cat of categories) {
        await Category.findOneAndUpdate(
            { name: cat.name },
            cat,
            { upsert: true, new: true }
        );
    }
    console.log(`${categories.length} categories seeded`);
};

module.exports = seedCategories;
