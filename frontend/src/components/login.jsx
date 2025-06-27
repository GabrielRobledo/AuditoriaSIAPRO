import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../styles/login.css';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:3000/api/login', { usuario, contraseña });
      localStorage.setItem('token', res.data.token);

      Swal.fire({
        title: '¡Login exitoso!',
        text: 'Has iniciado sesión correctamente.',
        icon: 'success',
        confirmButtonText: 'Continuar'
      });

      console.log('Login exitoso');
    } catch (err) {
      console.log('Error en login:', err);

      let mensajeError = 'Error inesperado. Intenta de nuevo.';
      if (err.response && err.response.data && err.response.data.message) {
        mensajeError = err.response.data.message;
      } else if (err.message) {
        mensajeError = err.message;
      }

      Swal.fire({
        title: 'Error de login',
        text: mensajeError,
        icon: 'error',
        confirmButtonText: 'Intentar nuevamente'
      });
    }
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleLogin}>
        <h3>Iniciar Sesión</h3>
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={e => setUsuario(e.target.value)}
          className="input"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contraseña}
          onChange={e => setContraseña(e.target.value)}
          className="input"
        />
        <button type="submit" className="button">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
