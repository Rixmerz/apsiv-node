/**
 * Appointment service for managing appointments
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { normalizeSlotId } = require('../utils/slotUtils');

/**
 * Get all appointments
 * @returns {Promise<Array>} Array of appointments
 */
const getAllAppointments = async () => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    return appointments;
  } catch (error) {
    throw new Error(`Error fetching appointments: ${error.message}`);
  }
};

/**
 * Get appointments for a doctor
 * @param {number} doctorId - Doctor ID
 * @returns {Promise<Array>} Array of appointments
 */
const getDoctorAppointments = async (doctorId) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: parseInt(doctorId)
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    return appointments;
  } catch (error) {
    throw new Error(`Error fetching doctor appointments: ${error.message}`);
  }
};

/**
 * Get appointments for a patient
 * @param {number} patientId - Patient ID
 * @returns {Promise<Array>} Array of appointments
 */
const getPatientAppointments = async (patientId) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: parseInt(patientId)
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    return appointments;
  } catch (error) {
    throw new Error(`Error fetching patient appointments: ${error.message}`);
  }
};

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Created appointment
 */
const createAppointment = async (appointmentData) => {
  try {
    const { date, notes, doctorId, patientId, status = 'scheduled' } = appointmentData;

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        notes,
        status,
        doctor: {
          connect: { id: parseInt(doctorId) }
        },
        patient: {
          connect: { id: parseInt(patientId) }
        }
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return appointment;
  } catch (error) {
    throw new Error(`Error creating appointment: ${error.message}`);
  }
};

/**
 * Update an appointment
 * @param {number} id - Appointment ID
 * @param {Object} appointmentData - Updated appointment data
 * @returns {Promise<Object>} Updated appointment
 */
const updateAppointment = async (id, appointmentData) => {
  try {
    const { date, notes, status } = appointmentData;

    const appointment = await prisma.appointment.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...(date && { date: new Date(date) }),
        ...(notes && { notes }),
        ...(status && { status })
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return appointment;
  } catch (error) {
    throw new Error(`Error updating appointment: ${error.message}`);
  }
};

/**
 * Delete an appointment
 * @param {number} id - Appointment ID
 * @returns {Promise<Object>} Deleted appointment
 */
const deleteAppointment = async (id) => {
  try {
    const appointment = await prisma.appointment.delete({
      where: {
        id: parseInt(id)
      }
    });

    return appointment;
  } catch (error) {
    throw new Error(`Error deleting appointment: ${error.message}`);
  }
};

/**
 * Get available slots for a specific date and doctor
 * @param {number} doctorId - Doctor ID
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Promise<Object>} Available slots
 */
const getAvailableSlotsForDate = async (doctorId, dateStr) => {
  try {
    console.log(`[Backend] getAvailableSlotsForDate called with doctorId=${doctorId}, date=${dateStr}`);

    // Validar el formato de la fecha
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error(`[Backend] Invalid date format: ${dateStr}`);
      throw new Error(`Invalid date format: ${dateStr}`);
    }
    console.log(`[Backend] Parsed date: ${date.toISOString()}`);

    // Convertir doctorId a entero
    const doctorIdInt = parseInt(doctorId);
    if (isNaN(doctorIdInt)) {
      console.error(`[Backend] Invalid doctor ID: ${doctorId}`);
      throw new Error(`Invalid doctor ID: ${doctorId}`);
    }
    console.log(`[Backend] Parsed doctorId: ${doctorIdInt}`);

    // Verificar que el doctor exista
    console.log(`[Backend] Finding doctor with ID: ${doctorIdInt}`);
    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorIdInt
      }
    });

    if (!doctor) {
      console.error(`[Backend] Doctor not found with ID: ${doctorIdInt}`);
      throw new Error(`Doctor not found with ID: ${doctorIdInt}`);
    }
    console.log(`[Backend] Doctor found: ${JSON.stringify(doctor)}`);

    // Obtener la configuración del doctor para esta fecha
    const startDate = new Date(dateStr + 'T00:00:00');
    const endDate = new Date(dateStr + 'T23:59:59');
    console.log(`[Backend] Searching for doctor schedule between ${startDate.toISOString()} and ${endDate.toISOString()}`);

    const doctorSchedule = await prisma.doctorSchedule.findMany({
      where: {
        doctorId: doctorIdInt,
        date: {
          gte: startDate,
          lt: endDate
        }
      }
    });

    console.log(`[Backend] Found ${doctorSchedule.length} schedule entries for doctor ${doctorIdInt}`);
    if (doctorSchedule.length > 0) {
      console.log(`[Backend] Sample schedule entry: ${JSON.stringify(doctorSchedule[0])}`);
    }

    // Obtener las citas existentes para esta fecha
    console.log(`[Backend] Searching for existing appointments on ${dateStr}`);
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorIdInt,
        date: {
          gte: startDate,
          lt: endDate
        }
      }
    });

    console.log(`[Backend] Found ${existingAppointments.length} existing appointments for doctor ${doctorIdInt}`);
    if (existingAppointments.length > 0) {
      console.log(`[Backend] Sample appointment: ${JSON.stringify(existingAppointments[0])}`);
    }

    // Crear un mapa de slots con su disponibilidad
    const availableSlots = {};

    // Definir los slots por defecto
    const defaultSlots = [
      'Bloque_1', 'Bloque_2', 'Bloque_3', 'Bloque_4',
      'Bloque_5', 'Bloque_6', 'Bloque_7', 'Bloque_8'
    ];

    // Inicializar todos los slots como no disponibles por defecto
    // Esto es importante para que solo se muestren los slots que el doctor ha marcado explícitamente como disponibles
    defaultSlots.forEach(slotId => {
      availableSlots[slotId] = false;
    });

    // Aplicar la configuración del doctor - Solo marcar como disponibles los que el doctor ha configurado como disponibles
    doctorSchedule.forEach(schedule => {
      // Normalizar el ID del slot para asegurar consistencia
      const normalizedSlotId = normalizeSlotId(schedule.slotId);
      availableSlots[normalizedSlotId] = schedule.available;
    });

    // Crear una copia de los slots disponibles antes de aplicar las citas existentes
    const doctorAvailableSlots = {...availableSlots};

    // Marcar como no disponibles los slots que ya tienen citas (independientemente de la configuración del doctor)
    existingAppointments.forEach(appointment => {
      // Extraer el ID del slot de la fecha de la cita
      const hour = appointment.date.getHours();
      let slotId;

      // Mapear la hora a un ID de slot
      let rawSlotId;
      if (hour >= 8 && hour < 10) rawSlotId = 'Bloque_1';
      else if (hour >= 10 && hour < 12) rawSlotId = 'Bloque_2';
      else if (hour >= 12 && hour < 14) rawSlotId = 'Bloque_3';
      else if (hour >= 14 && hour < 16) rawSlotId = 'Bloque_4';
      else if (hour >= 16 && hour < 18) rawSlotId = 'Bloque_5';
      else if (hour >= 18 && hour < 20) rawSlotId = 'Bloque_6';
      else if (hour >= 20 && hour < 22) rawSlotId = 'Bloque_7';
      else rawSlotId = 'Bloque_8';

      // Asegurarse de que el ID del slot esté normalizado
      slotId = normalizeSlotId(rawSlotId);

      // Marcar el slot como no disponible
      if (slotId) {
        // Normalizar el ID del slot para asegurar consistencia
        const normalizedSlotId = normalizeSlotId(slotId);
        availableSlots[normalizedSlotId] = false;
      }
    });

    console.log(`[Backend] Doctor available slots: ${JSON.stringify(doctorAvailableSlots)}`);
    console.log(`[Backend] Final available slots: ${JSON.stringify(availableSlots)}`);

    // Verificar si hay al menos un slot disponible
    const hasAvailableSlots = Object.values(availableSlots).some(isAvailable => isAvailable === true);
    console.log(`[Backend] Has available slots: ${hasAvailableSlots}`);

    // Incluir en la respuesta tanto los slots disponibles como los slots configurados por el doctor
    return {
      date: dateStr,
      slots: availableSlots,
      doctorAvailableSlots: doctorAvailableSlots,
      hasAvailableSlots: hasAvailableSlots
    };
  } catch (error) {
    console.error(`[Backend] Error in getAvailableSlotsForDate: ${error.message}`);
    // Siempre retornar un objeto consistente incluso en caso de error
    return {
      date: dateStr,
      slots: {},
      doctorAvailableSlots: {},
      hasAvailableSlots: false,
      error: error.message
    };
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
