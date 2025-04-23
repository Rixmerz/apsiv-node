/**
 * Admin service for user management
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

/**
 * Get all users
 * @returns {Promise<Array>} Array of users
 */
const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      include: {
        doctorProfile: true,
        patientProfile: true
      }
    });
    
    // Remove passwords from response
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  } catch (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
};

/**
 * Update user role
 * @param {number} userId - User ID
 * @param {string} newRole - New role ('admin', 'doctor', or 'patient')
 * @param {Object} profileData - Profile data for doctor or patient
 * @returns {Promise<Object>} Updated user
 */
const updateUserRole = async (userId, newRole, profileData = {}) => {
  try {
    // Validate role
    if (!['admin', 'doctor', 'patient'].includes(newRole)) {
      throw new Error('Invalid role. Role must be admin, doctor, or patient');
    }
    
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        doctorProfile: true,
        patientProfile: true
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Start a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // If changing from doctor to another role, delete doctor profile
      if (user.role === 'doctor' && newRole !== 'doctor' && user.doctorProfile) {
        await tx.doctor.delete({
          where: { id: user.doctorProfile.id }
        });
      }
      
      // If changing from patient to another role, delete patient profile
      if (user.role === 'patient' && newRole !== 'patient' && user.patientProfile) {
        await tx.patient.delete({
          where: { id: user.patientProfile.id }
        });
      }
      
      // Update user role
      const updateData = { role: newRole };
      
      // If changing to doctor, create doctor profile
      if (newRole === 'doctor' && !user.doctorProfile) {
        updateData.doctorProfile = {
          create: {
            specialty: profileData.specialty || '',
            bio: profileData.bio || ''
          }
        };
      }
      
      // If changing to patient, create patient profile
      if (newRole === 'patient' && !user.patientProfile) {
        updateData.patientProfile = {
          create: {
            birthDate: profileData.birthDate ? new Date(profileData.birthDate) : null,
            address: profileData.address || '',
            phone: profileData.phone || ''
          }
        };
      }
      
      // Update user
      const updatedUser = await tx.user.update({
        where: { id: parseInt(userId) },
        data: updateData,
        include: {
          doctorProfile: true,
          patientProfile: true
        }
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    });
  } catch (error) {
    throw new Error(`Error updating user role: ${error.message}`);
  }
};

/**
 * Delete user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Deleted user
 */
const deleteUser = async (userId) => {
  try {
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        doctorProfile: true,
        patientProfile: true
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Start a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // If user is a doctor, delete doctor profile
      if (user.doctorProfile) {
        await tx.doctor.delete({
          where: { id: user.doctorProfile.id }
        });
      }
      
      // If user is a patient, delete patient profile
      if (user.patientProfile) {
        await tx.patient.delete({
          where: { id: user.patientProfile.id }
        });
      }
      
      // Delete user
      const deletedUser = await tx.user.delete({
        where: { id: parseInt(userId) }
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = deletedUser;
      return userWithoutPassword;
    });
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser
};
