import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import '../styles/Usuarios.css';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = () => {
    axios.get('http://localhost:3000/api/auth/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(err => console.error('Error al obtener usuarios:', err));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:3000/api/auth/usuarios/${id}`)
          .then(() => {
            Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
            cargarUsuarios();
          })
          .catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
      }
    });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:3000/api/auth/usuarios/${editingUser.idUsuario}`, editingUser)
      .then(() => {
        Swal.fire('Actualizado', 'Usuario editado correctamente', 'success');
        setEditingUser(null);
        cargarUsuarios();
      })
      .catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
  };

  const handleChange = (e) => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ maxWidth: '800px', margin: 'auto' }}>
      <h2>Usuarios</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Tipo</th>
            <th>Editar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(user => (
            <tr key={user.idUsuario}>
              <td>{user.nombre}</td>
              <td>{user.usuario}</td>
              <td>{user.tipoUsuario}</td>
              <td>
                <FiEdit
                  onClick={() => handleEdit(user)}
                  style={{ cursor: 'pointer', color: '#1976d2', fontSize: '1.5rem' }}
                />
              </td>
              <td>
                <FiTrash2
                  onClick={() => handleDelete(user.idUsuario)}
                  style={{ cursor: 'pointer', color: '#d32f2f', fontSize: '1.7rem' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <div style={{
          background: '#000000aa',
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <form
            onSubmit={handleEditSubmit}
            style={{ background: '#fff', padding: 20, borderRadius: 10, width: 300 }}
          >
            <h3>Editar Usuario</h3>
            <input type="text" name="nombre" value={editingUser.nombre} onChange={handleChange} required />
            <input type="text" name="usuario" value={editingUser.usuario} onChange={handleChange} required />
            <select name="idTipoUsuario" value={editingUser.idTipoUsuario} onChange={handleChange}>
              <option value="1">Administrador</option>
              <option value="2">Auditor</option>
            </select>
            <br /><br />
            <button type="submit">Guardar</button>
            <button type="button" onClick={() => setEditingUser(null)} style={{ marginLeft: 10 }}>Cancelar</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
