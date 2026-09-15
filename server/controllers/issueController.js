import Issue from '../models/Issue.js';

export const uploadIssueImage = async (image) => {
    if (!image) return null;
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Cloudinary unsigned upload preset is not configured');
    }

    const requestBody = new URLSearchParams({
        file: image,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });

    let uploadResponse;
    try {
        uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: requestBody,
        });
    } catch (error) {
        throw new Error(`Cloudinary connection failed: ${error.message}`);
    }

    const responseText = await uploadResponse.text();
    let uploadData;
    try {
        uploadData = JSON.parse(responseText || '{}');
    } catch (error) {
        throw new Error('Cloudinary returned an invalid upload response');
    }
    if (!uploadResponse.ok || !uploadData.secure_url) {
        if (uploadResponse.status === 401 || uploadResponse.status === 403) {
            throw new Error('Cloudinary rejected the unsigned upload preset. Check that ml_default is enabled for unsigned uploads.');
        }
        throw new Error(uploadData.error?.message || 'Cloudinary upload failed');
    }
    return uploadData.secure_url;
};

const publicIssue = (issue) => ({
    id: issue._id,
    category: issue.category,
    location: issue.location,
    description: issue.description,
    imageUrl: issue.imageUrl,
    status: issue.status,
    department: issue.department,
    assignedWorker: issue.assignedWorker ? {
        id: issue.assignedWorker._id || issue.assignedWorker,
        name: issue.assignedWorker.name,
        department: issue.assignedWorker.department,
    } : null,
    workerProofImage: issue.workerProofImage,
    proofReviewStatus: issue.proofReviewStatus,
    workerCompletionStatus: issue.workerCompletionStatus,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
});

export const getMyIssues = async (request, response) => {
    try {
        response.set('Cache-Control', 'no-store');
        const issues = await Issue.find({ reporter: request.user.userId }).populate('assignedWorker', 'name department').sort({ createdAt: -1 });
        return response.json({ issues: issues.map(publicIssue) });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to load your reports' });
    }
};

export const createIssue = async (request, response) => {
    try {
        const { category, location, description, image } = request.body;
        if (!category || !location || !description) {
            return response.status(400).json({ message: 'Issue type, location, and description are required' });
        }

        if (image && (!image.startsWith('data:image/') || image.length > 7 * 1024 * 1024)) {
            return response.status(400).json({ message: 'Please upload an image smaller than 5 MB' });
        }

        let imageUrl = null;
        if (image && process.env.ISSUE_IMAGE_DATABASE_FALLBACK === 'true') {
            imageUrl = image;
        } else if (image) {
            try {
                imageUrl = await uploadIssueImage(image);
            } catch (error) {
                return response.status(502).json({ message: error.message });
            }
        }
        const issue = await Issue.create({
            reporter: request.user.userId,
            category,
            location,
            description,
            imageUrl,
        });
        return response.status(201).json({ issue: publicIssue(issue) });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return response.status(400).json({ message: 'Please provide a valid issue type and description' });
        }
        return response.status(500).json({ message: 'Unable to submit issue report' });
    }
};
