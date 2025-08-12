import { Navigate, Outlet } from 'react-router-dom';

const RutaPorRol = ({ rolesPermitidos = [] }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return rolesPermitidos.includes(rol) ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

export default RutaPorRol;
