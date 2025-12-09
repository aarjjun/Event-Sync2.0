const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
// Middleware to verify token would go here, omitting for brevity in initial setup but should be added.
// Assuming we have an 'auth' middleware.

// Get Events
// TODO: Filter based on user role (query params or auth context)
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create Event
router.post('/', async (req, res) => {
    try {
        console.log('Create Event Body:', req.body); // Debug log
        const newEvent = new Event(req.body); // status defaults to pending
        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error('Create Event Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// Update Event (Approve, Reject, Edit)
router.put('/:id', async (req, res) => {
    try {
        console.log('Update Event Body:', req.body); // Debug log
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        const {
            title, community, type, description, date, time, endTime, room, posterLink, registrationLink, // Standard fields
            status, rejectionReason, suggestedDate, suggestedRoom // Action fields
        } = req.body;

        const updateFields = {};

        // Standard Fields
        if (title) updateFields.title = title;
        if (community) updateFields.community = community;
        if (type) updateFields.type = type;
        if (description) updateFields.description = description;
        if (date) updateFields.date = date;
        if (time) updateFields.time = time;
        if (endTime) updateFields.endTime = endTime;
        if (room) updateFields.room = room;
        if (posterLink) updateFields.posterLink = posterLink;
        if (registrationLink) updateFields.registrationLink = registrationLink;

        // Action Fields
        if (status) updateFields.status = status;
        if (rejectionReason) updateFields.rejectionReason = rejectionReason;
        if (suggestedDate) updateFields.suggestedDate = suggestedDate;
        if (suggestedRoom) updateFields.suggestedRoom = suggestedRoom;

        // TODO: authorization check

        event = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );
        res.json(event);
    } catch (err) {
        console.error('Update Event Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// Delete Event
router.delete('/:id', async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        await Event.findByIdAndRemove(req.params.id);
        res.json({ msg: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
