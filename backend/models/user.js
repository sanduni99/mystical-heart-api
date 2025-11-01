import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    avatar: { 
        type: String, 
        default: '🧙‍♀️' 
    },
    specialty: { 
        type: String, 
        default: 'Potion Master' 
    },
    tutorialCompleted: { 
        type: Boolean, 
        default: false 
    },
    stats: {
        bestScore: { type: Number, default: 0 },
        level: { type: String, default: 'Apprentice' },
        gamesPlayed: { type: Number, default: 0 },
        totalGold: { type: Number, default: 0 },
        totalScore: { type: Number, default: 0 }
    }
}, { 
    timestamps: true 
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;