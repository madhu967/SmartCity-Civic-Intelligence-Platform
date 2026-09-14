const requireWorker = (request, response, next) => {
    if (request.user?.role !== 'worker') {
        return response.status(403).json({ message: 'Worker access required' });
    }

    return next();
};

export default requireWorker;