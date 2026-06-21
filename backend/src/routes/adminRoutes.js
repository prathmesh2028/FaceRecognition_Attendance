const express = require('express');
const router = express.Router();
const { getRequests, approveRequest, rejectRequest, suspendAdmin, reactivateAdmin, deleteAdmin, getAdmins } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

// All admin management routes require SUPER_ADMIN
router.use(protect, authorizeRoles('SUPER_ADMIN'));

router.get('/requests', getRequests);
router.patch('/requests/:id/approve', approveRequest);
router.patch('/requests/:id/reject', rejectRequest);
router.patch('/suspend/:id', suspendAdmin);
router.patch('/reactivate/:id', reactivateAdmin);
router.delete('/:id', deleteAdmin);
router.get('/', getAdmins);

module.exports = router;
