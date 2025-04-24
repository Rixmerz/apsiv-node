/**
 * Doctor controller for managing doctor-specific operations
 */
const doctorService = require('../services/doctorService');

// Get doctor schedule
const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;

    try {
      const schedule = await doctorService.getDoctorSchedule(doctorId);
      res.status(200).json(schedule);
    } catch (serviceError) {
      // Si el error es que no se encontró el doctor o no hay horarios,
      // devolvemos un objeto vacío en lugar de un error
      if (serviceError.message.includes('not found') ||
          serviceError.message.includes('No schedule entries')) {
        console.log('No se encontraron horarios para el doctor, devolviendo objeto vacío');
        res.status(200).json({});
      } else {
        // Para otros errores, propagamos el error
        throw serviceError;
      }
    }
  } catch (error) {
    console.error('Error getting doctor schedule:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update doctor schedule
const updateDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { availableSlots } = req.body;

    // Validar que availableSlots esté presente y sea un objeto
    if (!availableSlots || typeof availableSlots !== 'object') {
      return res.status(400).json({ error: 'Available slots are required and must be an object' });
    }

    // Validar que el objeto no esté vacío
    if (Object.keys(availableSlots).length === 0) {
      return res.status(400).json({ error: 'Available slots object cannot be empty' });
    }

    console.log(`Actualizando horarios para doctor ID: ${doctorId}`);
    console.log('Datos recibidos:', JSON.stringify(availableSlots).substring(0, 200) + '...');

    try {
      const schedule = await doctorService.updateDoctorSchedule(doctorId, availableSlots);
      console.log('Horarios actualizados correctamente');
      res.status(200).json(schedule);
    } catch (serviceError) {
      // Si el error es que no se encontró el doctor, devolvemos un 404
      if (serviceError.message.includes('not found')) {
        return res.status(404).json({ error: serviceError.message });
      }
      // Si el error es de validación, devolvemos un 400
      if (serviceError.message.includes('Invalid')) {
        return res.status(400).json({ error: serviceError.message });
      }
      // Para otros errores, propagamos el error
      throw serviceError;
    }
  } catch (error) {
    console.error('Error updating doctor schedule:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDoctorSchedule,
  updateDoctorSchedule
};
