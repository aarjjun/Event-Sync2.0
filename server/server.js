const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Atlas Connected'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        // process.exit(1); // Optional: Exit if DB connection fails
    });

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('EventSync Backend is Running');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
