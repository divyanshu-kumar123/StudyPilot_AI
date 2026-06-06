const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false }, // select: false prevents password leaking in queries
    profileImage: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isEmailVerified: { type: Boolean, default: false },
    authProvider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
    learningLevel: { type: String, default: '' },
    preferredSubjects: [{ type: String }],
    studyGoal: { type: String, default: '' },
    timezone: { type: String, default: 'UTC' },
    lastLoginAt: { type: Date }
}, {
    timestamps: true 
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save hook to hash passwords
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return next();
    // 12 salt rounds is the current industry sweet spot for security vs performance
    this.password = await bcrypt.hash(this.password, 12); 
});

// Instance method to check password validity
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;