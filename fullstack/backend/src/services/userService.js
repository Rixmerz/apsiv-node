/**
 * User service for authentication and user management
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

/**
 * Register a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const registerUser = async (userData) => {
  try {
    // Force role to be 'patient' for regular registration
    // Only admin can create doctors or other admins
    const { email, password, name, patientData } = userData;
    const role = 'patient'; // Default and only allowed role for self-registration

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with patient profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        patientProfile: {
          create: patientData || {}
        }
      },
      include: {
        patientProfile: true
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw new Error(`Error registering user: ${error.message}`);
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and token
 */
const loginUser = async (email, password) => {
  try {
    // Find user with profiles
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        doctorProfile: true,
        patientProfile: true
      }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    throw new Error(`Error logging in: ${error.message}`);
  }
};

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} User data
 */
const getUserById = async (id) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        doctorProfile: true,
        patientProfile: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserById
};
