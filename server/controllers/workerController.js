import User from '../models/User.js';
import Issue from '../models/Issue.js';
import { uploadIssueImage } from './issueController.js';

const workerIssue = (issue) => ({
    id: issue._id,
    category: issue.category,
    location: issue.location,
    latitude: issue.latitude,
    longitude: issue.longitude,
    description: issue.description,
    aiTitle: issue.aiTitle,
    aiDescription: issue.aiDescription,
    aiDetectedCategory: issue.aiDetectedCategory,
    aiSummary: issue.aiSummary,
    imageUrl: issue.imageUrl,
    status: issue.status,
    priority: issue.priority || 'Medium',
    department: issue.department,
    reportCount: issue.reportCount || 1,
    workerProofImage: issue.workerProofImage,
    proofReviewStatus: issue.proofReviewStatus,
    workerCompletionStatus: issue.workerCompletionStatus,
    reporter: issue.reporter ? {
        id: issue.reporter._id || issue.reporter,
        name: issue.reporter.name,
        phone: issue.reporter.phone,
        email: issue.reporter.email,
    } : null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
});

export const listAssignedIssues = async (request, response) => {
    try {
        response.set('Cache-Control', 'no-store');
        const issues = await Issue.find({ assignedWorker: request.user.userId })
            .populate('reporter', 'name phone email')
            .sort({ createdAt: -1 });
        return response.json({ issues: issues.map(workerIssue) });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to load assigned issues' });
    }
};

export const updateAssignedIssue = async (request, response) => {
    try {
        const { status, proofImage } = request.body || {};
        if (status && !['In progress', 'Ready for admin review'].includes(status)) return response.status(400).json({ message: 'Workers can only update progress or submit work for admin review' });
        if (proofImage && (!proofImage.startsWith('data:image/') || proofImage.length > 7 * 1024 * 1024)) return response.status(400).json({ message: 'Please upload an image smaller than 5 MB' });

        const issue = await Issue.findOne({ _id: request.params.issueId, assignedWorker: request.user.userId });
        if (!issue) return response.status(404).json({ message: 'Assigned issue not found' });

        if (proofImage) {
            try {
                issue.workerProofImage = process.env.ISSUE_IMAGE_DATABASE_FALLBACK === 'true' ? proofImage : await uploadIssueImage(proofImage);
                issue.proofReviewStatus = 'Pending review';
            } catch (error) {
                return response.status(502).json({ message: error.message });
            }
        }
        if (status === 'In progress') {
            issue.status = 'In progress';
            issue.workerCompletionStatus = 'In progress';
        }
        if (status === 'Ready for admin review' || proofImage) {
            issue.status = 'In review';
            issue.workerCompletionStatus = 'Ready for admin review';
        }
        await issue.save();
        return response.json({ issue: workerIssue(issue) });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to update assigned issue' });
    }
};

export const updateAvailability = async (request, response) => {
    try {
        const allowedAvailability = ['Available', 'On duty', 'Unavailable'];
        const { availability, location, latitude, longitude } = request.body;

        if (!allowedAvailability.includes(availability)) {
            return response.status(400).json({ message: 'Invalid availability status' });
        }

        const updateFields = { availability };
        if (location) updateFields.location = String(location).trim().slice(0, 200);
        if (typeof latitude === 'number') updateFields.latitude = latitude;
        if (typeof longitude === 'number') updateFields.longitude = longitude;
        if (location || typeof latitude === 'number') updateFields.locationUpdatedAt = new Date();

        const worker = await User.findOneAndUpdate(
            { _id: request.user.userId, role: 'worker' },
            updateFields,
            { new: true, runValidators: true },
        );

        if (!worker) {
            return response.status(404).json({ message: 'Worker not found' });
        }

        return response.json({
            worker: {
                id: worker._id,
                availability: worker.availability,
                location: worker.location,
                latitude: worker.latitude,
                longitude: worker.longitude,
                locationUpdatedAt: worker.locationUpdatedAt,
            },
        });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to update worker availability' });
    }
};

export const updateLocation = async (request, response) => {
    try {
        const { location, latitude, longitude } = request.body;

        if (!location && typeof latitude !== 'number' && typeof longitude !== 'number') {
            return response.status(400).json({ message: 'Location or coordinates are required' });
        }

        const updateFields = {
            locationUpdatedAt: new Date(),
        };
        if (typeof location === 'string' && location.trim()) {
            updateFields.location = location.trim().slice(0, 200);
        }
        if (typeof latitude === 'number') {
            updateFields.latitude = latitude;
        }
        if (typeof longitude === 'number') {
            updateFields.longitude = longitude;
        }

        const worker = await User.findOneAndUpdate(
            { _id: request.user.userId, role: 'worker' },
            updateFields,
            { new: true, runValidators: true },
        );

        if (!worker) {
            return response.status(404).json({ message: 'Worker not found' });
        }

        return response.json({
            worker: {
                id: worker._id,
                name: worker.name,
                availability: worker.availability,
                location: worker.location,
                latitude: worker.latitude,
                longitude: worker.longitude,
                locationUpdatedAt: worker.locationUpdatedAt,
            },
        });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to update worker location' });
    }
};