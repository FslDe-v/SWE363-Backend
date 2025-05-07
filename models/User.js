import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    studentId: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        required: true,
        enum: ['student', 'staff'],
    },
    interests: {
        social: { type: Number, default: 3, min: 1, max: 5 },
        outdoorsy: { type: Number, default: 3, min: 1, max: 5 },
        creative: { type: Number, default: 3, min: 1, max: 5 },
        intellectual: { type: Number, default: 3, min: 1, max: 5 },
        relaxed: { type: Number, default: 3, min: 1, max: 5 },
    },
});

// Hash the password before saving the user to the database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


export default mongoose.model('User', userSchema);