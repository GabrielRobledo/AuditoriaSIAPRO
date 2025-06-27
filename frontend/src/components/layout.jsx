import { Layout, Button, theme, Input, Tooltip, Grid, Avatar, Dropdown, Menu } from 'antd';
import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const BasicLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();


  const screens = useBreakpoint();
  const navigate = useNavigate();
  const [tablaSeleccionada, setTablaSeleccionada] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSearch = () => {
    const q = searchTerm.trim();
    if (q) {
      navigate(`/busqueda?q=${encodeURIComponent(q)}`);
      setSearchTerm('');
    }
  };

  // Menú del avatar
  const userMenu = (
    <Menu>
      <Menu.Item key="account" icon={<UserOutlined />} onClick={() => navigate('/perfil')}>
        Mi cuenta
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Cerrar sesión
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        breakpoint="md"
        collapsedWidth={screens.xs ? 0 : 80}
        collapsible
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
      >
        <div className="Profile_info" style={{ textAlign: 'center' }}>
          {!collapsed && (
            <img
              src="logo1.png"
              alt="Profile"
              className={`Profile_image ${collapsed ? 'hidden' : ''}`}
              style={{
                width: '100px',
                height: '100px',
                marginTop: '20px',
                borderRadius: '50%',
                objectFit: 'cover',
                transition: 'opacity 0.3s, transform 0.3s',
                opacity: collapsed ? 0 : 1,
                transform: collapsed ? 'scale(0)' : 'scale(1)',
              }}
            />
          )}
        </div>
        <Sidebar onSeleccion={setTablaSeleccionada} />
      </Sider>

      {/* Layout principal */}
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            flexDirection: screens.xs ? 'column' : 'row',
            alignItems: screens.xs ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: screens.xs ? '8px' : '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
            {/* Botón de menú */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '20px' }}
            />

            {/* Buscador */}
            <Input
              placeholder="Buscar..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={handleSearch}
              style={{
                width: '100%',
                maxWidth: screens.xs ? '100%' : 400,
                borderRadius: '8px',
                backgroundColor: '#fff',
              }}
            />
          </div>

          {/* Avatar + Dropdown */}
          <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
            <Avatar
              size="large"
              icon={<UserOutlined />}
              style={{ cursor: 'pointer', backgroundColor: '#87d068' }}
            />
          </Dropdown>
        </Header>

        <Content style={{ margin: '24px 0', background: '#fff', padding: 24 }}>
          <Outlet />
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          ©2025 Gabriel Robledo. Todos los derechos reservados.
        </Footer>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
