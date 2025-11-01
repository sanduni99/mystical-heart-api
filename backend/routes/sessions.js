import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'No token provided' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false,
            message: 'Invalid token' 
        });
    }
};

// ========================================
// SAVE GAME SESSION
// ========================================
router.post('/', authenticate, async (req, res) => {
    try {
        const { score, level, recipesDiscovered, questsCompleted, goldEarned, duration, survived, livesRemaining } = req.body;
        
        
        // Find user and update stats
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Update user stats
        user.stats.gamesPlayed = (user.stats.gamesPlayed || 0) + 1;
        user.stats.totalScore = (user.stats.totalScore || 0) + score;
        user.stats.totalGold = (user.stats.totalGold || 0) + goldEarned;
        
        if (score > user.stats.bestScore) {
            user.stats.bestScore = score;
        }

        // Update level based on score
        if (score >= 300) {
            user.stats.level = 'Master';
        } else if (score >= 150) {
            user.stats.level = 'Expert';
        } else if (score >= 50) {
            user.stats.level = 'Apprentice';
        }

        await user.save();

        res.json({
            success: true,
            message: 'Session saved successfully',
            stats: user.stats
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error saving session',
            error: error.message 
        });
    }
});

export default router;