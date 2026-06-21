const AuditLog = require('../models/AuditLog');

exports.logAction = async (action, performedBy, target = null, details = null, ipAddress = null) => {
    try {
        await AuditLog.create({
            action,
            performedBy,
            target,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};
