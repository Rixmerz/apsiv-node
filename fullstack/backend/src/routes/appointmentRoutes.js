/**
 * Appointment routes for managing appointments
 */
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Protected routes
router.use(authenticateToken);

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
