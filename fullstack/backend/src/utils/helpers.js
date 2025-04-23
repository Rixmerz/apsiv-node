/**
 * Helper utility functions
 */

/**
 * Format error response
 * @param {Error} error - Error object
 * @returns {Object} Formatted error object
 */
const formatError = (error) => {
  return {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };
};

/**
 * Format success response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted success response
 */
const formatSuccess = (data, message = 'Operation successful') => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  formatError,
  formatSuccess,
  isValidEmail
};
