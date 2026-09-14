import User from '../models/User.js';

export const updateAvailability = async (request, response) => {
    try {
        const allowedAvailability = ['Available', 'On duty', 'Unavailable'];
        const { availability, location } = request.body;

        if (!allowedAvailability.includes(availability)) {
            return response.status(400).json({ message: 'Invalid availability status' });
        }

        const worker = await User.findOneAndUpdate(
            { _id: request.user.userId, role: 'worker' },
            { availability, ...(location ? { location } : {}) },
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
            },
        });
    } catch (error) {
        return response.status(500).json({ message: 'Unable to update worker availability' });
    }
};