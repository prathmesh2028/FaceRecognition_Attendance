const express = require('express');
const router = express.Router();
const { registerStudent, getStudents, deleteStudent } = require('../controllers/studentController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.post('/register', protect, authorizeRoles('ADMIN', 'SUPER_ADMIN'), registerStudent);
router.get('/', protect, authorizeRoles('ADMIN', 'SUPER_ADMIN'), getStudents);
router.delete('/:id', protect, authorizeRoles('SUPER_ADMIN'), deleteStudent);

module.exports = router;
