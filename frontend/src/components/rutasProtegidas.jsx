import { Navigate, Outlet } from 'react-router-dom';

const RutaProtegida = () => {
  const token = localStorage.getItem('token');

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default RutaProtegida;