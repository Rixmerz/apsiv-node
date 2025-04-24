/**
 * Doctor service for managing doctor-specific operations
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

    // Start a transaction to update all schedule entries
    const result = await prisma.$transaction(async (prisma) => {
      // Delete existing schedule entries for this doctor
      await prisma.doctorSchedule.deleteMany({
        where: {
          doctorId: doctorIdInt
        }
      });

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
            // Validar que el valor de disponibilidad sea booleano
            const isAvailable = Boolean(availableSlots[dateStr][slotId]);

            const entry = await prisma.doctorSchedule.create({
              data: {
                doctorId: doctorIdInt,
                date: date,
                slotId: slotId,
                available: isAvailable
              }
            });

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
