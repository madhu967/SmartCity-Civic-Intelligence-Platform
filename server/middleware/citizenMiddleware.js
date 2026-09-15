const requireCitizen = (request, response, next) => {
    if (request.user?.role !== 'citizen') {
        return response.status(403).json({ message: 'Citizen access required' });
    }

    return next();
};

export default requireCitizen;
