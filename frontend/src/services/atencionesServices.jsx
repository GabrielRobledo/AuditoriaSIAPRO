import axios from 'axios';

const API_URL = 'http://localhost:3000/api/atenciones'; 

export const getAtenciones = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener atenciones', error);
    throw error;
  }
};
