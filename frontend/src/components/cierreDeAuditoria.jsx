import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Select,
  Button,
  Spin,
  Alert,
  Typography,
  Divider,
} from 'antd';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import API_URL from '../config'

const { Option } = Select;
const { Title } = Typography;

const columnHelper = createColumnHelper();

const CierreDeAuditoria = ({ idUsuario }) => {
  const [efectores, setEfectores] = useState([]);
  const [auditorias, setAuditorias] = useState([]);
  const [todosLosPeriodos, setTodosLosPeriodos] = useState([]);
  const [cierres, setCierres] = useState([]);

  const [efectorSeleccionado, setEfectorSeleccionado] = useState('');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [cierreHecho, setCierreHecho] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEfectores, resAuditorias] = await Promise.all([
          axios.get(`${API_URL}/api/efectores`),
          axios.get(`${API_URL}/api/auditorias`),
        ]);
        setEfectores(resEfectores.data);
        setAuditorias(resAuditorias.data);

        const periodosUnicos = [...new Set(resAuditorias.data.map(a => a.periodo))];
        setTodosLosPeriodos(periodosUnicos);
      } catch (error) {
        setMensaje({ type: 'error', text: 'Error al cargar efectores o auditorías' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    cargarCierres();
  }, []);

  const cargarCierres = () => {
    axios
      .get(`${API_URL}/api/listarCierres`)
      .then((res) => setCierres(res.data))
      .catch((err) => console.error('Error al obtener cierres:', err));
  };

  const efectoresFiltrados = useMemo(() => {
    if (!periodoSeleccionado) return [];

    // Auditorías del período seleccionado
    const auditoriasEnPeriodo = auditorias.filter(a => a.periodo === periodoSeleccionado);

    // IDs de efectores que tienen auditoría en ese período
    const idsEfectoresConAuditoria = [...new Set(auditoriasEnPeriodo.map(a => a.idEfector))];

    // IDs de efectores que ya tienen un cierre para ese período
    const idsEfectoresConCierre = cierres
      .filter(c => c.periodo === periodoSeleccionado)
      .map(c => c.idEfector); // Asegúrate de que `idEfector` esté incluido en la respuesta del backend

    // Filtrar efectores que:
    // - tienen auditoría en ese período
    // - NO tienen cierre en ese período
    return efectores.filter(
      ef => idsEfectoresConAuditoria.includes(ef.idEfector) && !idsEfectoresConCierre.includes(ef.idEfector)
    );
  }, [periodoSeleccionado, auditorias, efectores, cierres]);

  const generarCierre = async () => {
    if (!efectorSeleccionado || !periodoSeleccionado) return;

    const confirmacion = await Swal.fire({
      title: '¿Confirmar cierre?',
      text: 'Una vez generado el cierre no se podrá revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await axios.post(`${API_URL}/api/cierres`, {
        idEfector: efectorSeleccionado,
        periodo: periodoSeleccionado,
        idUsuario,
      });

      Swal.fire('✅ Cierre exitoso', 'El cierre se generó correctamente.', 'success');

      // Limpiar selección
      setEfectorSeleccionado('');
      setPeriodoSeleccionado('');
      setCierreHecho(false);
      setMensaje(null);

      // Refrescar lista de cierres
      cargarCierres();
    } catch (error) {
      Swal.fire('❌ Error', 'Hubo un problema al generar el cierre.', 'error');
    }
    };

  const columns = useMemo(
    () => [
      columnHelper.accessor('idCierre', {
        header: 'ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('periodo', {
        header: 'Período',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('RazonSocial', {
        header: 'Efector',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('usuario', {
        header: 'Usuario',
        cell: (info) => info.getValue(),
      }),
      
    ],
    []
  );


  const table = useReactTable({
    data: cierres,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: '40px auto',
        padding: 32,
        background: '#f9f9f9',
        borderRadius: 12,
        boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
        border: '1px solid #e0e0e0',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <Title level={3} style={{ marginBottom: 24, color: '#3f3f3f' }}>
        Cierre de Auditoría
      </Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin tip="Cargando datos..." size="large" />
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 16, color: '#555' }}>
              Generar nuevo cierre
            </Title>

            {mensaje && (
              <Alert
                message={mensaje.text}
                type={mensaje.type}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, color: '#555' }}>Período:</label>
              <Select
                placeholder="Seleccione un período"
                value={periodoSeleccionado || undefined}
                onChange={(value) => {
                  setPeriodoSeleccionado(value);
                  setEfectorSeleccionado('');
                  setCierreHecho(false);
                  setMensaje(null);
                }}
                style={{ width: '100%', marginTop: 8, borderRadius: 6 }}
              >
                {todosLosPeriodos.map((p, index) => (
                  <Option key={index} value={p}>
                    {p}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, color: '#555' }}>Efector:</label>
              <Select
                placeholder="Seleccione un efector"
                value={efectorSeleccionado || undefined}
                onChange={(value) => {
                  setEfectorSeleccionado(value);
                }}
                disabled={!periodoSeleccionado}
                style={{ width: '100%', marginTop: 8, borderRadius: 6 }}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {efectoresFiltrados.map((ef) => (
                  <Option key={ef.idEfector} value={ef.idEfector}>
                    {ef.RazonSocial}
                  </Option>
                ))}
              </Select>
              {periodoSeleccionado && !efectoresFiltrados.length && (
                <small style={{ color: '#999', fontStyle: 'italic', marginTop: 8, display: 'block' }}>
                  🚫 No hay efectores con auditoría en este período.
                </small>
              )}
            </div>

            <Button
              type="primary"
              block
              size="large"
              disabled={!efectorSeleccionado || !periodoSeleccionado || cierreHecho}
              onClick={generarCierre}
              style={{
                marginTop: 16,
                borderRadius: 6,
                fontWeight: 'bold',
                background: cierreHecho ? '#52c41a' : '#1890ff',
                borderColor: cierreHecho ? '#52c41a' : '#1890ff',
              }}
            >
              {cierreHecho ? '✅ Cierre generado' : '🚀 Generar Cierre'}
            </Button>
          </div>

          <Divider />
          <div>
            <Title level={4} style={{ marginBottom: 16, color: '#555' }}>
              Historial de Cierres
            </Title>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          style={{
                            padding: '12px 16px',
                            background: '#fafafa',
                            color: '#333',
                            fontWeight: 600,
                            borderBottom: '1px solid #eaeaea',
                            textAlign: 'left',
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            style={{
                              padding: '12px 16px',
                              background: '#fff',
                              borderBottom: '1px solid #f0f0f0',
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} style={{ textAlign: 'center', padding: 12 }}>
                        No hay cierres registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CierreDeAuditoria;
