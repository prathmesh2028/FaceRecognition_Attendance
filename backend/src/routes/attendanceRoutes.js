const express = require('express');
const router = express.Router();
const { markAttendance, getAttendanceHistory, clearAttendanceHistory } = require('../controllers/attendanceController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.post('/mark', protect, authorizeRoles('ADMIN', 'SUPER_ADMIN'), markAttendance);
router.get('/', protect, authorizeRoles('ADMIN', 'SUPER_ADMIN'), getAttendanceHistory);
router.delete('/', protect, authorizeRoles('SUPER_ADMIN'), clearAttendanceHistory);

module.exports = router;
