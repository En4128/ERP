const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp';

async function testConnection() {
    try {
        console.log('Testing connection to:', MONGO_URI);
        const conn = await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        console.log('Connection successful!');

        const User = mongoose.model('User', new mongoose.Schema({ email: String }));
        console.log('Attempting findOne()...');
        const user = await User.findOne({}).maxTimeMS(2000);
        console.log('Query successful! User found:', user ? user.email : 'None');

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testConnection();
