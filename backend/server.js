import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import leaderboardRoutes from './routes/leaderboard.js';
import puzzleRoutes from './routes/puzzle.js';

// Load environment variables
dotenv.config();

const app = express();

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ========================================
// DATABASE CONNECTION
// ========================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mystical-alchemist')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// ========================================
// ROUTES
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/puzzle', puzzleRoutes);

// Health check route
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'Mystical Alchemist API is running',
        endpoints: [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/leaderboard',
            'POST /api/sessions',
            'GET /api/puzzle'
        ]
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(err.status || 500).json({ 
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

// ========================================
// START SERVER
// ========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});