const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const users = [
    { username: 'hod', password: 'password123', role: 'hod' },
    { username: 'rep_ieee', password: 'password123', role: 'rep', community: 'IEEE' },
    { username: 'rep_csi', password: 'password123', role: 'rep', community: 'CSI' },
    { username: 'student', password: 'password123', role: 'student' }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // clear existing users??? Maybe not if unsafe.
        // But for dev, yes.
        await User.deleteMany({});
        console.log('Users cleared');

        for (const user of users) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            await User.create({
                username: user.username,
                password: hashedPassword,
                role: user.role,
                community: user.community
            });
        }

        console.log('Users seeded successfully');
        console.log('Credentials:');
        users.forEach(u => console.log(`${u.username} / ${u.password} (${u.role})`));

        process.exit();
    } catch (err) {
        console.error('Seeding Error Details:', err);
        process.exit(1);
    }
};

seedDB();
