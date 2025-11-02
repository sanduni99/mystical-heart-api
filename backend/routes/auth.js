import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();

// ========================================
// REGISTER
// ========================================
router.post('/register', async (req, res) => {
    try {
        
        const { username, email, password, avatar, specialty } = req.body;
        
        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Username, email and password are required' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: 'Password must be at least 6 characters' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'User with this email or username already exists' 
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password, // Will be hashed by the pre-save hook
            avatar: avatar || '🧙‍♀️',
            specialty: specialty || 'Potion Master',
            tutorialCompleted: false,
            stats: {
                bestScore: 0,
                level: 'Apprentice',
                gamesPlayed: 0,
                totalGold: 0,
                totalScore: 0
            }
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username 
            },
            process.env.JWT_SECRET || 'secret-key',
            { expiresIn: '7d' }
        );

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                specialty: user.specialty,
                tutorialCompleted: user.tutorialCompleted,
                stats: user.stats
            }
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration',
            error: error.message 
        });
    }
});

// ========================================
// LOGIN
// ========================================
router.post('/login', async (req, res) => {
    try {
        
        const { username, password } = req.body;
        
        // Validation
        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Email and password are required' 
            });
        }

        // Find user by email
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username 
            },
            process.env.JWT_SECRET || 'secret-key',
            { expiresIn: '7d' }
        );


        // Return success response
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                specialty: user.specialty,
                tutorialCompleted: user.tutorialCompleted,
                stats: user.stats
            }
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error during login' 
        });
    }
});

// -----Pofile Update Endpoint-----

// GET USER PROFILE
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                specialty: user.specialty,
                tutorialCompleted: user.tutorialCompleted,
                stats: user.stats,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
});

// UPDATE PROFILE (Username, Avatar, Specialty)
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { username, avatar, specialty } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if username is taken by another user
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Username already taken' });
            }
            user.username = username;
        }

        if (avatar) user.avatar = avatar;
        if (specialty) user.specialty = specialty;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                specialty: user.specialty,
                tutorialCompleted: user.tutorialCompleted,
                stats: user.stats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
});

// CHANGE PASSWORD
router.put('/change-password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both passwords required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error changing password' });
    }
});

// DELETE ACCOUNT
router.delete('/account', authenticate, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: 'Password required to delete account' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify password before deletion
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Incorrect password' });
        }

        await User.findByIdAndDelete(req.userId);

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting account' });
    }
});

// Add authenticate middleware at the end if not already there
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

export default router;