/**
 * Appointment controller for managing appointments
 */
const appointmentService = require('../services/appointmentService');

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAllAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctor appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await appointmentService.getDoctorAppointments(doctorId);
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get patient appointments
const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointments = await appointmentService.getPatientAppointments(patientId);
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create appointment
const createAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    const appointment = await appointmentService.createAppointment(appointmentData);
    res.status(201).json({ message: 'Appointment created successfully', appointment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointmentData = req.body;
    const appointment = await appointmentService.updateAppointment(id, appointmentData);
    res.status(200).json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await appointmentService.deleteAppointment(id);
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
