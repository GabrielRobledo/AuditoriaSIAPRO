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
import ResumenAuditor from './components/resumenAuditor';
import ReportesAuditorias from './components/reportesEstadisticos';
import EstadisticasAsignaciones from './components/estadisticasAsignacionesAuditores';
import PracticasMasDebitadas from './components/estadisticasPracticas';
import RutaProtegida from './components/rutasProtegidas';
import RutaPorRol from './components/rutasPorRol';
import AdminNovedades from './components/novedades';
import Motivos from './components/motivosForms';


const hoy = new Date();
const anio = hoy.getFullYear();
const mes = String(hoy.getMonth() + 1).padStart(2, '0');
const periodo = `${anio}-${mes}`;

const App = () => {
  return (
    <Routes>
      <Route path='login' element={<Login />} />

      {/* Rutas protegidas */}
      <Route element={<RutaProtegida />}>
        <Route path="/" element={<BasicLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="registros/:tipo" element={<VistaRegistros />} />
          <Route path='register' element={<RegisterForm />} />
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='dashboardAuditor' element={<DashboardAuditor />} />
          <Route path='usuarios' element={<Usuarios />} />
          <Route path='auditorias' element={<AuditoriasList />} />
          <Route path='auditorias/:id' element={<VistaRegistros editarAuditoria={true} />} />
          <Route path='asignaciones' element={<AsignarHospitales />} />
          <Route path='busqueda' element={<ResultadosBusqueda />} />
          <Route path='perfil' element={<Perfil />} />
          <Route path='auditorias/:id/detalle' element={<AuditoriaDetalle />} />
          <Route path='auditoriasParciales' element={<HospConBorradorCards />} />
          <Route path='borradores/tabla/:idEfector' element={<TablaBorradores />} />
          <Route path='estadisticasCierres' element={<EstadisticasCierresAuditorias />} />
          <Route path='cierreDeAuditoria' element={<CierreDeAuditoria periodo={periodo} idUsuario={1} />} />
          <Route path='resumen-auditor/:idUsuario' element={<ResumenAuditor />} />
          <Route path='reportes/reportesAuditorias' element={<ReportesAuditorias />} />
          <Route path='reportes/reportesAsignaciones' element={<EstadisticasAsignaciones />} />
          <Route path='reportes/practicas-mas-debitadas' element={<PracticasMasDebitadas />} />
          <Route path='novedades' element={<AdminNovedades />} />
          <Route path='motivos' element={<Motivos />} />
          
          {/* Rutas por rol */}
        </Route>
      </Route>
    </Routes>

  );
};

export default App;