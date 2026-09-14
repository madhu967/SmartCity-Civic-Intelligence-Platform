const requireAdmin = (request, response, next) => {
    if (request.user?.role !== 'admin' || request.user.userId !== 'admin') {
        return response.status(403).json({ message: 'Admin access required' });
    }

    return next();
};

export default requireAdmin;