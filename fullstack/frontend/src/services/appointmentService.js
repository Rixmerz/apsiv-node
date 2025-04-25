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

    // Convertir los IDs de slots del formato del backend al formato del frontend
    const convertedSlots = {};
    const convertedSlotsInfo = {};
    const convertedAllSlots = {};

    // Convertir los slots disponibles
    if (response.data.slots) {
      console.log('Slots disponibles en el backend:', Object.keys(response.data.slots).length);
      Object.keys(response.data.slots).forEach(slotId => {
        const frontendSlotId = denormalizeSlotId(slotId);
        convertedSlots[frontendSlotId] = response.data.slots[slotId];
        console.log(`Slot ${slotId} -> ${frontendSlotId}, disponible: ${response.data.slots[slotId]}`);
      });
    }

    // Convertir la información detallada de slots
    if (response.data.slotsInfo) {
      console.log('Información de slots en el backend:', Object.keys(response.data.slotsInfo).length);

      // Contar cuántos slots están disponibles
      const availableCount = Object.values(response.data.slotsInfo)
        .filter(slot => slot.status === 'available')
        .length;
      console.log(`Slots con status 'available' en el backend: ${availableCount}`);

      Object.keys(response.data.slotsInfo).forEach(slotId => {
        const frontendSlotId = denormalizeSlotId(slotId);
        const slotInfo = response.data.slotsInfo[slotId];

        // Asegurarse de que el status se mantenga correctamente
        convertedSlotsInfo[frontendSlotId] = {
          ...slotInfo,
          id: frontendSlotId
        };

        console.log(`Slot ${slotId} -> ${frontendSlotId}, status: ${slotInfo.status}, available: ${slotInfo.available}, configuredByDoctor: ${slotInfo.configuredByDoctor}`);
      });
    }

    // Convertir todos los slots
    if (response.data.allSlots) {
      console.log('Todos los slots en el backend:', Object.keys(response.data.allSlots).length);
      Object.keys(response.data.allSlots).forEach(slotId => {
        const frontendSlotId = denormalizeSlotId(slotId);
        const slotInfo = response.data.allSlots[slotId];

        convertedAllSlots[frontendSlotId] = {
          ...slotInfo,
          id: frontendSlotId
        };
      });
    }

    // Verificar cuántos slots están disponibles después de la conversión
    const availableCount = Object.values(convertedSlotsInfo)
      .filter(slot => slot.status === 'available')
      .length;
    console.log(`Slots con status 'available' después de la conversión: ${availableCount}`);

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

    // Normalizar el ID del slot si se proporciona
    let normalizedData = { ...appointmentData };
    if (appointmentData.slotId) {
      normalizedData.slotId = normalizeSlotId(appointmentData.slotId);
    }

    const response = await axios.post(`${API_URL}/appointments`, normalizedData);
    console.log('Respuesta del servidor:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error al crear cita:', error);
    throw error;
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
