const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    community: { type: String, required: true },
    type: { type: String, required: true }, // Workshop, Seminar, etc.
    description: { type: String, required: true },
    date: { type: String, required: true }, // Keeping as String for simplicity with FullCalendar or Date object? Spec says structure has date string.
    time: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, required: true },
    posterLink: { type: String, required: true },
    registrationLink: { type: String },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    // HOD Suggestions/Actions
    suggestedDate: { type: String },
    suggestedRoom: { type: String },
    rejectionReason: { type: String },
    hodComments: { type: String },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Rep who created it
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
