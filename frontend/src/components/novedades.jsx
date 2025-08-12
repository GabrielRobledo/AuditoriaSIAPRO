import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiTrash2, FiEdit } from 'react-icons/fi';
import API_URL from '../config';
import '../styles/novedades.css';

const CrearNovedad = () => {
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [novedades, setNovedades] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Cargar novedades al iniciar
  useEffect(() => {
    const fetchNovedades = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/novedades`);
        setNovedades(response.data);
      } catch (e) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las novedades.',
          confirmButtonColor: '#d33',
        });
      }
    };
    fetchNovedades();
  }, []);

  // Enviar novedad (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !mensaje.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Por favor completa todos los campos.',
        confirmButtonColor: '#f39c12',
      });
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        // Si estamos editando, hacemos una solicitud PUT
        await axios.put(`${API_URL}/api/actualizarNovedad`, { id: editingId, titulo, mensaje });
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Novedad actualizada con éxito!',
          confirmButtonColor: '#28a745',
        });
      } else {
        // Si no estamos editando, hacemos una solicitud POST
        await axios.post(`${API_URL}/api/crearNovedades`, { titulo, mensaje });
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Novedad creada con éxito!',
          confirmButtonColor: '#28a745',
        });
      }
      setTitulo('');
      setMensaje('');
      setEditingId(null);
      // Recargar novedades después de crear o actualizar
      const response = await axios.get(`${API_URL}/api/novedades`);
      setNovedades(response.data);
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al procesar la novedad.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar novedad con confirmación de Swal
  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${API_URL}/api/eliminarNovedad/${id}`).then(() => {
          setNovedades(novedades.filter((novedad) => novedad.id !== id));
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'Novedad eliminada correctamente',
            confirmButtonColor: '#d33',
          });
        });
      }
    });
  };

  // Editar novedad
  const handleEdit = (novedad) => {
    setTitulo(novedad.titulo);
    setMensaje(novedad.mensaje);
    setEditingId(novedad.id);
  };

  return (
    <div className="novedades-container">
      <form className="novedades-form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Editar Novedad' : 'Crear Novedad'}</h2>
        <input
          type="text"
          name="titulo"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
        <textarea
          name="mensaje"
          placeholder="Escriba el contenido de la novedad aquí..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Procesando...' : editingId ? 'Actualizar' : 'Crear'}
        </button>
      </form>

      {/* Tabla de novedades */}
      <div className="novedades-list">
        <table className="novedades-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Mensaje</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {novedades.map((novedad) => (
              <tr key={novedad.id}>
                <td>{novedad.titulo}</td>
                <td>{novedad.mensaje}</td>
                <td>
                  <FiEdit onClick={() => handleEdit(novedad)} className="edit-icon" />
                  <FiTrash2 onClick={() => handleDelete(novedad.id)} className="delete-icon" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CrearNovedad;
