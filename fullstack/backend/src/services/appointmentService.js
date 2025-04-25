/**
 * Appointment service for managing appointments
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { normalizeSlotId, denormalizeSlotId } = require('../utils/slotUtils');

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
    console.log(`[Backend] Getting appointments for doctor ID: ${doctorId}`);

    // Convertir doctorId a entero
    const doctorIdInt = parseInt(doctorId);
    if (isNaN(doctorIdInt)) {
      console.error(`[Backend] Invalid doctor ID: ${doctorId}`);
      throw new Error(`Invalid doctor ID: ${doctorId}`);
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorIdInt
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
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`[Backend] Found ${appointments.length} appointments for doctor ID: ${doctorIdInt}`);

    // Formatear las citas para el frontend
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date,
      status: appointment.status,
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      patient: {
        id: appointment.patient.id,
        phone: appointment.patient.phone || '',
        birthDate: appointment.patient.birthDate,
        user: {
          id: appointment.patient.user.id,
          name: appointment.patient.user.name,
          email: appointment.patient.user.email
        }
      }
    }));

    return {
      appointments: formattedAppointments,
      count: appointments.length
    };
  } catch (error) {
    console.error(`[Backend] Error fetching doctor appointments: ${error.message}`);
    return {
      appointments: [],
      count: 0,
      error: error.message
    };
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
    const { date, notes, doctorId, patientId, slotId, status = 'scheduled' } = appointmentData;

    // Convertir doctorId a entero
    const doctorIdInt = parseInt(doctorId);
    if (isNaN(doctorIdInt)) {
      throw new Error(`Invalid doctor ID: ${doctorId}`);
    }

    // Convertir patientId a entero
    const patientIdInt = parseInt(patientId);
    if (isNaN(patientIdInt)) {
      throw new Error(`Invalid patient ID: ${patientId}`);
    }

    // Validar la fecha
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      throw new Error(`Invalid date format: ${date}`);
    }

    // Extraer la fecha en formato YYYY-MM-DD
    const dateStr = appointmentDate.toISOString().split('T')[0];

    // Verificar si el slot está disponible
    console.log(`[Backend] Verificando disponibilidad para doctor ${doctorIdInt} en fecha ${dateStr}`);
    const availabilityInfo = await getAvailableSlotsForDate(doctorIdInt, dateStr);

    // Normalizar el ID del slot si se proporciona
    let normalizedSlotId = null;
    if (slotId) {
      normalizedSlotId = normalizeSlotId(slotId);
      console.log(`[Backend] Slot ID normalizado: ${normalizedSlotId}`);
    } else {
      // Si no se proporciona un slotId, extraerlo de la hora de la cita
      const hour = appointmentDate.getHours();
      const slotIndex = hour - 7; // 8:00 -> 1, 9:00 -> 2, etc.
      normalizedSlotId = `Bloque_${slotIndex}`;
      console.log(`[Backend] Slot ID calculado de la hora: ${normalizedSlotId}`);
    }

    // Verificar si el slot existe y está disponible
    if (!availabilityInfo.slotsInfo[normalizedSlotId]) {
      throw new Error(`Slot ${normalizedSlotId} no existe para esta fecha`);
    }

    const slotInfo = availabilityInfo.slotsInfo[normalizedSlotId];
    console.log(`[Backend] Información del slot: ${JSON.stringify(slotInfo)}`);

    if (!slotInfo.configuredByDoctor) {
      throw new Error(`El doctor no ha configurado este horario como disponible`);
    }

    if (!slotInfo.available) {
      if (slotInfo.status === 'reserved') {
        throw new Error(`Este horario ya está reservado por otro paciente`);
      } else {
        throw new Error(`Este horario no está disponible`);
      }
    }

    // Si llegamos aquí, el slot está disponible, podemos crear la cita
    console.log(`[Backend] Creando cita para doctor ${doctorIdInt}, paciente ${patientIdInt}, fecha ${dateStr}, slot ${normalizedSlotId}`);

    // Ajustar la hora de la cita según el slot
    const slotNumber = parseInt(normalizedSlotId.replace('Bloque_', ''));
    const appointmentHour = slotNumber + 7; // Bloque_1 -> 8:00, Bloque_2 -> 9:00, etc.

    // Crear una nueva fecha con la hora correcta
    const finalDate = new Date(dateStr);
    finalDate.setHours(appointmentHour, 0, 0, 0);

    console.log(`[Backend] Fecha final de la cita: ${finalDate.toISOString()}`);

    // Crear la cita
    const appointment = await prisma.appointment.create({
      data: {
        date: finalDate,
        notes,
        status,
        doctor: {
          connect: { id: doctorIdInt }
        },
        patient: {
          connect: { id: patientIdInt }
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

    console.log(`[Backend] Cita creada con éxito: ${JSON.stringify(appointment)}`);

    return {
      success: true,
      appointment,
      message: 'Cita creada con éxito'
    };
  } catch (error) {
    console.error(`[Backend] Error creating appointment: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
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
    // Usar formato UTC para evitar problemas de zona horaria
    const startDate = new Date(`${dateStr}T00:00:00Z`);
    const endDate = new Date(`${dateStr}T23:59:59Z`);

    console.log(`[Backend] Fecha original: ${dateStr}`);
    console.log(`[Backend] Fecha UTC start: ${startDate.toISOString()}`);
    console.log(`[Backend] Fecha UTC end: ${endDate.toISOString()}`);
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
    console.log(`[Backend] Using date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorIdInt,
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    console.log(`[Backend] Found ${existingAppointments.length} existing appointments for doctor ${doctorIdInt}`);
    if (existingAppointments.length > 0) {
      console.log(`[Backend] Sample appointment: ${JSON.stringify(existingAppointments[0])}`);
    }

    // Definir los slots por defecto (8:00 AM a 6:00 PM)
    // Bloque_1 para 8:00, Bloque_2 para 9:00, etc.
    const defaultSlots = [];
    for (let i = 1; i <= 11; i++) {
      defaultSlots.push(`Bloque_${i}`);
    }

    console.log(`[Backend] Slots por defecto: ${defaultSlots.join(', ')}`);
    console.log(`[Backend] Total de slots por defecto: ${defaultSlots.length}`);

    // Mapeo de slots a horas para depuración
    const slotToHourMap = {};
    defaultSlots.forEach(slotId => {
      const hour = getHourFromSlotId(slotId);
      slotToHourMap[slotId] = hour;
    });

    // Mostrar el mapeo de slots a horas de forma más legible
    console.log('[Backend] Mapeo de slots a horas:');
    Object.keys(slotToHourMap).forEach(slotId => {
      console.log(`[Backend] - ${slotId}: ${slotToHourMap[slotId]}`);
    });

    // Crear un mapa de slots con información detallada
    const slotsInfo = {};

    // Inicializar todos los slots como no configurados por defecto
    defaultSlots.forEach(slotId => {
      slotsInfo[slotId] = {
        id: slotId,
        hour: getHourFromSlotId(slotId),
        available: false,                // Si está disponible para reservar
        configuredByDoctor: false,       // Si el doctor lo ha configurado
        reservedByPatient: null,         // Información del paciente si está reservado
        status: 'unavailable'            // Estado: 'available', 'reserved', 'unavailable'
      };
    });

    // Aplicar la configuración del doctor
    console.log(`[Backend] Procesando ${doctorSchedule.length} entradas de horario del doctor`);

    // Verificar si hay entradas para todos los slots
    const slotIds = Object.keys(slotsInfo);
    console.log(`[Backend] Total de slots en slotsInfo: ${slotIds.length}`);

    // Verificar qué slots están configurados por el doctor
    const configuredSlots = doctorSchedule.map(schedule => schedule.slotId);
    console.log(`[Backend] Slots configurados por el doctor: ${configuredSlots.join(', ')}`);

    // Verificar si hay slots que no están configurados por el doctor
    const unconfiguredSlots = slotIds.filter(slotId => !configuredSlots.includes(slotId));
    console.log(`[Backend] Slots no configurados por el doctor: ${unconfiguredSlots.join(', ')}`);

    // Procesar cada entrada de horario del doctor
    doctorSchedule.forEach(schedule => {
      const normalizedSlotId = normalizeSlotId(schedule.slotId);
      console.log(`[Backend] Procesando slot: ${schedule.slotId} -> normalizado: ${normalizedSlotId}, disponible: ${schedule.available}, fecha: ${schedule.date.toISOString()}`);

      if (slotsInfo[normalizedSlotId]) {
        slotsInfo[normalizedSlotId].configuredByDoctor = true;
        slotsInfo[normalizedSlotId].available = schedule.available;

        // Actualizar el estado basado en la configuración del doctor
        if (schedule.available) {
          slotsInfo[normalizedSlotId].status = 'available';
          console.log(`[Backend] Slot ${normalizedSlotId} marcado como disponible`);
        } else {
          slotsInfo[normalizedSlotId].status = 'unavailable';
          console.log(`[Backend] Slot ${normalizedSlotId} marcado como no disponible`);
        }
      } else {
        console.log(`[Backend] ADVERTENCIA: Slot ${normalizedSlotId} no encontrado en slotsInfo`);

        // Crear el slot si no existe
        slotsInfo[normalizedSlotId] = {
          id: normalizedSlotId,
          hour: getHourFromSlotId(normalizedSlotId),
          configuredByDoctor: true,
          available: schedule.available,
          status: schedule.available ? 'available' : 'unavailable',
          reservedByPatient: null
        };

        console.log(`[Backend] Slot ${normalizedSlotId} creado con estado: ${slotsInfo[normalizedSlotId].status}`);
      }
    });

    // Mostrar un resumen de los slots disponibles
    console.log('[Backend] Resumen de slots disponibles:');
    let availableCount = 0;
    Object.keys(slotsInfo).forEach(slotId => {
      const info = slotsInfo[slotId];
      if (info.status === 'available') {
        availableCount++;
        console.log(`[Backend] - Slot ${slotId}: ${info.hour} (configurado: ${info.configuredByDoctor}, disponible: ${info.available})`);
      }
    });
    console.log(`[Backend] Total de slots disponibles: ${availableCount} de ${Object.keys(slotsInfo).length}`);

    // Aplicar las citas existentes
    existingAppointments.forEach(appointment => {
      const hour = appointment.date.getHours();
      const slotIndex = hour - 7; // 8:00 -> 1, 9:00 -> 2, etc.
      const slotId = `Bloque_${slotIndex}`;

      if (slotsInfo[slotId]) {
        // Marcar como reservado
        slotsInfo[slotId].available = false;
        slotsInfo[slotId].status = 'reserved';
        slotsInfo[slotId].reservedByPatient = {
          id: appointment.patientId,
          name: appointment.patient?.user?.name || 'Paciente',
          appointmentId: appointment.id
        };
      }
    });

    // Crear arrays separados para diferentes vistas
    const availableSlots = {};
    const reservedSlots = {};
    const allSlots = {};

    // Convertir los IDs de slots del formato del backend al formato del frontend
    const frontendSlotsInfo = {};

    // Llenar los arrays
    Object.keys(slotsInfo).forEach(slotId => {
      const info = slotsInfo[slotId];
      const frontendSlotId = denormalizeSlotId(slotId);

      // Para la vista de disponibilidad (compatible con el formato anterior)
      availableSlots[frontendSlotId] = info.available;

      // Para la vista de reservas
      if (info.status === 'reserved') {
        reservedSlots[frontendSlotId] = info.reservedByPatient;
      }

      // Para la vista completa
      allSlots[frontendSlotId] = {
        id: frontendSlotId,
        hour: info.hour,
        status: info.status,
        configuredByDoctor: info.configuredByDoctor
      };

      // Guardar la información detallada con ID de frontend
      frontendSlotsInfo[frontendSlotId] = {
        ...info,
        id: frontendSlotId
      };
    });

    // Contar cuántos slots están disponibles después de la conversión
    const frontendAvailableCount = Object.values(frontendSlotsInfo).filter(info => info.status === 'available').length;
    console.log(`[Backend] Slots disponibles después de la conversión: ${frontendAvailableCount}`);

    // Verificar si hay al menos un slot disponible
    const hasAvailableSlots = Object.values(availableSlots).some(isAvailable => isAvailable === true);
    console.log(`[Backend] Has available slots: ${hasAvailableSlots}`);

    // Devolver la respuesta con información detallada
    return {
      date: dateStr,
      slots: availableSlots,                  // Formato compatible con el anterior
      slotsInfo: frontendSlotsInfo,           // Información detallada de cada slot con IDs de frontend
      reservedSlots: reservedSlots,           // Slots reservados con info del paciente
      allSlots: allSlots,                     // Todos los slots con su estado
      hasAvailableSlots: hasAvailableSlots,   // Indicador de si hay slots disponibles
      availableCount: frontendAvailableCount  // Número de slots disponibles
    };
  } catch (error) {
    console.error(`[Backend] Error in getAvailableSlotsForDate: ${error.message}`);
    // Siempre retornar un objeto consistente incluso en caso de error
    return {
      date: dateStr,
      slots: {},
      slotsInfo: {},
      reservedSlots: {},
      allSlots: {},
      hasAvailableSlots: false,
      availableCount: 0,
      error: error.message
    };
  }
};

/**
 * Helper function to get the hour from a slot ID
 * @param {string} slotId - Slot ID (e.g., 'Bloque_1')
 * @returns {string} Hour string (e.g., '8:00 - 9:00')
 */
const getHourFromSlotId = (slotId) => {
  // Extract the number from the slot ID
  const match = slotId.match(/Bloque_(\d+)/);
  if (!match) {
    console.warn(`[Backend] ID de slot inválido: ${slotId}`);
    return 'Hora desconocida';
  }

  const slotNumber = parseInt(match[1]);

  // Corregir el mapeo de slots a horas
  // Bloque_1 -> 8:00, Bloque_2 -> 9:00, etc.
  // Bloque_8 -> 15:00, Bloque_9 -> 16:00, etc.
  const startHour = slotNumber + 7; // Bloque_1 -> 8:00, Bloque_2 -> 9:00, etc.
  const endHour = startHour + 1;

  console.log(`[Backend] Slot ${slotId} -> Hora ${startHour}:00 - ${endHour}:00`);
  return `${startHour}:00 - ${endHour}:00`;
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
