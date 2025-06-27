import { useState } from 'react';
import { register } from '../services/authServices';
import Swal from 'sweetalert2'; // 👈 importar SweetAlert2
import '../styles/registerUser.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    contraseña: '',
    idTipoUsuario: 1
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await register(formData);

      // ✅ Mostrar mensaje de éxito con SweetAlert2
      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: res.msg,
        confirmButtonColor: '#007bff'
      });

      // ✅ Limpiar campos del formulario
      setFormData({
        nombre: '',
        usuario: '',
        contraseña: '',
        idTipoUsuario: 1
      });

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.msg || 'Error en el registro',
        confirmButtonColor: '#d33'
      });
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Registrar Usuario</h2>
      <input
        type="text"
        name="nombre"
        placeholder="Nombre completo"
        value={formData.nombre}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="usuario"
        placeholder="Correo electrónico"
        value={formData.usuario}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="contraseña"
        placeholder="Contraseña"
        value={formData.contraseña}
        onChange={handleChange}
        required
      />
      <select
        name="idTipoUsuario"
        value={formData.idTipoUsuario}
        onChange={handleChange}
      >
        <option value="1">Administrador</option>
        <option value="2">Auditor</option>
      </select>
      <button type="submit">Registrar</button>
    </form>
  );
};

export default RegisterForm;
