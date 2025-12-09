const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
require('dotenv').config(); // Adjusted path assuming script is run from server/scripts or we run from server root. Let's assume run from server root for safety or try both.

const seed = async () => {
    try {
        console.log('URI:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Clear Database
        console.log('Clearing Database...');
        await User.deleteMany({});
        await Event.deleteMany({});

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashHOD = await bcrypt.hash('hodtist2025', salt);
        // Admin password - keeping it simple for now or same as hod? User said "Admin Arjun(Who is me the admin with full power)". Let's set a default strong password or 'admin123' and let him change it? 
        // Or wait, "HOD (pass:hodtist2025)". He didn't specify Admin pass. I'll use 'admin123' for now and tell him.
        const hashAdmin = await bcrypt.hash('admin123', salt);

        // Create Users
        const users = [
            {
                username: 'HOD',
                password: hashHOD,
                role: 'hod',
                community: 'Computer Science' // Default community
            },
            {
                username: 'Arjun',
                password: hashAdmin,
                role: 'admin',
                community: 'Admin'
            }
        ];

        await User.insertMany(users);
        console.log('Production Users Seeded:');
        console.log('1. HOD (pass: hodtist2025)');
        console.log('2. Arjun (pass: admin123) - Please change this!');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
