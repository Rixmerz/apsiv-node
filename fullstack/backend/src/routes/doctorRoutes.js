/**
 * Doctor routes for managing doctor-specific operations
 */
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken } = require('../middleware/authMiddleware');

// En modo desarrollo, permitimos acceso sin autenticación para pruebas
const isDevelopment = process.env.NODE_ENV !== 'production';

// Middleware condicional para autenticación
const conditionalAuth = (req, res, next) => {
  if (isDevelopment) {
    // En desarrollo, simulamos un usuario autenticado
    req.user = { id: 1, role: 'doctor' };
    return next();
  }
  // En producción, usamos la autenticación normal
  return authenticateToken(req, res, next);
};

// Get all doctors - Sin autenticación para permitir a pacientes ver doctores
router.get('/', doctorController.getAllDoctors);

// Get doctor schedule - Sin autenticación para permitir a pacientes ver horarios
router.get('/schedule/:doctorId', doctorController.getDoctorSchedule);

// Update doctor schedule - Con autenticación condicional
router.post('/schedule/:doctorId', conditionalAuth, doctorController.updateDoctorSchedule);

// Get doctor by ID - Sin autenticación para permitir a pacientes ver detalles del doctor
// IMPORTANTE: Esta ruta debe ir después de las rutas específicas para evitar que capture todas las rutas
router.get('/:doctorId', doctorController.getDoctorById);

module.exports = router;
