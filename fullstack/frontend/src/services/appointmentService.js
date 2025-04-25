import axios from 'axios';
import { API_URL } from '../config';
import { normalizeSlotId, denormalizeSlotId } from '../utils/slotUtils';

/**
 * Obtiene los horarios disponibles para un doctor en una fecha específica
 * @param {number} doctorId - ID del doctor
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {Promise<Object>} - Objeto con los horarios disponibles
 */
export const getAvailableSlotsForDate = async (doctorId, date) => {
  try {
    console.log(`Obteniendo horarios disponibles para doctor ${doctorId} en fecha ${date}`);
    const response = await axios.get(`${API_URL}/appointments/available/${doctorId}/${date}`);

    console.log('Respuesta del servidor:', response.data);

    // Convert slot IDs from backend format to frontend format
    const convertedSlots = {};
    const convertedSlotsInfo = {};
    const convertedAllSlots = {};

    // First, handle the slots availability map
    if (response.data.slots) {
      console.log('Available slots in backend:', Object.keys(response.data.slots).length);
      Object.keys(response.data.slots).forEach(slotId => {
        const frontendSlotId = denormalizeSlotId(slotId);
        convertedSlots[frontendSlotId] = response.data.slots[slotId];
        console.log(`Slot ${slotId} -> ${frontendSlotId}, available: ${response.data.slots[slotId]}`);
      });
    }

    // Then, handle the detailed slots information
    if (response.data.slotsInfo) {
      console.log('Slots info in backend:', Object.keys(response.data.slotsInfo).length);

      // Count how many slots are available
      const availableCount = Object.values(response.data.slotsInfo)
        .filter(slot => slot.status === 'available')
        .length;
      console.log(`Slots with status 'available' in backend: ${availableCount}`);

      // Group slots by their frontend ID to avoid duplicates
      const slotsByFrontendId = {};

      Object.keys(response.data.slotsInfo).forEach(slotId => {
        const frontendSlotId = denormalizeSlotId(slotId);
        const slotInfo = response.data.slotsInfo[slotId];

        // If we already have this frontend ID, only keep the one with more information
        if (slotsByFrontendId[frontendSlotId]) {
          // Prefer slots that are configured by the doctor
          if (!slotsByFrontendId[frontendSlotId].configuredByDoctor && slotInfo.configuredByDoctor) {
            slotsByFrontendId[frontendSlotId] = slotInfo;
          }
          // Prefer slots that are reserved
          else if (slotsByFrontendId[frontendSlotId].status !== 'reserved' && slotInfo.status === 'reserved') {
            slotsByFrontendId[frontendSlotId] = slotInfo;
          }
          // Prefer slots that are available
          else if (slotsByFrontendId[frontendSlotId].status !== 'available' && slotInfo.status === 'available') {
            slotsByFrontendId[frontendSlotId] = slotInfo;
          }
        } else {
          slotsByFrontendId[frontendSlotId] = slotInfo;
        }
      });

      // Now process the unique frontend slots
      Object.keys(slotsByFrontendId).forEach(frontendSlotId => {
        const slotInfo = slotsByFrontendId[frontendSlotId];

        // Make sure the status is maintained correctly
        convertedSlotsInfo[frontendSlotId] = {
          ...slotInfo,
          id: frontendSlotId
        };

        console.log(`Slot ${frontendSlotId}, status: ${slotInfo.status}, available: ${slotInfo.available}, configuredByDoctor: ${slotInfo.configuredByDoctor}`);
      });
    }

    // Convert all slots
    if (response.data.allSlots) {
      console.log('All slots in backend:', Object.keys(response.data.allSlots).length);

      // Group slots by their frontend ID to avoid duplicates
      const allSlotsByFrontendId = {};

      Object.keys(response.data.allSlots).forEach(slotId => {
        const frontendSlotId = denormalizeSlotId(slotId);
        const slotInfo = response.data.allSlots[slotId];

        // If we already have this frontend ID, only keep the one with more information
        if (allSlotsByFrontendId[frontendSlotId]) {
          // Prefer slots that are configured by the doctor
          if (!allSlotsByFrontendId[frontendSlotId].configuredByDoctor && slotInfo.configuredByDoctor) {
            allSlotsByFrontendId[frontendSlotId] = slotInfo;
          }
        } else {
          allSlotsByFrontendId[frontendSlotId] = slotInfo;
        }
      });

      // Now process the unique frontend slots
      Object.keys(allSlotsByFrontendId).forEach(frontendSlotId => {
        const slotInfo = allSlotsByFrontendId[frontendSlotId];

        convertedAllSlots[frontendSlotId] = {
          ...slotInfo,
          id: frontendSlotId
        };
      });
    }

    // Check how many slots are available after conversion
    const availableCount = Object.values(convertedSlotsInfo)
      .filter(slot => slot.status === 'available')
      .length;
    console.log(`Slots with status 'available' after conversion: ${availableCount}`);

    return {
      ...response.data,
      slots: convertedSlots,
      slotsInfo: convertedSlotsInfo,
      allSlots: convertedAllSlots
    };
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    throw error;
  }
};

/**
 * Crea una nueva cita
 * @param {Object} appointmentData - Datos de la cita
 * @returns {Promise<Object>} - Objeto con la cita creada
 */
export const createAppointment = async (appointmentData) => {
  try {
    console.log('Creando cita con datos:', appointmentData);

    // Validar los datos de la cita
    if (!appointmentData.doctorId) {
      console.error('Error: doctorId es requerido');
      return {
        success: false,
        error: 'El ID del doctor es requerido'
      };
    }

    if (!appointmentData.patientId) {
      console.error('Error: patientId es requerido');
      return {
        success: false,
        error: 'El ID del paciente es requerido'
      };
    }

    if (!appointmentData.date) {
      console.error('Error: date es requerido');
      return {
        success: false,
        error: 'La fecha de la cita es requerida'
      };
    }

    if (!appointmentData.slotId) {
      console.error('Error: slotId es requerido');
      return {
        success: false,
        error: 'El horario de la cita es requerido'
      };
    }

    // Normalizar el ID del slot si se proporciona
    let normalizedData = { ...appointmentData };
    if (appointmentData.slotId) {
      normalizedData.slotId = normalizeSlotId(appointmentData.slotId);
      console.log(`Slot ID normalizado: ${normalizedData.slotId}`);
    }

    console.log('Enviando datos normalizados:', normalizedData);
    const response = await axios.post(`${API_URL}/appointments`, normalizedData);
    console.log('Respuesta del servidor:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error al crear cita:', error);

    // Manejar diferentes tipos de errores
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Error del servidor:', error.response.data);
      return {
        success: false,
        error: error.response.data.error || 'Error al crear la cita'
      };
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor');
      return {
        success: false,
        error: 'No se recibió respuesta del servidor'
      };
    } else {
      // Ocurrió un error al configurar la solicitud
      console.error('Error al configurar la solicitud:', error.message);
      return {
        success: false,
        error: 'Error al configurar la solicitud'
      };
    }
  }
};

/**
 * Obtiene las citas de un paciente
 * @param {number} patientId - ID del paciente
 * @returns {Promise<Array>} - Array con las citas del paciente
 */
export const getPatientAppointments = async (patientId) => {
  try {
    console.log(`Obteniendo citas para paciente ${patientId}`);
    const response = await axios.get(`${API_URL}/appointments/patient/${patientId}`);

    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener citas del paciente:', error);
    throw error;
  }
};

/**
 * Obtiene las citas de un doctor
 * @param {number} doctorId - ID del doctor
 * @returns {Promise<Array>} - Array con las citas del doctor
 */
export const getDoctorAppointments = async (doctorId) => {
  try {
    console.log(`Obteniendo citas para doctor ${doctorId}`);
    const response = await axios.get(`${API_URL}/appointments/doctor/${doctorId}`);

    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener citas del doctor:', error);
    throw error;
  }
};

/**
 * Cancela una cita
 * @param {number} appointmentId - ID de la cita
 * @returns {Promise<Object>} - Objeto con el resultado de la operación
 */
export const cancelAppointment = async (appointmentId) => {
  try {
    console.log(`Cancelando cita ${appointmentId}`);
    const response = await axios.delete(`${API_URL}/appointments/${appointmentId}`);

    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    throw error;
  }
};
