import { Table } from 'antd';

const columns = [
  { title: 'Fecha', dataIndex: 'fecha', key: 'fecha' },
  { title: 'Acción', dataIndex: 'accion', key: 'accion' },
  { title: 'Resultado', dataIndex: 'resultado', key: 'resultado' },
  { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' }
];

const LogsTable = ({ data }) => {
  return <Table columns={columns} dataSource={data} rowKey="idLog" pagination={{ pageSize: 5 }} />;
};

export default LogsTable;
