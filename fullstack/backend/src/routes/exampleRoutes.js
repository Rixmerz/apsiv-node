/**
 * Example routes
 */
const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', exampleController.getAllItems);
router.get('/:id', exampleController.getItemById);

// Protected routes
router.post('/', authenticateToken, exampleController.createItem);
router.put('/:id', authenticateToken, exampleController.updateItem);
router.delete('/:id', authenticateToken, exampleController.deleteItem);

module.exports = router;
