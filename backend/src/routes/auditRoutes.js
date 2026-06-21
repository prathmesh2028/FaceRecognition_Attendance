const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.get('/', protect, authorizeRoles('SUPER_ADMIN'), getAuditLogs);

module.exports = router;
