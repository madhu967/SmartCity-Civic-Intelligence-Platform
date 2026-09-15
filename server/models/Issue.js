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
        imageUrl: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['Submitted', 'In review', 'In progress', 'Resolved'],
            default: 'Submitted',
        },
    },
    { timestamps: true }
);

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
