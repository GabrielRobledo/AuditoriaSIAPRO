import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/api/login', {
        user,
        pass
      });

      localStorage.setItem('token', response.data.token);
      alert('Login exitoso');
    } catch (err) {
      console.error(err);
      alert('Login fallido');
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={user}
        onChange={e => setUser(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={pass}
        onChange={e => setPass(e.target.value)}
      />
      <button type="submit">Iniciar sesión</button>
    </form>
  );
}
