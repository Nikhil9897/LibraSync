const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Connection pool - keep multiple connections ready
            maxPoolSize: 10,
            minPoolSize: 2,
            // Faster failure detection
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            // Heartbeat to keep connections alive
            heartbeatFrequencyMS: 10000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
