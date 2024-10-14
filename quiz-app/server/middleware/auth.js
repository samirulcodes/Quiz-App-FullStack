
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];  // Extract token from Authorization header
    
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Use the same secret key
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).json({ message: 'Token is not valid: ' + ex.message });
    }
};
