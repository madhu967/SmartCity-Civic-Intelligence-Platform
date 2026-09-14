import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['citizen', 'worker', 'admin'],
            default: 'citizen',
            immutable: true,
        },
        phone: {
            type: String,
            trim: true,
            maxlength: 30,
        },
        profileImage: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        department: {
            type: String,
            enum: ['Roads and Infrastructure', 'Sanitation', 'Water Services', 'Public Safety', 'Parks and Recreation', 'Electrical Services'],
        },
        jobSkill: {
            type: String,
            enum: ['Road maintenance', 'Waste management', 'Plumbing', 'Emergency response', 'Landscaping', 'Electrical repair'],
        },
        serviceArea: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        yearsExperience: {
            type: Number,
            min: 0,
            max: 60,
        },
        availability: {
            type: String,
            enum: ['Available', 'On duty', 'Unavailable'],
            default: 'Available',
        },
        location: {
            type: String,
            trim: true,
            maxlength: 120,
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;