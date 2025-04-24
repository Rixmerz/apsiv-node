/**
 * Appointment routes for managing appointments
 */
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Middleware condicional para autenticación
const isDevelopment = process.env.NODE_ENV !== 'production';

// Middleware condicional para autenticación
const conditionalAuth = (req, res, next) => {
  if (isDevelopment) {
    // En desarrollo, simulamos un usuario autenticado
    req.user = { id: 1, role: 'patient' };
    return next();
  }
  // En producción, usamos la autenticación normal
  return authenticateToken(req, res, next);
};

// Ruta pública para obtener slots disponibles
router.get('/available-slots/:doctorId/:date', appointmentController.getAvailableSlotsForDate);

// Protected routes
router.use(conditionalAuth);

// Get all appointments (admin only)
router.get('/', appointmentController.getAllAppointments);

// Get doctor appointments
router.get('/doctor/:doctorId', appointmentController.getDoctorAppointments);

// Get patient appointments
router.get('/patient/:patientId', appointmentController.getPatientAppointments);

// Create appointment
router.post('/', appointmentController.createAppointment);

// Update appointment
router.put('/:id', appointmentController.updateAppointment);

// Delete appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
