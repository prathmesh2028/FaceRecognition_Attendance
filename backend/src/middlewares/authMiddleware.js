const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            // Decode token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            
            // Get user from token
            req.admin = await Admin.findById(decoded.id).select('-password');
            if (!req.admin) {
                return res.status(401).json({ success: false, msg: 'Not authorized, admin not found' });
            }
            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error);
            res.status(401).json({ success: false, msg: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ success: false, msg: 'Not authorized, no token' });
    }
};

module.exports = { protect };
