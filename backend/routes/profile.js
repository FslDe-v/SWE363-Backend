import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js'; // Import the protect middleware

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
router.get('/', protect, async (req, res) => {
    // req.user is attached by the protect middleware
    if (!req.user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(req.user);
});


// @desc    Update user profile
// @route   PUT /api/profile/update
// @access  Private
router.put('/update', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User found:', req.body);

        const { name, email, studentId, interestRatings } = req.body;

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            user.email = email;
        }
        if (studentId && studentId !== user.studentId) {
            const studentIdExists = await User.findOne({ studentId });
            if (studentIdExists) {
                return res.status(400).json({ message: 'Student ID already exists' });
            }
            user.studentId = studentId;
        }

        user.fullName = name || user.fullName;

        user.interests = interestRatings || user.interests;

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            studentId: updatedUser.studentId,
            accountType: updatedUser.accountType,
            interests: updatedUser.interests,
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        // Handle potential validation errors or other issues
        if (error.name === 'ValidationError') {
             return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error updating profile' });
    }
});

export default router;
