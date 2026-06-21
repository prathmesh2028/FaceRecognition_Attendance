const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs
// @route   GET /api/audit
// @access  Private (SUPER_ADMIN)
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find().populate('performedBy', 'name email').sort({ createdAt: -1 }).limit(100);
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Error fetching logs' });
    }
};
