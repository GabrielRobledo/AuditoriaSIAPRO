import {Menu} from 'antd';
import { Link } from 'react-router-dom';
import {HomeOutlined, DatabaseOutlined, BarsOutlined, DashboardOutlined} from '@ant-design/icons';
//import '../styles/navbar.css'

const sidebar = ({ onSeleccion }) => {
  return (
    <Menu theme='dark' style={{paddingTop:'20%'}}>
        
        <Menu.Item key="Register" icon={<HomeOutlined/>}>
            <Link to="/register">Register</Link>
        </Menu.Item>
        <Menu.Item key="Dashboard" icon={<DashboardOutlined/>}>
            <Link to="/dashboard">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="DashboardAuditor" icon={<DashboardOutlined/>}>
            <Link to="/dashboardAuditor">Dashboard Auditor</Link>
        </Menu.Item>
        <Menu.Item key="Auditorias" icon={<BarsOutlined/>}>
           <Link to="/auditorias">Auditoria</Link>
        </Menu.Item>
        <Menu.Item key="Usuarios" icon={<BarsOutlined/>}>
           <Link to="/usuarios">Usuarios</Link>
        </Menu.Item>
        <Menu.SubMenu key="Registros" icon={<DatabaseOutlined/>} title="Registros">
          <Menu.Item key="atenciones">
            <Link to="/registros/atenciones">Atenciones</Link>
          </Menu.Item>
          <Menu.Item key="beneficiarios">
            <Link to="/registros/beneficiarios">Pacientes</Link>
          </Menu.Item>
          <Menu.Item key="efectores">
            <Link to="/registros/efectores">Prestadores</Link>
          </Menu.Item>
          </Menu.SubMenu>
                  <Menu.Item key="asignaciones" icon={<BarsOutlined/>}>
            <Link to="/asignaciones">Asignar Hospitales</Link>
          </Menu.Item>
    </Menu>
  )
}

export default sidebar