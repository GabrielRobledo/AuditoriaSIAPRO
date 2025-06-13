import { Routes, Route } from 'react-router-dom';
import BasicLayout from './components/layout';
import Dashboard from './components/dashboard';
import Login from './components/login';
import Home from './components/home'
import Auditoria from './components/auditoria'
import TablaConFiltro from './components/tabla';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<BasicLayout />}>
        <Route index element={<TablaConFiltro />} />
        <Route path='home' element={<Home />} />
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='auditorias' element={<Auditoria />} />
        {/* Puedes añadir más rutas aquí en el futuro */}
      </Route>
    </Routes>
  );
};

export default App;