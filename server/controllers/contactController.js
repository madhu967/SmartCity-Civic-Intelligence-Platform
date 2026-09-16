import ContactMessage from '../models/ContactMessage.js';

const publicContact = (contact) => ({
    id: contact._id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    topic: contact.topic,
    message: contact.message,
    status: contact.status,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
});

export const createContactMessage = async (request, response) => {
    try {
        const { name, email, phone, topic, message } = request.body || {};
        if (!name || !email || !topic || !message) return response.status(400).json({ message: 'Name, email, topic, and message are required' });
        const contact = await ContactMessage.create({ name, email, phone, topic, message });
        return response.status(201).json({ contact: publicContact(contact) });
    } catch (error) {
        if (error.name === 'ValidationError') return response.status(400).json({ message: 'Please check your contact details and message' });
        return response.status(500).json({ message: 'Unable to send your message' });
    }
};

export const listContactMessages = async (_request, response) => {
    try {
        const contacts = await ContactMessage.find().sort({ createdAt: -1 });
        return response.json({ contacts: contacts.map(publicContact), total: contacts.length });
    } catch {
        return response.status(500).json({ message: 'Unable to load contact messages' });
    }
};

export const updateContactMessage = async (request, response) => {
    try {
        const allowedStatuses = ['New', 'In review', 'Resolved'];
        if (!allowedStatuses.includes(request.body?.status)) return response.status(400).json({ message: 'Invalid contact status' });
        const contact = await ContactMessage.findByIdAndUpdate(request.params.contactId, { status: request.body.status }, { new: true, runValidators: true });
        if (!contact) return response.status(404).json({ message: 'Contact message not found' });
        return response.json({ contact: publicContact(contact) });
    } catch {
        return response.status(500).json({ message: 'Unable to update contact message' });
    }
};
