import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
        phone: { type: String, trim: true, maxlength: 30 },
        topic: { type: String, required: true, enum: ['Website support', 'Civic issue help', 'Partnership', 'Feedback', 'Other'] },
        message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
        status: { type: String, enum: ['New', 'In review', 'Resolved'], default: 'New' },
    },
    { timestamps: true },
);

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
