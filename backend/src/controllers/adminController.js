const Admin = require('../models/Admin');
const AdminRequest = require('../models/AdminRequest');
const { logAction } = require('../services/auditService');
const { 
    sendRequestApproved, 
    sendRequestRejected,
    sendAccountSuspended,
    sendAccountReactivated,
    sendAccountDeleted
} = require('../services/emailService');

// @desc    Get all admin requests
// @route   GET /api/admins/requests
// @access  Private (SUPER_ADMIN)
exports.getRequests = async (req, res) => {
    try {
        const requests = await AdminRequest.find().sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

// @desc    Approve admin request
// @route   PATCH /api/admins/requests/:id/approve
// @access  Private (SUPER_ADMIN)
exports.approveRequest = async (req, res) => {
    try {
        const request = await AdminRequest.findById(req.params.id);
        if (!request || request.status !== 'PENDING') return res.status(404).json({ success: false, msg: 'Valid pending request not found' });

        const count = await Admin.countDocuments({ role: 'ADMIN' });
        if (count >= 4) return res.status(400).json({ success: false, msg: 'Maximum limit of 4 ADMIN accounts reached.' });

        const existing = await Admin.findOne({ email: request.email });
        if (existing) return res.status(400).json({ success: false, msg: 'Email already registered' });

        const newAdmin = new Admin({
            name: request.name,
            email: request.email,
            phone: request.phone,
            department: request.department,
            designation: request.designation,
            password: 'dummy_password', // Temporary, will be overwritten
            role: 'ADMIN',
            status: 'ACTIVE',
            isVerified: true,
            createdBy: req.admin._id
        });
        await newAdmin.save();
        
        // Overwrite the double-hashed dummy password with the actual hash from the request
        await Admin.updateOne({ _id: newAdmin._id }, { $set: { password: request.password } });

        request.status = 'APPROVED';
        await request.save();

        await logAction('REQUEST_APPROVED', req.admin._id, newAdmin._id.toString(), { email: newAdmin.email }, req.ip);
        await sendRequestApproved(newAdmin.email, newAdmin.name);

        res.json({ success: true, msg: 'Request approved successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

// @desc    Reject admin request
// @route   PATCH /api/admins/requests/:id/reject
// @access  Private (SUPER_ADMIN)
exports.rejectRequest = async (req, res) => {
    try {
        const request = await AdminRequest.findById(req.params.id);
        if (!request || request.status !== 'PENDING') return res.status(404).json({ success: false, msg: 'Valid pending request not found' });

        request.status = 'REJECTED';
        await request.save();

        await logAction('REQUEST_REJECTED', req.admin._id, null, { email: request.email }, req.ip);
        await sendRequestRejected(request.email, request.name);

        res.json({ success: true, msg: 'Request rejected successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

// @desc    Suspend an admin
// @route   PATCH /api/admins/suspend/:id
// @access  Private (SUPER_ADMIN)
exports.suspendAdmin = async (req, res) => {
    try {
        const adminToSuspend = await Admin.findById(req.params.id);
        if (!adminToSuspend) return res.status(404).json({ success: false, msg: 'Admin not found' });
        if (adminToSuspend.role === 'SUPER_ADMIN') return res.status(403).json({ success: false, msg: 'Cannot suspend SUPER_ADMIN' });

        adminToSuspend.status = 'SUSPENDED';
        adminToSuspend.refreshToken = undefined; // Invalidate current session
        await adminToSuspend.save();

        await logAction('ADMIN_SUSPENDED', req.admin._id, adminToSuspend._id.toString(), { email: adminToSuspend.email }, req.ip);
        const emailStatus = await sendAccountSuspended(adminToSuspend.email, adminToSuspend.name);

        if (emailStatus && !emailStatus.success) {
            return res.json({ success: true, msg: `Admin suspended successfully, BUT email failed: ${emailStatus.error}` });
        }
        res.json({ success: true, msg: 'Admin account suspended successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

// @desc    Reactivate an admin
// @route   PATCH /api/admins/reactivate/:id
// @access  Private (SUPER_ADMIN)
exports.reactivateAdmin = async (req, res) => {
    try {
        const adminToActivate = await Admin.findById(req.params.id);
        if (!adminToActivate) return res.status(404).json({ success: false, msg: 'Admin not found' });
        if (adminToActivate.role === 'SUPER_ADMIN') return res.status(403).json({ success: false, msg: 'Cannot modify SUPER_ADMIN status' });

        adminToActivate.status = 'ACTIVE';
        await adminToActivate.save();

        await logAction('ADMIN_REACTIVATED', req.admin._id, adminToActivate._id.toString(), { email: adminToActivate.email }, req.ip);
        await sendAccountReactivated(adminToActivate.email, adminToActivate.name);

        res.json({ success: true, msg: 'Admin account reactivated successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

// @desc    Delete an admin
// @route   DELETE /api/admins/:id
// @access  Private (SUPER_ADMIN)
exports.deleteAdmin = async (req, res) => {
    try {
        const adminToDelete = await Admin.findById(req.params.id);
        if (!adminToDelete) {
            return res.status(404).json({ success: false, msg: 'Admin not found' });
        }
        if (adminToDelete.role === 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, msg: 'Cannot delete SUPER_ADMIN' });
        }

        await Admin.deleteOne({ _id: req.params.id });
        await logAction('ADMIN_DELETED', req.admin._id, adminToDelete._id.toString(), { email: adminToDelete.email }, req.ip);
        await sendAccountDeleted(adminToDelete.email, adminToDelete.name);

        res.json({ success: true, msg: 'Admin deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

// @desc    Get all admins
exports.getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        res.json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};
