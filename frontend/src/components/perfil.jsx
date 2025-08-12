import { useEffect, useState } from 'react';
import {
  Card,
  Avatar,
  Descriptions,
  Button,
  Divider,
  Table,
  message,
  Modal,
  Form,
  Input,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { obtenerLogs } from '../services/logsServices';
import { cambiarPasswordService } from '../services/cambiarPasswordServices'; // <--- Asegurate de que exista

const columnasLogs = [
  { title: 'Fecha', dataIndex: 'fecha', key: 'fecha' },
  { title: 'Acción', dataIndex: 'accion', key: 'accion' },
  {
    title: 'Resultado',
    dataIndex: 'resultado',
    key: 'resultado',
    render: (text) =>
      text === 'Exito' ? (
        <span style={{ color: 'green' }}>{text}</span>
      ) : (
        <span style={{ color: 'red' }}>{text}</span>
      ),
  },
  { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
];

const Perfil = () => {
  const [logs, setLogs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [cambiandoPassword, setCambiandoPassword] = useState(false);

  const usuario = {
    id: 1, // Este ID debería venir del token o contexto
    nombre: 'Gabriel Robledo',
    correo: 'gabriel.robledo@example.com',
    rol: 'Administrador',
    telefono: '+54 9 11 2345 6789',
    imagen: null,
    ultimoAcceso: '24/07/2025 14:32',
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return '';
    const partes = nombre.split(' ');
    const iniciales = partes.map((p) => p[0]).join('');
    return iniciales.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const cargarLogs = async () => {
      try {
        const data = await obtenerLogs(usuario.id);
        console.log('Logs recibidos:', data);
        setLogs(data);
      } catch (error) {
        message.error('Error al cargar los logs');
      }
    };

    cargarLogs();
  }, [usuario.id]);

  const cambiarPassword = async (valores) => {
    setCambiandoPassword(true);
    try {
      const token = localStorage.getItem('token'); // Si usás JWT
      await cambiarPasswordService(usuario.id, {
        actual: valores.actual,
        nueva: valores.nueva,
      });

      message.success('Contraseña cambiada con éxito');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      const msg = error?.response?.data?.msg || 'Error al cambiar la contraseña';
      message.error(msg);
    } finally {
      setCambiandoPassword(false);
    }
  };

  return (
    <>
      <Card
        title="Mi perfil"
        style={{
          maxWidth: 700,
          margin: '0 auto',
          background: '#fdfdfd',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
          padding: 24,
        }}
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="default" onClick={() => setModalVisible(true)}>
              Cambiar contraseña
            </Button>
            <Button type="primary">Editar perfil</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          <Avatar
            size={100}
            icon={!usuario.imagen && <UserOutlined />}
            src={usuario.imagen}
            style={{
              backgroundColor: '#87d068',
              fontSize: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!usuario.imagen && obtenerIniciales(usuario.nombre)}
          </Avatar>

          <Descriptions column={1} size="small" style={{ flex: 1 }}>
            <Descriptions.Item label="Nombre">{usuario.nombre}</Descriptions.Item>
            <Descriptions.Item label="Correo">{usuario.correo}</Descriptions.Item>
            <Descriptions.Item label="Teléfono">{usuario.telefono}</Descriptions.Item>
            <Descriptions.Item label="Rol">{usuario.rol}</Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Último acceso">{usuario.ultimoAcceso}</Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Historial de actividad</Divider>
        <Table columns={columnasLogs} dataSource={logs} rowKey="idLog" pagination={{ pageSize: 5 }} />
      </Card>

      <Modal
        title="Cambiar contraseña"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={cambiandoPassword}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={cambiarPassword}>
          <Form.Item
            name="actual"
            label="Contraseña actual"
            rules={[{ required: true, message: 'Ingresa tu contraseña actual' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="nueva"
            label="Nueva contraseña"
            rules={[
              { required: true, message: 'Ingresa la nueva contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmacion"
            label="Confirmar nueva contraseña"
            dependencies={['nueva']}
            rules={[
              { required: true, message: 'Confirma la nueva contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('nueva') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Perfil;
