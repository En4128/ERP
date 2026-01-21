const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const verifyPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-erp');
        console.log('Connected to MongoDB');

        const email = process.argv[2] || 'venni@gmail.com';
        const candidatePassword = process.argv[3];

        if (!candidatePassword) {
            console.error('Usage: node verifyPassword.js <email> <password>');
            process.exit(1);
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found:', email);
            process.exit(1);
        }

        const isMatch = await bcrypt.compare(candidatePassword, user.password);
        console.log(`Password match for ${email}:`, isMatch);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyPassword();
