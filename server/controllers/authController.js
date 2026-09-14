import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const createToken = (userId, role = 'citizen') => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

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

const adminUser = {
    id: 'admin',
    name: 'SmartCity Administrator',
    email: process.env.ADMIN_EMAIL,
    role: 'admin',
    isActive: true,
};

export const register = async (request, response) => {
    try {
        const { name, email, password, phone, profileImage } = request.body;

        if (!name || !email || !password) {
            return response.status(400).json({ message: 'Name, email, and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return response.status(409).json({ message: 'An account with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'citizen',
            phone,
            profileImage,
        });

        const token = createToken(user._id.toString());
        return response.status(201).json({ token, user: publicUser(user) });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to register user' });
    }
};

export const login = async (request, response) => {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({ message: 'Email and password are required' });
        }

        if (email.trim().toLowerCase() === process.env.ADMIN_EMAIL?.trim().toLowerCase() && password === process.env.ADMIN_PASSWORD) {
            const token = createToken('admin', 'admin');
            return response.json({ token, user: adminUser });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
        const passwordMatches = user && (await bcrypt.compare(password, user.password));

        if (!user || !passwordMatches || !user.isActive) {
            return response.status(401).json({ message: 'Invalid email or password' });
        }

        const token = createToken(user._id.toString(), user.role);
        return response.json({ token, user: publicUser(user) });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to log in user' });
    }
};

export const logout = (_request, response) => response.json({
    message: 'Logged out successfully. Remove the token from localStorage.',
});

export const getCurrentUser = async (request, response) => {
    if (request.user.role === 'admin' && request.user.userId === 'admin') {
        return response.json({ user: adminUser });
    }

    const user = await User.findById(request.user.userId);

    if (!user || !user.isActive) {
        return response.status(404).json({ message: 'User not found' });
    }

    return response.json({ user: publicUser(user) });
};