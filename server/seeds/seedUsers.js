const User = require('../models/User');

const seedAdmin = async () => {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
        await User.create({
            name: 'Admin',
            email: 'admin@librasync.com',
            password: 'Admin@123456',
            role: 'admin',
        });
        console.log('Admin user created');
    } else {
        console.log('Admin already exists');
    }
};

module.exports = seedAdmin;
