import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../styles/login.css';
import API_URL from '../config';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const toggleMostrarPassword = () => setMostrarPassword(!mostrarPassword);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!usuario.trim() || !contraseña.trim()) {
      Swal.fire({
        title: 'Campos requeridos',
        text: 'Por favor completa todos los campos.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    try {
      setCargando(true);
      // Simulación de login exitoso con rol
      const fakeToken = 'token-falso-123456';
      const fakeRol = 'auditor'; // o 'admin'
      localStorage.setItem('token', fakeToken);
      localStorage.setItem('rol', fakeRol);

      Swal.fire({
        title: '¡Login exitoso!',
        text: 'Has iniciado sesión correctamente.',
        icon: 'success',
        confirmButtonText: 'Continuar',
      }).then(() => {
        navigate('/dashboard'); // Redirige después del login
      });

    } catch (err) {
      Swal.fire({
        title: 'Error de login',
        text: 'Credenciales incorrectas o error del servidor.',
        icon: 'error',
        confirmButtonText: 'Intentar nuevamente',
      });
    } finally {
      setCargando(false);
    }
  };


  return (
    <div className="login-wrapper">
      <div className="login-info">
        <h1>SiaPro Audit</h1>
        <p>
          Bienvenido al sistema de auditoría de atenciones médicas. Controla, supervisa y mejora la calidad de atención en instituciones de salud con eficiencia, precisión y trazabilidad.
        </p>
      </div>

      <div className="login-form-container">
        <img src="/logo1.png" alt="Logo SiaPro Audit" className="login-logo" />
        <h2 className="title">Iniciar Sesión</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="input"
            required
          />

          <label htmlFor="contraseña">Contraseña</label>
          <div className="password-container">
            <input
              id="contraseña"
              type={mostrarPassword ? 'text' : 'password'}
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              className="input password-input"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={toggleMostrarPassword}
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {mostrarPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="button" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>

  );
}

export default Login;
