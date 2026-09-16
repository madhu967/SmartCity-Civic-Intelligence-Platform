import mongoose from 'mongoose';

const issueCategories = [
    'Roads & Potholes',
    'Garbage & Sanitation',
    'Water Supply',
    'Electricity',
    'Streetlights',
    'Drainage',
    'Traffic',
    'Other',
];

const issueSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        category: {
            type: String,
            enum: issueCategories,
            required: true,
        },
        location: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 2000,
        },
        aiTitle: {
            type: String,
            trim: true,
            maxlength: 80,
        },
        aiDescription: {
            type: String,
            trim: true,
            maxlength: 300,
        },
        aiDetectedCategory: {
            type: String,
            trim: true,
            maxlength: 80,
        },
        aiSummary: {
            type: String,
            trim: true,
            maxlength: 120,
        },
        imageUrl: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['Submitted', 'In review', 'In progress', 'Resolved'],
            default: 'Submitted',
        },
        reviewStatus: {
            type: String,
            enum: ['Pending verification', 'Verified', 'Rejected'],
            default: 'Pending verification',
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium',
        },
        department: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        assignedWorker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        workerProofImage: {
            type: String,
            trim: true,
        },
        proofReviewStatus: {
            type: String,
            enum: ['Pending review', 'Approved', 'Rejected'],
            default: 'Pending review',
        },
        workerCompletionStatus: {
            type: String,
            enum: ['Not started', 'In progress', 'Ready for admin review', 'Resolved'],
            default: 'Not started',
        },
    },
    { timestamps: true }
);

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
