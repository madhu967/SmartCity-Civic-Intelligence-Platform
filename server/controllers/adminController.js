import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    profileImage: user.profileImage,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    department: user.department,
    jobSkill: user.jobSkill,
    serviceArea: user.serviceArea,
    yearsExperience: user.yearsExperience,
    availability: user.availability,
    location: user.location,
});

export const createWorker = async (request, response) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            department,
            jobSkill,
            serviceArea,
            yearsExperience,
            availability,
            location,
        } = request.body || {};

        if (!name || !email || !password || !phone || !department || !jobSkill || !serviceArea || yearsExperience === undefined || !location) {
            return response.status(400).json({ message: 'All worker fields are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser || normalizedEmail === process.env.ADMIN_EMAIL?.trim().toLowerCase()) {
            return response.status(409).json({ message: 'An account with this email already exists' });
        }

        const worker = await User.create({
            name,
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12),
            role: 'worker',
            phone,
            department,
            jobSkill,
            serviceArea,
            yearsExperience,
            availability: availability || 'Available',
            location,
        });

        return response.status(201).json({ worker: publicUser(worker) });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return response.status(400).json({ message: 'Worker data is invalid', details: error.message });
        }

        if (error.code === 11000) {
            return response.status(409).json({ message: 'An account with this email already exists' });
        }

        return response.status(500).json({ message: 'Unable to create worker', details: error.message });
    }
};

export const listWorkers = async (_request, response) => {
    try {
        const workers = await User.find({ role: 'worker' }).sort({ createdAt: -1 });
        return response.json({ workers: workers.map(publicUser), total: workers.length });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to load workers' });
    }
};

export const listUsers = async (_request, response) => {
    try {
        const users = await User.find({ role: 'citizen' }).sort({ createdAt: -1 });
        return response.json({ users: users.map(publicUser), total: users.length });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to load users' });
    }
};

export const updateUserStatus = async (request, response) => {
    try {
        const user = await User.findByIdAndUpdate(
            request.params.userId,
            { isActive: request.body.isActive },
            { new: true, runValidators: true },
        );

        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }

        return response.json({ user: publicUser(user) });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to update user' });
    }
};