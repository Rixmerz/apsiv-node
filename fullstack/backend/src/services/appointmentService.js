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
      // If no slotId is provided, extract it from the appointment time
      const hour = appointmentDate.getHours();
      const slotIndex = hour - 7; // 8:00 -> 1, 9:00 -> 2, etc.

      // Validate that slotIndex is in a valid range (1-18)
      if (slotIndex < 1 || slotIndex > 18) {
        console.error(`[Backend] Error: Invalid appointment time (${hour}:00). Must be between 8:00 and 25:00.`);
        return {
          success: false,
          error: `Invalid appointment time (${hour}:00). Must be between 8:00 and 25:00.`
        };
      }

      normalizedSlotId = `block_${slotIndex}`;
      console.log(`[Backend] Slot ID calculated from time: ${normalizedSlotId}`);
    }

    // Validate that normalizedSlotId has the correct format
    if (!normalizedSlotId) {
      console.error(`[Backend] Error: Slot ID is null or undefined`);
      return {
        success: false,
        error: `Slot ID is required`
      };
    }

    // Check if the slot ID has a valid format (block_X, Bloque_X, or slot_X)
    if (!normalizedSlotId.match(/^block_\d+$/) &&
        !normalizedSlotId.match(/^Bloque_\d+$/) &&
        !normalizedSlotId.match(/^slot_\d+$/)) {
      console.error(`[Backend] Error: Invalid slot format: ${normalizedSlotId}`);
      return {
        success: false,
        error: `Invalid slot format: ${normalizedSlotId}`
      };
    }

    // If the slot ID is in frontend format (slot_X), convert it to backend format (block_X)
    if (normalizedSlotId.match(/^slot_\d+$/)) {
      const slotNumber = normalizedSlotId.replace('slot_', '');
      normalizedSlotId = `block_${slotNumber}`;
      console.log(`[Backend] Converted slot ID from frontend format to backend format: ${normalizedSlotId}`);
    }

    // Verify if the slot exists and is available
    console.log(`[Backend] Verifying slot ${normalizedSlotId} in availabilityInfo:`, availabilityInfo);

    // Verify if availabilityInfo.slotsInfo exists
    if (!availabilityInfo.slotsInfo) {
      console.error(`[Backend] Error: availabilityInfo.slotsInfo is undefined or null`);
      return {
        success: false,
        error: `Error verifying slot availability`
      };
    }

    // Log all available slots for debugging
    console.log(`[Backend] Available slots in slotsInfo:`, Object.keys(availabilityInfo.slotsInfo));

    // Try to find the slot in different formats
    let slotInfo = null;
    let actualSlotId = normalizedSlotId;

    // First try with the normalized ID
    if (availabilityInfo.slotsInfo[normalizedSlotId]) {
      slotInfo = availabilityInfo.slotsInfo[normalizedSlotId];
      console.log(`[Backend] Found slot with ID ${normalizedSlotId}`);
    }
    // Try with legacy format (Bloque_X)
    else if (normalizedSlotId.startsWith('block_')) {
      const slotNumber = normalizedSlotId.replace('block_', '');
      const legacySlotId = `Bloque_${slotNumber}`;

      if (availabilityInfo.slotsInfo[legacySlotId]) {
        slotInfo = availabilityInfo.slotsInfo[legacySlotId];
        actualSlotId = legacySlotId;
        console.log(`[Backend] Found slot with legacy ID ${legacySlotId}`);
      }
    }
    // Try with frontend format (slot_X)
    else if (normalizedSlotId.startsWith('Bloque_')) {
      const slotNumber = normalizedSlotId.replace('Bloque_', '');
      const frontendSlotId = `slot_${slotNumber}`;

      if (availabilityInfo.slotsInfo[frontendSlotId]) {
        slotInfo = availabilityInfo.slotsInfo[frontendSlotId];
        actualSlotId = frontendSlotId;
        console.log(`[Backend] Found slot with frontend ID ${frontendSlotId}`);
      }
    }

    // If we still couldn't find the slot, try with just the number
    if (!slotInfo) {
      // Extract the slot number
      let slotNumber = null;

      if (normalizedSlotId.startsWith('block_')) {
        slotNumber = normalizedSlotId.replace('block_', '');
      } else if (normalizedSlotId.startsWith('Bloque_')) {
        slotNumber = normalizedSlotId.replace('Bloque_', '');
      } else if (normalizedSlotId.startsWith('slot_')) {
        slotNumber = normalizedSlotId.replace('slot_', '');
      }

      // Try all possible formats with this number
      if (slotNumber) {
        const possibleFormats = [
          `block_${slotNumber}`,
          `Bloque_${slotNumber}`,
          `slot_${slotNumber}`
        ];

        for (const format of possibleFormats) {
          if (availabilityInfo.slotsInfo[format]) {
            slotInfo = availabilityInfo.slotsInfo[format];
            actualSlotId = format;
            console.log(`[Backend] Found slot with alternative format ${format}`);
            break;
          }
        }
      }
    }

    // If we still couldn't find the slot, return an error
    if (!slotInfo) {
      console.error(`[Backend] Error: Slot ${normalizedSlotId} does not exist for this date`);
      return {
        success: false,
        error: `Slot ${normalizedSlotId} does not exist for this date`
      };
    }

    // We already have slotInfo from the previous code
    console.log(`[Backend] Slot information: ${JSON.stringify(slotInfo)}`);

    // Check if the doctor has configured this slot
    if (slotInfo.configuredByDoctor === false) {
      console.error(`[Backend] Error: The doctor has not configured this slot as available`);
      return {
        success: false,
        error: `The doctor has not configured this slot as available`
      };
    }

    // Check if the slot is available
    if (slotInfo.available === false) {
      if (slotInfo.status === 'reserved') {
        console.error(`[Backend] Error: This slot is already reserved by another patient`);
        return {
          success: false,
          error: `This slot is already reserved by another patient`
        };
      } else {
        console.error(`[Backend] Error: This slot is not available`);
        return {
          success: false,
          error: `This slot is not available`
        };
      }
    }

    // If we got here, the slot is available
    console.log(`[Backend] Slot ${actualSlotId} is available and will be used for the appointment`);

    // Si llegamos aquí, el slot está disponible, podemos crear la cita
    console.log(`[Backend] Creando cita para doctor ${doctorIdInt}, paciente ${patientIdInt}, fecha ${dateStr}, slot ${normalizedSlotId}`);

    // Adjust the appointment time based on the slot
    let slotNumber;
    if (normalizedSlotId.startsWith('block_')) {
      slotNumber = parseInt(normalizedSlotId.replace('block_', ''));
    } else if (normalizedSlotId.startsWith('Bloque_')) {
      // Handle legacy format
      slotNumber = parseInt(normalizedSlotId.replace('Bloque_', ''));
    } else {
      console.error(`[Backend] Invalid slot ID format: ${normalizedSlotId}`);
      return {
        success: false,
        error: `Invalid slot ID format: ${normalizedSlotId}`
      };
    }

    const appointmentHour = slotNumber + 7; // block_1 -> 8:00, block_2 -> 9:00, etc.

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

    // Define default slots (8:00 AM to 1:00 AM)
    // We'll use only the new format (block_X) for default slots
    // and handle legacy format (Bloque_X) when processing doctor schedules

    // Include all possible slots (1-18)
    const defaultSlots = [];
    for (let i = 1; i <= 18; i++) {
      defaultSlots.push(`block_${i}`);
    }

    console.log(`[Backend] Default slots (${defaultSlots.length}):`, defaultSlots.join(', '));

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

    // Process each doctor schedule entry
    doctorSchedule.forEach(schedule => {
      // Get the slot ID from the schedule
      const originalSlotId = schedule.slotId;

      // Normalize to the new format (block_X)
      const normalizedSlotId = normalizeSlotId(originalSlotId);

      console.log(`[Backend] Processing slot: ${originalSlotId} -> normalized: ${normalizedSlotId}, available: ${schedule.available}, date: ${schedule.date.toISOString()}`);

      // Extract the slot number for consistent handling
      let slotNumber = null;

      if (normalizedSlotId.startsWith('block_')) {
        slotNumber = parseInt(normalizedSlotId.replace('block_', ''));
      } else if (normalizedSlotId.startsWith('Bloque_')) {
        slotNumber = parseInt(normalizedSlotId.replace('Bloque_', ''));
      } else if (normalizedSlotId.startsWith('slot_')) {
        slotNumber = parseInt(normalizedSlotId.replace('slot_', ''));
      }

      if (slotNumber === null || isNaN(slotNumber)) {
        console.warn(`[Backend] Could not extract slot number from ${normalizedSlotId}, skipping`);
        return; // Skip this slot
      }

      // Always use the new format for consistency
      const standardSlotId = `block_${slotNumber}`;

      if (slotsInfo[standardSlotId]) {
        slotsInfo[standardSlotId].configuredByDoctor = true;
        slotsInfo[standardSlotId].available = schedule.available;

        // Update status based on doctor configuration
        if (schedule.available) {
          slotsInfo[standardSlotId].status = 'available';
          console.log(`[Backend] Slot ${standardSlotId} marked as available`);
        } else {
          slotsInfo[standardSlotId].status = 'unavailable';
          console.log(`[Backend] Slot ${standardSlotId} marked as unavailable`);
        }
      } else {
        console.log(`[Backend] WARNING: Slot ${standardSlotId} not found in slotsInfo`);

        // Create the slot if it doesn't exist
        slotsInfo[standardSlotId] = {
          id: standardSlotId,
          hour: getHourFromSlotId(standardSlotId),
          configuredByDoctor: true,
          available: schedule.available,
          status: schedule.available ? 'available' : 'unavailable',
          reservedByPatient: null
        };

        console.log(`[Backend] Slot ${standardSlotId} created with status: ${slotsInfo[standardSlotId].status}`);
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

    // Apply existing appointments
    existingAppointments.forEach(appointment => {
      const hour = appointment.date.getHours();
      const slotIndex = hour - 7; // 8:00 -> 1, 9:00 -> 2, etc.

      // Always use the new format for consistency
      const slotId = `block_${slotIndex}`;

      console.log(`[Backend] Processing existing appointment at ${appointment.date.toISOString()}, hour: ${hour}, slotIndex: ${slotIndex}, slotId: ${slotId}`);

      if (slotsInfo[slotId]) {
        // Mark as reserved
        slotsInfo[slotId].available = false;
        slotsInfo[slotId].status = 'reserved';
        slotsInfo[slotId].reservedByPatient = {
          id: appointment.patientId,
          name: appointment.patient?.user?.name || 'Patient',
          appointmentId: appointment.id
        };

        console.log(`[Backend] Slot ${slotId} marked as reserved for patient ${appointment.patientId}`);
      } else {
        console.log(`[Backend] Warning: Slot ${slotId} not found in slotsInfo for existing appointment at ${appointment.date.toISOString()}`);

        // Try to find the slot with a different format
        const alternativeFormats = [
          `Bloque_${slotIndex}`,
          `slot_${slotIndex}`
        ];

        let found = false;
        for (const format of alternativeFormats) {
          if (slotsInfo[format]) {
            // Mark as reserved
            slotsInfo[format].available = false;
            slotsInfo[format].status = 'reserved';
            slotsInfo[format].reservedByPatient = {
              id: appointment.patientId,
              name: appointment.patient?.user?.name || 'Patient',
              appointmentId: appointment.id
            };

            console.log(`[Backend] Found slot with alternative format ${format}, marked as reserved`);
            found = true;
            break;
          }
        }

        if (!found) {
          // Create the slot if it doesn't exist
          slotsInfo[slotId] = {
            id: slotId,
            hour: getHourFromSlotId(slotId),
            configuredByDoctor: true, // Assume it was configured since there's an appointment
            available: false,
            status: 'reserved',
            reservedByPatient: {
              id: appointment.patientId,
              name: appointment.patient?.user?.name || 'Patient',
              appointmentId: appointment.id
            }
          };

          console.log(`[Backend] Created slot ${slotId} and marked as reserved`);
        }
      }
    });

    // Crear arrays separados para diferentes vistas
    const availableSlots = {};
    const reservedSlots = {};
    const allSlots = {};

    // Convertir los IDs de slots del formato del backend al formato del frontend
    const frontendSlotsInfo = {};

    // Process slots for frontend
    // We need to handle the case where we have both block_X and Bloque_X for the same slot

    // First, group slots by their slot number to avoid duplicates
    const slotsByNumber = {};

    Object.keys(slotsInfo).forEach(slotId => {
      const info = slotsInfo[slotId];
      let slotNumber = null;

      // Extract the slot number
      if (slotId.startsWith('block_')) {
        slotNumber = parseInt(slotId.replace('block_', ''));
      } else if (slotId.startsWith('Bloque_')) {
        slotNumber = parseInt(slotId.replace('Bloque_', ''));
      } else if (slotId.startsWith('slot_')) {
        slotNumber = parseInt(slotId.replace('slot_', ''));
      }

      if (slotNumber === null || isNaN(slotNumber)) {
        console.warn(`[Backend] Could not extract slot number from ${slotId}, skipping`);
        return; // Skip this slot
      }

      // If we already have this slot number, merge the information
      if (slotsByNumber[slotNumber]) {
        // Prefer slots that are configured by the doctor
        if (!slotsByNumber[slotNumber].configuredByDoctor && info.configuredByDoctor) {
          slotsByNumber[slotNumber] = info;
        }
        // Prefer slots that are reserved
        else if (slotsByNumber[slotNumber].status !== 'reserved' && info.status === 'reserved') {
          slotsByNumber[slotNumber] = info;
        }
        // Prefer slots that are available
        else if (slotsByNumber[slotNumber].status !== 'available' && info.status === 'available') {
          slotsByNumber[slotNumber] = info;
        }
      } else {
        slotsByNumber[slotNumber] = info;
      }
    });

    // Now process the unique slots by number
    Object.keys(slotsByNumber).forEach(slotNumber => {
      const info = slotsByNumber[slotNumber];
      const frontendSlotId = `slot_${slotNumber}`;
      const backendSlotId = `block_${slotNumber}`;

      console.log(`[Backend] Processing slot ${slotNumber}: status=${info.status}, available=${info.available}, configuredByDoctor=${info.configuredByDoctor}`);

      // For availability view (compatible with previous format)
      availableSlots[frontendSlotId] = info.available;

      // For reservations view
      if (info.status === 'reserved') {
        reservedSlots[frontendSlotId] = info.reservedByPatient;
      }

      // For complete view
      allSlots[frontendSlotId] = {
        id: frontendSlotId,
        hour: info.hour,
        status: info.status,
        configuredByDoctor: info.configuredByDoctor
      };

      // Save detailed information with frontend ID
      frontendSlotsInfo[frontendSlotId] = {
        ...info,
        id: frontendSlotId
      };
    });

    // Contar cuántos slots están disponibles después de la conversión
    const frontendAvailableCount = Object.values(frontendSlotsInfo).filter(info => info.status === 'available').length;
    console.log(`[Backend] Slots disponibles después de la conversión: ${frontendAvailableCount}`);

    // Check if there is at least one available slot
    const hasAvailableSlots = Object.values(frontendSlotsInfo).some(info => info.status === 'available' && info.available === true);
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
 * @param {string} slotId - Slot ID (e.g., 'block_1', 'Bloque_1', or 'slot_1')
 * @returns {string} Hour string (e.g., '8:00 - 9:00')
 */
const getHourFromSlotId = (slotId) => {
  if (!slotId) {
    console.warn(`[Backend] getHourFromSlotId: slotId is null or undefined`);
    return 'Unknown hour';
  }

  // Extract the number from the slot ID using various formats
  let slotNumber = null;

  // Try all possible formats
  if (slotId.startsWith('block_')) {
    slotNumber = parseInt(slotId.replace('block_', ''));
  } else if (slotId.startsWith('Bloque_')) {
    slotNumber = parseInt(slotId.replace('Bloque_', ''));
  } else if (slotId.startsWith('slot_')) {
    slotNumber = parseInt(slotId.replace('slot_', ''));
  } else if (!isNaN(slotId)) {
    slotNumber = parseInt(slotId);
  }

  if (slotNumber === null || isNaN(slotNumber)) {
    console.warn(`[Backend] Invalid slot ID format: ${slotId}`);
    return 'Unknown hour';
  }

  // Map slot numbers to hours
  // slot 1 -> 8:00, slot 2 -> 9:00, etc.
  const startHour = slotNumber + 7; // slot 1 -> 8:00, slot 2 -> 9:00, etc.
  const endHour = startHour + 1;

  // Format hours correctly, even for hours greater than 23
  let formattedStartHour = startHour;
  let formattedEndHour = endHour;

  // If the hour is greater than 23, show it as is to maintain consistency
  // with the rest of the code, even though it's technically not a valid 24h format

  console.log(`[Backend] Slot ${slotId} -> Hour ${formattedStartHour}:00 - ${formattedEndHour}:00`);
  return `${formattedStartHour}:00 - ${formattedEndHour}:00`;
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
