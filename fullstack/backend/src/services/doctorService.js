/**
 * Doctor service for managing doctor-specific operations
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { normalizeSlotId } = require('../utils/slotUtils');

/**
 * Get doctor schedule
 * @param {number} doctorId - Doctor ID
 * @returns {Promise<Object>} Doctor schedule
 */
const getDoctorSchedule = async (doctorId) => {
  try {
    // Intentar convertir doctorId a entero
    let doctorIdInt;
    try {
      doctorIdInt = parseInt(doctorId);
      if (isNaN(doctorIdInt)) {
        throw new Error('Invalid doctor ID');
      }
    } catch (parseError) {
      throw new Error(`Invalid doctor ID: ${doctorId}`);
    }

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorIdInt
      }
    });

    if (!doctor) {
      throw new Error(`Doctor not found with ID: ${doctorIdInt}`);
    }

    // Get doctor schedule from DoctorSchedule table
    const scheduleEntries = await prisma.doctorSchedule.findMany({
      where: {
        doctorId: doctorIdInt
      }
    });

    if (scheduleEntries.length === 0) {
      console.log(`No schedule entries found for doctor ID: ${doctorIdInt}`);
      return {}; // Devolver un objeto vacío en lugar de lanzar un error
    }

    // Format the schedule as a map of dates to slots
    const formattedSchedule = {};

    scheduleEntries.forEach(entry => {
      const dateStr = entry.date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

      if (!formattedSchedule[dateStr]) {
        formattedSchedule[dateStr] = {};
      }

      formattedSchedule[dateStr][entry.slotId] = entry.available;
    });

    return formattedSchedule;
  } catch (error) {
    throw new Error(`Error fetching doctor schedule: ${error.message}`);
  }
};

/**
 * Update doctor schedule
 * @param {number} doctorId - Doctor ID
 * @param {Object} availableSlots - Map of dates to slots with availability
 * @returns {Promise<Object>} Updated doctor schedule
 */
const updateDoctorSchedule = async (doctorId, availableSlots) => {
  try {
    // Intentar convertir doctorId a entero
    let doctorIdInt;
    try {
      doctorIdInt = parseInt(doctorId);
      if (isNaN(doctorIdInt)) {
        throw new Error('Invalid doctor ID');
      }
    } catch (parseError) {
      throw new Error(`Invalid doctor ID: ${doctorId}`);
    }

    // Validar que availableSlots sea un objeto válido
    if (!availableSlots || typeof availableSlots !== 'object') {
      throw new Error('Invalid schedule data: availableSlots must be an object');
    }

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorIdInt
      }
    });

    if (!doctor) {
      throw new Error(`Doctor not found with ID: ${doctorIdInt}`);
    }

    // Start a transaction to update only the schedule entries for the provided dates
    const result = await prisma.$transaction(async (prisma) => {
      // Get the list of dates that are being updated
      const datesToUpdate = Object.keys(availableSlots);
      console.log(`Actualizando horarios solo para las fechas: ${datesToUpdate.join(', ')}`);

      // Delete existing schedule entries only for the dates being updated
      for (const dateStr of datesToUpdate) {
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            console.warn(`Invalid date: ${dateStr}, skipping`);
            continue;
          }

          // Create start and end of day for the date
          const startDate = new Date(dateStr + 'T00:00:00');
          const endDate = new Date(dateStr + 'T23:59:59');

          console.log(`Eliminando entradas existentes para la fecha ${dateStr} (${startDate.toISOString()} - ${endDate.toISOString()})`);

          // Delete existing entries for this date
          const deletedEntries = await prisma.doctorSchedule.deleteMany({
            where: {
              doctorId: doctorIdInt,
              date: {
                gte: startDate,
                lte: endDate
              }
            }
          });

          console.log(`Eliminadas ${deletedEntries.count} entradas para la fecha ${dateStr}`);
        } catch (error) {
          console.error(`Error al eliminar entradas para la fecha ${dateStr}:`, error);
          // Continue with the next date instead of failing the entire operation
          continue;
        }
      }

      // Create new schedule entries
      const scheduleEntries = [];

      for (const dateStr in availableSlots) {
        // Validar que la fecha sea válida
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            console.warn(`Invalid date: ${dateStr}, skipping`);
            continue;
          }

          for (const slotId in availableSlots[dateStr]) {
            // Normalizar el ID del slot para asegurar consistencia
            const normalizedSlotId = normalizeSlotId(slotId);

            // Validar que el valor de disponibilidad sea booleano
            const isAvailable = Boolean(availableSlots[dateStr][slotId]);

            console.log(`Creando entrada para fecha ${dateStr}, slot ${normalizedSlotId}, disponible: ${isAvailable}`);

            const entry = await prisma.doctorSchedule.create({
              data: {
                doctorId: doctorIdInt,
                date: date,
                slotId: normalizedSlotId,
                available: isAvailable
              }
            });

            console.log(`Entrada creada con ID ${entry.id}, disponible: ${entry.available}`);

            scheduleEntries.push(entry);
          }
        } catch (dateError) {
          console.error(`Error processing date ${dateStr}:`, dateError);
          // Continuamos con la siguiente fecha en lugar de fallar toda la operación
          continue;
        }
      }

      return scheduleEntries;
    });

    // Format the result as a map of dates to slots
    const formattedSchedule = {};

    result.forEach(entry => {
      const dateStr = entry.date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

      if (!formattedSchedule[dateStr]) {
        formattedSchedule[dateStr] = {};
      }

      formattedSchedule[dateStr][entry.slotId] = entry.available;
    });

    return formattedSchedule;
  } catch (error) {
    throw new Error(`Error updating doctor schedule: ${error.message}`);
  }
};

module.exports = {
  getDoctorSchedule,
  updateDoctorSchedule
};
