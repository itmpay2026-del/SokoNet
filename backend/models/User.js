const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    skills: [{ type: String }],
    ratings: { type: Number, min: 0, max: 5 },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    }
}, {
    timestamps: true
});

userSchema.index({ location: "2dsphere" });

const User = mongoose.model('User', userSchema);

module.exports = User;