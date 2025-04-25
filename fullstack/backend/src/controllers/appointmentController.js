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

    if (!doctorId) {
      console.error('[Backend] Missing doctorId parameter in getDoctorAppointments');
      return res.status(400).json({
        error: 'Doctor ID is required',
        appointments: [],
        count: 0
      });
    }

    console.log(`[Backend] Getting appointments for doctor ID: ${doctorId}`);
    const result = await appointmentService.getDoctorAppointments(doctorId);

    // Verificar si hay un error en la respuesta
    if (result.error) {
      console.warn(`[Backend] Service returned error: ${result.error}`);
      // Devolvemos código 200 con los datos de error para que el frontend pueda manejarlos
      return res.status(200).json(result);
    }

    console.log(`[Backend] Successfully retrieved ${result.count} appointments for doctor ${doctorId}`);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Backend] Error in getDoctorAppointments controller:', error);
    // Siempre devolver una estructura consistente incluso en caso de error
    return res.status(200).json({
      appointments: [],
      count: 0,
      error: 'Error interno del servidor al obtener citas'
    });
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

// Get available slots for a specific date
const getAvailableSlotsForDate = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    if (!doctorId || !date) {
      console.error('[Backend] Missing parameters in getAvailableSlotsForDate:', { doctorId, date });
      return res.status(400).json({
        error: 'Doctor ID and date are required',
        slots: {},
        doctorAvailableSlots: {},
        hasAvailableSlots: false
      });
    }

    console.log(`[Backend] Getting available slots for doctor ${doctorId} on date ${date}`);

    try {
      const availableSlots = await appointmentService.getAvailableSlotsForDate(doctorId, date);

      // Verificar si hay un error en la respuesta
      if (availableSlots.error) {
        console.warn(`[Backend] Service returned error: ${availableSlots.error}`);
        // Devolvemos código 200 con los datos de error para que el frontend pueda manejarlos
        return res.status(200).json(availableSlots);
      }

      console.log(`[Backend] Successfully retrieved slots for doctor ${doctorId} on date ${date}`);
      return res.status(200).json(availableSlots);
    } catch (serviceError) {
      // Este bloque no debería ejecutarse ya que el servicio ahora maneja sus propios errores
      // Pero lo mantenemos como medida de seguridad adicional
      console.error('[Backend] Unexpected error in service:', serviceError);
      return res.status(200).json({
        date,
        slots: {},
        doctorAvailableSlots: {},
        hasAvailableSlots: false,
        error: serviceError.message
      });
    }
  } catch (error) {
    console.error('[Backend] Error in getAvailableSlotsForDate controller:', error);
    // Siempre devolver una estructura consistente incluso en caso de error
    return res.status(200).json({
      date: req.params.date || 'unknown',
      slots: {},
      doctorAvailableSlots: {},
      hasAvailableSlots: false,
      error: 'Error interno del servidor al obtener horarios disponibles'
    });
  }
};

module.exports = {
  getAllAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableSlotsForDate
};
