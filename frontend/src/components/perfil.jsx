
import { Card, Avatar, Descriptions, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const Perfil = () => {
  // Puedes reemplazar estos datos con los que traigas del backend o token
  const usuario = {
    nombre: 'Gabriel Robledo',
    correo: 'gabriel.robledo@example.com',
    rol: 'Administrador',
    telefono: '+54 9 11 2345 6789',
    imagen: null, // Usa una URL si tienes imagen
  };

  return (
    <Card
      title="Mi perfil"
      style={{ maxWidth: 600, margin: '0 auto' }}
      extra={<Button type="primary">Editar perfil</Button>}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Avatar
          size={100}
          icon={<UserOutlined />}
          src={usuario.imagen}
          style={{ backgroundColor: '#87d068' }}
        />
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Nombre">{usuario.nombre}</Descriptions.Item>
          <Descriptions.Item label="Correo">{usuario.correo}</Descriptions.Item>
          <Descriptions.Item label="Teléfono">{usuario.telefono}</Descriptions.Item>
          <Descriptions.Item label="Rol">{usuario.rol}</Descriptions.Item>
        </Descriptions>
      </div>
    </Card>
  );
};

export default Perfil;
