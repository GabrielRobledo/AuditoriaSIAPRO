import axios from 'axios';
import API_URL from '../config';

export const cambiarPasswordService = async (idUsuario, datos) => {
  try {
    const token = localStorage.getItem('token'); // Asegúrate que se guarda al hacer login
    const response = await axios.put(
      `${API_URL}/api/auth/usuarios/${idUsuario}/cambiar-password`,
      datos,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'Error al cambiar la contraseña';
  }
};