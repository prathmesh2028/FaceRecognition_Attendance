const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ success: false, msg: 'Not authorized' });
        }
        
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                msg: `Role (${req.admin.role}) is not allowed to access this resource`
            });
        }
        next();
    };
};

module.exports = { authorizeRoles };
