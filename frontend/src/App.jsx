import { Routes, Route } from 'react-router-dom';
import BasicLayout from './components/layout';
import Dashboard from './components/dashboard';
import Login from './components/login';
import Home from './components/home'
import DashboardAuditor from './components/dashboardAuditor';
import VistaRegistros from './components/vistaRegistros';
import RegisterForm from './components/registrarUsuario';
import Usuarios from './components/usuarios';
import AsignarHospitales from './components/AsignarUserHosp';
import AuditoriasList from './components/listaAuditorias';
import ResultadosBusqueda from './components/ResultadosBusquedas';
import Perfil from './components/perfil';
import AuditoriaDetalle from './components/auditoriaDetallePDF';
import HospConBorradorCards from './components/listadoAuditoriasBorradores';
import TablaBorradores from './components/tablaAuditoriaProgreso';
import EstadisticasCierresAuditorias from './components/estadisticasCierresAuditorias';
import CierreDeAuditoria from './components/cierreDeAuditoria';

const hoy = new Date();
const anio = hoy.getFullYear();
const mes = String(hoy.getMonth() + 1).padStart(2, '0');
const periodo = `${anio}-${mes}`;

const App = () => {
  return (
    <Routes>
      <Route path='login' element={<Login/>} />
      <Route path="/" element={<BasicLayout />}>
        <Route path="registros/:tipo" element={<VistaRegistros />} />
        <Route index element={<Dashboard />} />
        <Route path='register' element={<RegisterForm />} />
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='dashboardAuditor' element={<DashboardAuditor />} />
        <Route path='usuarios' element={<Usuarios />} />
        <Route path='auditorias' element={<AuditoriasList />} />
        <Route path='auditorias/:id' element={<VistaRegistros editarAuditoria={true} />} />
        <Route path='asignaciones' element={<AsignarHospitales/>} />
        <Route path="/busqueda" element={<ResultadosBusqueda />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/auditorias/:id/detalle" element={<AuditoriaDetalle />} />
        <Route path="/auditoriasParciales" element={<HospConBorradorCards />} />
        <Route path="/borradores/tabla/:idEfector" element={<TablaBorradores />} />
        <Route path="/estadisticasCierres" element={<EstadisticasCierresAuditorias />} />
        <Route path="/cierreDeAuditoria" element={<CierreDeAuditoria periodo={periodo} idUsuario={2} />} />

      </Route>
    </Routes>
  );
};

export default App;