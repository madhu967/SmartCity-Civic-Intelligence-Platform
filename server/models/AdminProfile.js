import mongoose from 'mongoose';

const adminProfileSchema = new mongoose.Schema(
    {
        key: { type: String, unique: true, default: 'primary-admin' },
        profileImage: { type: String, trim: true },
    },
    { timestamps: true },
);

const AdminProfile = mongoose.model('AdminProfile', adminProfileSchema);

export default AdminProfile;
