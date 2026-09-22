const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins (lock this down to your Vercel frontend URL in production)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));
app.use(express.json());

// Database Connection
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log('MongoDB Atlas Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
    }
};
connectDB();

// Routes
app.get('/', (req, res) => {
    res.send('EventSync Backend is Running');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));

// Export app for Vercel serverless — also listen locally
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
