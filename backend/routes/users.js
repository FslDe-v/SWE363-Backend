import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Staff
router.get('/', protect, async (req, res) => {
    // Check if the logged-in user is staff
    console.log('User account type:', req.user.accountType);
    if (req.user.accountType !== 'staff') {
        return res.status(403).json({ message: 'Not authorized, staff only' });
    }

    try {
        // Fetch all users, excluding the password field
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

export default router;
