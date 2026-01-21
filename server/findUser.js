const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const findUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-erp');
        console.log('Connected to MongoDB');

        const email = process.argv[2] || 'venni@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('User found:', {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            });
        } else {
            console.log('User not found with email:', email);
            const allUsers = await User.find({}, 'email name role').limit(10);
            console.log('Sample users in DB:', allUsers);
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findUser();
