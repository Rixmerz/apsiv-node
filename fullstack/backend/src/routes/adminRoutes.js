/**
 * Admin routes for user management
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(isAdmin);

// Get all users
router.get('/users', adminController.getAllUsers);

// Update user role
router.put('/users/:userId/role', adminController.updateUserRole);

// Delete user
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
