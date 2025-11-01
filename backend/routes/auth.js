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

export default router;