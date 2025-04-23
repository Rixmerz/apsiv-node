/**
 * Admin controller for user management
 */
const adminService = require('../services/adminService');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, profileData } = req.body;
    
    const updatedUser = await adminService.updateUserRole(userId, role, profileData);
    res.status(200).json({ message: 'User role updated successfully', user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const deletedUser = await adminService.deleteUser(userId);
    res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser
};
