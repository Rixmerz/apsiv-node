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

    console.log(`[Backend] Actualizando horarios para doctor ID: ${doctorId}`);
    console.log('[Backend] Datos recibidos:', JSON.stringify(availableSlots).substring(0, 200) + '...');

    // Imprimir información detallada sobre los datos recibidos
    const dateKeys = Object.keys(availableSlots);
    console.log(`[Backend] Fechas recibidas: ${dateKeys.join(', ')}`);

    // Contar cuántos slots están marcados como disponibles por fecha
    for (const dateStr of dateKeys) {
      const slots = availableSlots[dateStr];
      const slotKeys = Object.keys(slots);
      const availableCount = Object.values(slots).filter(Boolean).length;
      console.log(`[Backend] Fecha ${dateStr}: ${slotKeys.length} slots, ${availableCount} disponibles`);

      // Mostrar los slots disponibles
      if (availableCount > 0) {
        const availableSlots = slotKeys.filter(slotId => slots[slotId]);
        console.log(`[Backend] Slots disponibles para ${dateStr}: ${availableSlots.join(', ')}`);
      }
    }

    try {
      const schedule = await doctorService.updateDoctorSchedule(doctorId, availableSlots);
      console.log('[Backend] Horarios actualizados correctamente');
      console.log('[Backend] Respuesta:', JSON.stringify(schedule).substring(0, 200) + '...');

      // Verificar el resultado
      const updatedDates = Object.keys(schedule);
      console.log(`[Backend] Fechas actualizadas: ${updatedDates.join(', ')}`);

      // Contar cuántos slots están marcados como disponibles en el resultado
      let totalAvailableSlots = 0;
      for (const dateStr of updatedDates) {
        const availableCount = Object.values(schedule[dateStr]).filter(Boolean).length;
        console.log(`[Backend] Fecha ${dateStr} en resultado: ${availableCount} slots disponibles`);
        totalAvailableSlots += availableCount;
      }
      console.log(`[Backend] Total de slots disponibles en el resultado: ${totalAvailableSlots}`);

      res.status(200).json({
        success: true,
        message: 'Horarios actualizados correctamente',
        data: schedule,
        summary: {
          updatedDates: updatedDates.length,
          totalAvailableSlots
        }
      });
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

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getAllDoctors();
    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error getting all doctors:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;

    try {
      const doctor = await doctorService.getDoctorById(doctorId);
      res.status(200).json(doctor);
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
    console.error('Error getting doctor by ID:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDoctorSchedule,
  updateDoctorSchedule,
  getAllDoctors,
  getDoctorById
};
