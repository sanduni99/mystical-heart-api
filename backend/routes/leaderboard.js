import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// ========================================
// GET LEADERBOARD
// ========================================
router.get('/', async (req, res) => {
    try {
        
        // Get top 100 users sorted by best score
        const topUsers = await User.find()
            .sort({ 'stats.bestScore': -1 })
            .limit(100)
            .select('username avatar stats.bestScore stats.level');

        // Format leaderboard data
        const leaderboard = topUsers.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            avatar: user.avatar,
            bestScore: user.stats.bestScore || 0,
            level: user.stats.level || 'Apprentice'
        }));


        res.json(leaderboard);

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching leaderboard',
            error: error.message 
        });
    }
});

export default router;