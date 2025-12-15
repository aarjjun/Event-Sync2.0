const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, community, name } = req.body; // Remove role from body

        // Check if user exists
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            name: name || username,
            password: hashedPassword,
            role: 'student', // Force student role
            community
        });

        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin: Create Custom User (Explicitly create Rep/Admin)
router.post('/register-custom', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Strict Admin Only Check
        if (decoded.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }

        const { username, password, role, community, name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ msg: 'Full Name is required for new users.' });
        }

        // Check if user exists
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            name: name || username,
            password: hashedPassword,
            role,
            community
        });

        await user.save();
        res.status(201).json({ msg: `User ${username} created as ${role}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin: Get All Users
router.get('/users', async (req, res) => {
    try {
        // Simple Admin Check (Manually decoding for now as we don't have global middleware set up for this specific route structure yet)
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Allow Admin OR HOD to view users (HOD needs it for HODDashboard)
        if (decoded.user.role !== 'admin' && decoded.user.role !== 'hod') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin: Update User Role
router.put('/users/:id/role', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Allow Admin OR HOD to update roles
        if (decoded.user.role !== 'admin' && decoded.user.role !== 'hod') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const { role, community } = req.body;
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ msg: 'User not found' });

        // Security: HOD Restraints
        if (decoded.user.role === 'hod') {
            // Cannot change role of an Admin or another HOD
            if (targetUser.role === 'admin' || targetUser.role === 'hod') {
                return res.status(403).json({ msg: 'HODs cannot modify Admin or HOD accounts.' });
            }
            // Cannot promote TO Admin or HOD
            if (role === 'admin' || role === 'hod') {
                return res.status(403).json({ msg: 'HODs cannot promote users to Admin/HOD level.' });
            }
        }

        const updateData = { role };
        if (community !== undefined) {
            updateData.community = community;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin/HOD: Reset User Password (Manual Override)
router.put('/users/:id/reset-password', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Allow Admin OR HOD
        if (decoded.user.role !== 'admin' && decoded.user.role !== 'hod') {
            return res.status(403).json({ msg: 'Access denied. Admins/HODs only.' });
        }

        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ msg: 'User not found' });

        // Security: HOD Restrictions
        if (decoded.user.role === 'hod') {
            if (targetUser.role === 'admin' || targetUser.role === 'hod') {
                return res.status(403).json({ msg: 'HODs cannot reset Admin/HOD passwords.' });
            }
        }

        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });

        res.json({ msg: 'Password reset successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// User: Change Own Password
router.put('/change-password', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid current password' });

        if (newPassword.length < 6) return res.status(400).json({ msg: 'New password must be at least 6 characters' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// User: Update Profile (Name - One Time Only)
router.put('/profile', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user.id;
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ msg: 'Name cannot be empty' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (user.name && user.name !== user.username) {
            return res.status(403).json({ msg: 'Name is already verified and cannot be changed. Contact Admin/HOD.' });
        }

        user.name = name;
        await user.save();

        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        console.log('Received Login Body:', req.body);
        const { username, password } = req.body;

        // Check user
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Return JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role,
                community: user.community
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, id: user.id, role: user.role, community: user.community, name: user.name || user.username });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin/HOD: Update User Profile (Force Name Change etc)
router.put('/users/:id/profile-admin', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Strict Admin Only Check
        if (decoded.user.role !== 'admin' && decoded.user.role !== 'hod') {
            return res.status(403).json({ msg: 'Access denied. Admins/HODs only.' });
        }

        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ msg: 'User not found' });

        // Security: HOD Restraints
        if (decoded.user.role === 'hod') {
            if (targetUser.role === 'admin' || targetUser.role === 'hod') {
                return res.status(403).json({ msg: 'HODs cannot modify Admin/HOD accounts.' });
            }
        }

        const { name } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { name: name } },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin: Delete User
router.delete('/users/:id', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Strict Admin Only Check
        if (decoded.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }

        // Prevent Admin from deleting themselves
        if (req.params.id === decoded.user.id) {
            return res.status(400).json({ msg: 'You cannot delete your own account.' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
