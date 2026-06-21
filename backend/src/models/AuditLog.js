const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    target: { type: String }, // e.g., "Student ID 123" or "Admin ID 456"
    details: { type: mongoose.Schema.Types.Mixed }, // flexible JSON for tracking changes
    ipAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
