require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const admin = mongoose.connection.db.admin();
    const result = await admin.listDatabases();

    for (const db of result.databases) {
        const tempConn = mongoose.connection.useDb(db.name);
        const collections = await tempConn.db.listCollections().toArray();
        const counts = {};
        for (const col of collections) {
            counts[col.name] = await tempConn.db.collection(col.name).countDocuments();
        }
        console.log('\nDB:', db.name, '| Size:', (db.sizeOnDisk / 1024 / 1024).toFixed(2) + ' MB');
        console.log('  Collections:', JSON.stringify(counts));
    }
    process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
