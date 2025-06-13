import {Menu} from 'antd';
import { Link } from 'react-router-dom';
import {HomeOutlined, DatabaseOutlined, BarsOutlined, DashboardOutlined} from '@ant-design/icons';
//import '../styles/navbar.css'

const sidebar = ({ onSeleccion }) => {
  return (
    <Menu theme='dark' style={{paddingTop:'20%'}}>
        
        <Menu.Item key="Home" icon={<HomeOutlined/>}>
            <Link to="/home">Home</Link>
        </Menu.Item>
        <Menu.Item key="Dashboard" icon={<DashboardOutlined/>}>
            <Link to="/dashboard">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="Auditorias" icon={<BarsOutlined/>}>
           <Link to="/auditorias">Auditoria</Link>
        </Menu.Item>
        <Menu.SubMenu key="Registros" icon={<DatabaseOutlined/>} title="Registros">
            <Menu.Item onClick={() => onSeleccion('atenciones')}>Atenciones</Menu.Item>
            <Menu.Item onClick={() => onSeleccion('beneficiarios')}>Pacientes</Menu.Item>
            <Menu.Item onClick={() => onSeleccion('efectores')}>Prestadores</Menu.Item>
        </Menu.SubMenu>
    </Menu>
  )
}

export default sidebar