/**
 * Appointment service for managing appointments
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

    // Primero, marcar todos los slots como disponibles por defecto
    const defaultSlots = [
      'Bloque_1', 'Bloque_2', 'Bloque_3', 'Bloque_4',
      'Bloque_5', 'Bloque_6', 'Bloque_7', 'Bloque_8'
    ];

    defaultSlots.forEach(slotId => {
      availableSlots[slotId] = true;
    });

    // Luego, aplicar la configuración del doctor
    doctorSchedule.forEach(schedule => {
      availableSlots[schedule.slotId] = schedule.available;
    });

    // Finalmente, marcar como no disponibles los slots que ya tienen citas
    existingAppointments.forEach(appointment => {
      // Extraer el ID del slot de la fecha de la cita
      // Asumimos que el slotId está codificado en la hora de la cita
      const hour = appointment.date.getHours();
      let slotId;

      // Mapear la hora a un ID de slot (esto debe coincidir con tu lógica de frontend)
      if (hour >= 8 && hour < 10) slotId = 'Bloque_1';
      else if (hour >= 10 && hour < 12) slotId = 'Bloque_2';
      else if (hour >= 12 && hour < 14) slotId = 'Bloque_3';
      else if (hour >= 14 && hour < 16) slotId = 'Bloque_4';
      else if (hour >= 16 && hour < 18) slotId = 'Bloque_5';
      else if (hour >= 18 && hour < 20) slotId = 'Bloque_6';
      else if (hour >= 20 && hour < 22) slotId = 'Bloque_7';
      else slotId = 'Bloque_8';

      // Marcar el slot como no disponible
      if (slotId) {
        availableSlots[slotId] = false;
      }
    });

    console.log(`[Backend] Final available slots: ${JSON.stringify(availableSlots)}`);

    // Verificar si hay al menos un slot disponible
    const hasAvailableSlots = Object.values(availableSlots).some(isAvailable => isAvailable === true);
    console.log(`[Backend] Has available slots: ${hasAvailableSlots}`);

    return {
      date: dateStr,
      slots: availableSlots,
      hasAvailableSlots: hasAvailableSlots
    };
  } catch (error) {
    throw new Error(`Error getting available slots: ${error.message}`);
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
