import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import Issue from '../models/Issue.js';

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

const publicIssue = (issue) => ({
    id: issue._id,
    category: issue.category,
    location: issue.location,
    description: issue.description,
    imageUrl: issue.imageUrl,
    status: issue.status,
    reviewStatus: issue.reviewStatus,
    priority: issue.priority,
    department: issue.department,
    assignedWorker: issue.assignedWorker ? {
        id: issue.assignedWorker._id,
        name: issue.assignedWorker.name,
        department: issue.assignedWorker.department,
    } : null,
    workerProofImage: issue.workerProofImage,
    proofReviewStatus: issue.proofReviewStatus,
    workerCompletionStatus: issue.workerCompletionStatus,
    reporter: issue.reporter ? {
        id: issue.reporter._id,
        name: issue.reporter.name,
        email: issue.reporter.email,
    } : null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
});

export const listIssues = async (_request, response) => {
    try {
        response.set('Cache-Control', 'no-store');
        const issues = await Issue.find().populate('reporter', 'name email').populate('assignedWorker', 'name department').sort({ createdAt: -1 });
        return response.json({ issues: issues.map(publicIssue), total: issues.length });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to load issue reports' });
    }
};

export const updateIssue = async (request, response) => {
    try {
        const { reviewStatus, priority, department, location, assignedWorker, status, proofReviewStatus, workerCompletionStatus } = request.body || {};
        const allowedReviewStatuses = ['Pending verification', 'Verified', 'Rejected'];
        const allowedPriorities = ['Low', 'Medium', 'High', 'Critical'];
        const allowedStatuses = ['Submitted', 'In review', 'In progress', 'Resolved'];
        const allowedProofStatuses = ['Pending review', 'Approved', 'Rejected'];
        const allowedCompletionStatuses = ['Not started', 'In progress', 'Ready for admin review', 'Resolved'];

        if (reviewStatus && !allowedReviewStatuses.includes(reviewStatus)) return response.status(400).json({ message: 'Invalid review status' });
        if (priority && !allowedPriorities.includes(priority)) return response.status(400).json({ message: 'Invalid priority' });
        if (status && !allowedStatuses.includes(status)) return response.status(400).json({ message: 'Invalid issue status' });
        if (proofReviewStatus && !allowedProofStatuses.includes(proofReviewStatus)) return response.status(400).json({ message: 'Invalid proof review status' });
        if (workerCompletionStatus && !allowedCompletionStatuses.includes(workerCompletionStatus)) return response.status(400).json({ message: 'Invalid worker completion status' });

        if (assignedWorker) {
            const worker = await User.findOne({ _id: assignedWorker, role: 'worker' });
            if (!worker) return response.status(400).json({ message: 'Selected worker was not found' });
        }

        const issue = await Issue.findByIdAndUpdate(
            request.params.issueId,
            {
                ...(reviewStatus ? { reviewStatus } : {}),
                ...(priority ? { priority } : {}),
                ...(department !== undefined ? { department } : {}),
                ...(location !== undefined ? { location } : {}),
                ...(status ? { status } : {}),
                ...(proofReviewStatus ? { proofReviewStatus } : {}),
                ...(workerCompletionStatus ? { workerCompletionStatus } : {}),
                ...(assignedWorker !== undefined ? { assignedWorker: assignedWorker || null } : {}),
            },
            { new: true, runValidators: true },
        ).populate('reporter', 'name email').populate('assignedWorker', 'name department');

        if (!issue) return response.status(404).json({ message: 'Issue report not found' });
        return response.json({ issue: publicIssue(issue) });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to update issue report' });
    }
};