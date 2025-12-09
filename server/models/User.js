const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['hod', 'rep', 'student', 'admin'],
        required: true
    },
    community: {
        type: String, // Only for 'rep'
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
