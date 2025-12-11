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
        enum: ['hod', 'rep', 'student', 'admin', 'teacher'],
        required: true
    },
    community: {
        type: String, // Only for 'rep'
        default: null
    },
    name: {
        type: String,
        default: function () { return this.username; } // Default to username for existing/new docs if not provided
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
