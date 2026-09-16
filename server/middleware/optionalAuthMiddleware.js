import jwt from 'jsonwebtoken';

const optionalAuth = (request, _response, next) => {
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token || !process.env.JWT_SECRET) return next();

    try {
        request.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        request.user = undefined;
    }

    return next();
};

export default optionalAuth;
