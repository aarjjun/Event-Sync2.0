const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');
// Middleware to verify token would go here, omitting for brevity in initial setup but should be added.
// Assuming we have an 'auth' middleware.

// Get Events
// TODO: Filter based on user role (query params or auth context)
router.get('/', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        let query = {};

        // If authenticated, filter based on role
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const role = decoded.user.role;
                console.log('GET /events Role:', role); // Debug Log

                if (role === 'student' || role === 'rep') {
                    // Students/Reps: See Student events OR events with no targetAudience (legacy)
                    query = {
                        $or: [
                            { targetAudience: 'student' },
                            { targetAudience: { $exists: false } },
                            { targetAudience: null } // Extra safety
                        ]
                    };
                } else if (role === 'teacher') {
                    // Teachers: See Teacher events AND Student events
                    query = {
                        $or: [
                            { targetAudience: 'student' },
                            { targetAudience: 'teacher' },
                            { targetAudience: { $exists: false } },
                            { targetAudience: null }
                        ]
                    };
                }
                // Admin & HOD see ALL (empty query)
            } catch (err) {
                console.error('Token verification failed in GET /events', err);
                // Fallback: public view (legacy support)
                query = {
                    status: 'approved',
                    $or: [
                        { targetAudience: 'student' },
                        { targetAudience: { $exists: false } }
                    ]
                };
            }
        } else {
            // Public/Guest view: Only approved student events (legacy support)
            query = {
                status: 'approved',
                $or: [
                    { targetAudience: 'student' },
                    { targetAudience: { $exists: false } }
                ]
            };
        }

        console.log('GET /events Query:', JSON.stringify(query)); // Debug Log

        const events = await Event.find(query)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username community name');
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create Event
router.post('/', async (req, res) => {
    try {
        console.log('Create Event Body:', req.body);

        // Authorization & Validation Logic
        // In a real app, we should use middleware to get req.user
        // For now, we trust the client sends valid data, but we should validate based on presumed role if possible,
        // or rely on the frontend to send the right things. 
        // Ideally, we decode the token here again to be safe.
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userRole = decoded.user.role;

        // Force targetAudience based on role constraints
        // Reps can ONLY create for students
        if (userRole === 'rep' && req.body.targetAudience === 'teacher') {
            return res.status(403).json({ msg: 'Reps cannot create events for teachers.' });
        }

        const newEvent = new Event({
            ...req.body,
            createdBy: decoded.user.id
        });

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
        console.log('Update Event Body:', req.body);
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        const {
            title, community, type, description, date, time, endTime, room, posterLink, registrationLink,
            status, rejectionReason, suggestedDate, suggestedRoom, targetAudience
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
        if (targetAudience) updateFields.targetAudience = targetAudience;

        // Action Fields
        if (status) updateFields.status = status;
        if (rejectionReason) updateFields.rejectionReason = rejectionReason;
        if (suggestedDate) updateFields.suggestedDate = suggestedDate;
        if (suggestedRoom) updateFields.suggestedRoom = suggestedRoom;

        // Security Check: Only Admin, HOD, or Creator can edit
        const token = req.header('x-auth-token');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userRole = decoded.user.role;
        const userId = decoded.user.id;

        if (userRole !== 'admin' && userRole !== 'hod') {
            if (event.createdBy.toString() !== userId) {
                return res.status(403).json({ msg: 'Not authorized to edit this event' });
            }
        }

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

        // Security Check: Only Admin, HOD, or Creator can delete
        const token = req.header('x-auth-token');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userRole = decoded.user.role;
        const userId = decoded.user.id;

        if (userRole !== 'admin' && userRole !== 'hod') {
            if (event.createdBy.toString() !== userId) {
                return res.status(403).json({ msg: 'Not authorized to delete this event' });
            }
        }

        await Event.findByIdAndRemove(req.params.id);
        res.json({ msg: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
