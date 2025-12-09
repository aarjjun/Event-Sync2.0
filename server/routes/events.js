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
        const newEvent = new Event(req.body); // status defaults to pending
        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Event (Approve, Reject, Edit)
router.put('/:id', async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        const { status, rejectionReason, suggestedDate, suggestedRoom, endTime } = req.body;

        const updateFields = {};
        if (status) updateFields.status = status;
        if (rejectionReason) updateFields.rejectionReason = rejectionReason;
        if (suggestedDate) updateFields.suggestedDate = suggestedDate;
        if (suggestedRoom) updateFields.suggestedRoom = suggestedRoom;
        if (endTime) updateFields.endTime = endTime;

        // TODO: authorization check

        event = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
        );
        res.json(event);
    } catch (err) {
        console.error(err.message);
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
