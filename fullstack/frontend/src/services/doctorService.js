import axios from 'axios';
import { API_URL } from '../config';

/**
 * Obtiene todos los doctores
 * @returns {Promise<Array>} - Array con los doctores
 */
export const getAllDoctors = async () => {
  try {
    console.log('Obteniendo lista de doctores');
    const response = await axios.get(`${API_URL}/doctors`);
    
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener doctores:', error);
    throw error;
  }
};

/**
 * Obtiene un doctor por su ID
 * @param {number} doctorId - ID del doctor
 * @returns {Promise<Object>} - Objeto con los datos del doctor
 */
export const getDoctorById = async (doctorId) => {
  try {
    console.log(`Obteniendo doctor con ID ${doctorId}`);
    const response = await axios.get(`${API_URL}/doctors/${doctorId}`);
    
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener doctor:', error);
    throw error;
  }
};

/**
 * Obtiene los horarios disponibles de un doctor
 * @param {number} doctorId - ID del doctor
 * @returns {Promise<Object>} - Objeto con los horarios disponibles
 */
export const getDoctorSchedule = async (doctorId) => {
  try {
    console.log(`Obteniendo horarios del doctor ${doctorId}`);
    const response = await axios.get(`${API_URL}/doctors/${doctorId}/schedule`);
    
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener horarios del doctor:', error);
    throw error;
  }
};
