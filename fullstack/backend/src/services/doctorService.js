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
          // Usar formato UTC para evitar problemas de zona horaria
          const startDate = new Date(`${dateStr}T00:00:00Z`);
          const endDate = new Date(`${dateStr}T23:59:59Z`);

          console.log(`[Backend] Fecha original: ${dateStr}`);
          console.log(`[Backend] Fecha UTC start: ${startDate.toISOString()}`);
          console.log(`[Backend] Fecha UTC end: ${endDate.toISOString()}`);

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

      console.log('[Backend] Iniciando creación de nuevas entradas de horario');
      console.log(`[Backend] Fechas a procesar: ${Object.keys(availableSlots).join(', ')}`);

      for (const dateStr in availableSlots) {
        // Validar que la fecha sea válida
        try {
          // Usar formato UTC para evitar problemas de zona horaria
          const date = new Date(`${dateStr}T00:00:00Z`);
          if (isNaN(date.getTime())) {
            console.warn(`[Backend] Fecha inválida: ${dateStr}, omitiendo`);
            continue;
          }

          console.log(`[Backend] Procesando fecha: ${dateStr}, slots: ${Object.keys(availableSlots[dateStr]).length}`);

          // Contar cuántos slots están marcados como disponibles
          const availableCount = Object.values(availableSlots[dateStr]).filter(Boolean).length;
          console.log(`[Backend] Slots marcados como disponibles para ${dateStr}: ${availableCount}`);

          for (const slotId in availableSlots[dateStr]) {
            // Normalizar el ID del slot para asegurar consistencia
            const normalizedSlotId = normalizeSlotId(slotId);

            // Validar que el valor de disponibilidad sea booleano
            const isAvailable = Boolean(availableSlots[dateStr][slotId]);

            console.log(`[Backend] Creando entrada para fecha ${dateStr}, slot ${slotId} -> ${normalizedSlotId}, disponible: ${isAvailable}`);

            const entry = await prisma.doctorSchedule.create({
              data: {
                doctorId: doctorIdInt,
                date: date,
                slotId: normalizedSlotId,
                available: isAvailable
              }
            });

            console.log(`[Backend] Entrada creada con ID ${entry.id}, fecha: ${entry.date.toISOString()}, slot: ${entry.slotId}, disponible: ${entry.available}`);

            scheduleEntries.push(entry);
          }
        } catch (dateError) {
          console.error(`[Backend] Error procesando fecha ${dateStr}:`, dateError);
          // Continuamos con la siguiente fecha en lugar de fallar toda la operación
          continue;
        }
      }

      console.log(`[Backend] Total de entradas creadas: ${scheduleEntries.length}`);

      // Verificar si todas las entradas se crearon correctamente
      const availableEntries = scheduleEntries.filter(entry => entry.available).length;
      console.log(`[Backend] Entradas marcadas como disponibles: ${availableEntries}`);

      if (scheduleEntries.length === 0) {
        console.warn('[Backend] ADVERTENCIA: No se crearon entradas de horario');
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

/**
 * Get all doctors
 * @returns {Promise<Array>} List of doctors
 */
const getAllDoctors = async () => {
  try {
    console.log('[Backend] Getting all doctors');

    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`[Backend] Found ${doctors.length} doctors`);
    return doctors;
  } catch (error) {
    console.error('[Backend] Error getting all doctors:', error);
    throw new Error(`Error getting all doctors: ${error.message}`);
  }
};

/**
 * Get doctor by ID
 * @param {number} doctorId - Doctor ID
 * @returns {Promise<Object>} Doctor data
 */
const getDoctorById = async (doctorId) => {
  try {
    console.log(`[Backend] Getting doctor with ID ${doctorId}`);

    // Convertir doctorId a entero
    const doctorIdInt = parseInt(doctorId);
    if (isNaN(doctorIdInt)) {
      throw new Error(`Invalid doctor ID: ${doctorId}`);
    }

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorIdInt
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!doctor) {
      throw new Error(`Doctor not found with ID: ${doctorIdInt}`);
    }

    console.log(`[Backend] Found doctor: ${JSON.stringify(doctor)}`);
    return doctor;
  } catch (error) {
    console.error(`[Backend] Error getting doctor by ID: ${error.message}`);
    throw new Error(`Error getting doctor by ID: ${error.message}`);
  }
};

module.exports = {
  getDoctorSchedule,
  updateDoctorSchedule,
  getAllDoctors,
  getDoctorById
};
