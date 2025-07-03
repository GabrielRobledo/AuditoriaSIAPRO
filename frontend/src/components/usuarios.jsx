import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiEdit, FiTrash2, FiRotateCcw } from 'react-icons/fi';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [mostrarEliminados, setMostrarEliminados] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, [mostrarEliminados]);

  const cargarUsuarios = () => {
    axios
      .get(`http://localhost:3000/api/auth/usuarios?eliminados=${mostrarEliminados}`)
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error('Error al obtener usuarios:', err));
  };

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
        axios
          .delete(`http://localhost:3000/api/auth/usuarios/${id}`)
          .then(() => {
            Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
            cargarUsuarios();
          })
          .catch((err) => {
            const mensaje = err.response?.data?.msg || 'No se pudo eliminar el usuario';
            Swal.fire('No se puede eliminar', mensaje, 'error');
          });
      }
    });
  };

  const handleRestore = (id) => {
    Swal.fire({
      title: '¿Restaurar usuario?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(`http://localhost:3000/api/auth/usuarios/restore/${id}`)
          .then(() => {
            Swal.fire('Restaurado', 'El usuario fue restaurado', 'success');
            cargarUsuarios();
          })
          .catch(() => Swal.fire('Error', 'No se pudo restaurar', 'error'));
      }
    });
  };

  const handleEdit = (user) => {
    const tipoMap = {
      administrador: 1,
      auditor: 2,
    };
    setEditingUser({
      ...user,
      idTipoUsuario: tipoMap[user.tipoUsuario?.toLowerCase()] ?? 2,
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:3000/api/auth/usuarios/${editingUser.idUsuario}`, editingUser)
      .then(() => {
        Swal.fire('Actualizado', 'Usuario editado correctamente', 'success');
        setEditingUser(null);
        cargarUsuarios();
      })
      .catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingUser({
      ...editingUser,
      [name]: name === 'idTipoUsuario' ? parseInt(value) : value,
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: 'auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Usuarios</h2>

      <label style={{ marginBottom: '1rem', display: 'inline-block', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={mostrarEliminados}
          onChange={() => setMostrarEliminados(!mostrarEliminados)}
          style={{ marginRight: '8px' }}
        />
        Mostrar eliminados
      </label>

      {/* === Tabla moderna === */}
      <div style={{
        overflowX: 'auto',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginTop: '10px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Usuario</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Editar</th>
              <th style={thStyle}>Eliminar</th>
              <th style={thStyle}>Restaurar</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user, idx) => (
              <tr
                key={user.idUsuario}
                style={{
                  backgroundColor: user.delete_add ? '#fce4ec' : idx % 2 === 0 ? '#f9f9f9' : '#fff',
                  opacity: user.delete_add ? 0.5 : 1,
                  transition: 'background-color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = user.delete_add ? '#fce4ec' : (idx % 2 === 0 ? '#f9f9f9' : '#fff')}
              >
                <td style={tdStyle}>{user.nombre}</td>
                <td style={tdStyle}>{user.usuario}</td>
                <td style={tdStyle}>{user.tipoUsuario}</td>

                <td style={tdStyle}>
                  {!user.delete_add && (
                    <FiEdit
                      onClick={() => handleEdit(user)}
                      style={{ cursor: 'pointer', color: '#1976d2', fontSize: '1.5rem' }}
                      title="Editar usuario"
                    />
                  )}
                </td>

                <td style={tdStyle}>
                  {!user.delete_add && (
                    <FiTrash2
                      onClick={() => handleDelete(user.idUsuario)}
                      style={{ cursor: 'pointer', color: '#d32f2f', fontSize: '1.6rem' }}
                      title="Eliminar usuario"
                    />
                  )}
                </td>

                <td style={tdStyle}>
                  {user.delete_add && (
                    <FiRotateCcw
                      onClick={() => handleRestore(user.idUsuario)}
                      style={{ cursor: 'pointer', color: '#388e3c', fontSize: '1.6rem' }}
                      title="Restaurar usuario"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === Formulario de edición === */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <form
            onSubmit={handleEditSubmit}
            style={{
              background: '#fff',
              padding: '25px 30px',
              borderRadius: '10px',
              width: '320px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
          >
            <h3 style={{ margin: 0, textAlign: 'center', color: '#333' }}>Editar Usuario</h3>

            <input
              type="text"
              name="nombre"
              value={editingUser.nombre}
              onChange={handleChange}
              placeholder="Nombre completo"
              required
              style={inputStyle}
            />

            <input
              type="text"
              name="usuario"
              value={editingUser.usuario}
              onChange={handleChange}
              placeholder="Correo electrónico"
              required
              style={inputStyle}
            />

            <select
              name="idTipoUsuario"
              value={editingUser.idTipoUsuario}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="1">Administrador</option>
              <option value="2">Auditor</option>
            </select>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="submit" style={btnPrimary}>Guardar</button>
              <button type="button" onClick={() => setEditingUser(null)} style={btnDanger}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Usuarios;

// === Estilos reutilizables inline ===
const thStyle = {
  backgroundColor: '#1976d2',
  color: '#fff',
  textAlign: 'left',
  padding: '12px 16px'
};

const tdStyle = {
  padding: '12px 16px',
  borderBottom: '1px solid #e0e0e0'
};

const inputStyle = {
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '14px'
};

const btnPrimary = {
  flex: 1,
  backgroundColor: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '10px',
  fontSize: '14px',
  cursor: 'pointer'
};

const btnDanger = {
  flex: 1,
  backgroundColor: '#d32f2f',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '10px',
  fontSize: '14px',
  marginLeft: '10px',
  cursor: 'pointer'
};
