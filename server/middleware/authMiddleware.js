import jwt from 'jsonwebtoken';

const requireAuth = (request, response, next) => {
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
        ? authorization.slice(7)
        : null;

    if (!token || !process.env.JWT_SECRET) {
        return response.status(401).json({ message: 'Authentication required' });
    }

    try {
        request.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch (error) {
        return response.status(401).json({ message: 'Invalid or expired authentication' });
    }
};

export default requireAuth;