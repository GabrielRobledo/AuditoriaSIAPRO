import { Layout , Button, theme} from 'antd';
import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Sidebar from './sidebar'
import TablaConFiltro  from './tabla';
import { MenuUnfoldOutlined, MenuFoldOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Sider, Content, Footer } = Layout;

const BasicLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [datos, setDatos] = useState([]);
  const [tablaSeleccionada, setTablaSeleccionada] = useState('atenciones');

  useEffect(() => {
    fetch(`http://localhost:3000/api/${tablaSeleccionada}`)
      .then(res => res.json())
      .then(json => {
        setDatos(json);
      })
      .catch(err => console.error(err));
  }, [tablaSeleccionada]);

  return (
    <Layout>
      {/* menu lateral */}
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="Profile_info" style={{ textAlign: 'center' }}>
          {!collapsed && (
            <img
              src="logo1.png"
              className="Profile_image"
              alt="Profile"
              style={{ width: '150px', height:'150px', transition: 'opacity 0.3s', marginTop:'25px' , borderRadius: '100%' }}
            />
          )}
        </div>
          <Sidebar onSeleccion={setTablaSeleccionada} />
      </Sider>
      <Layout style={{ padding: '0 24px 24px' }}>
          {/* Encabezado */}
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <input placeholder='Ingresa tu busqueda...' style={{padding: '8px', width:'50%', border: 'none' , backgroundColor: 'white'}}/>
            <Link to='/login'><LoginOutlined></LoginOutlined></Link>
          </Header>
          {/* contenido principal (central) */}
          <Content style={{ margin: '24px 0', background: '#fff', padding: 24 }}>
            <Outlet />
            <h2>Listado de {tablaSeleccionada.charAt(0).toUpperCase() + tablaSeleccionada.slice(1)}</h2>
            <TablaConFiltro datos={datos} />
            
          </Content>

          {/* Pie de página */}
          <Footer style={{ textAlign: 'center' }}>
              ©2025 Gabriel Robledo. Todos los derechos reservados.
          </Footer>
        </Layout>     
    </Layout>  
    
  );
};

export default BasicLayout;
