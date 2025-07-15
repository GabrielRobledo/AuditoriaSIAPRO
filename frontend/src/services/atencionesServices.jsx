import axios from 'axios';
import API_URL from '../config';

const API_URL = `${API_URL}/api/atenciones`; 

export const getAtenciones = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener atenciones', error);
    throw error;
  }
};
