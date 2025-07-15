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
  const [periodos, setPeriodos] = useState([]);
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

  const efectoresConAuditoria = efectores.filter((ef) =>
    auditorias.some((a) => a.idEfector === ef.idEfector)
  );

  const handleEfectorChange = async (idEfector) => {
    setEfectorSeleccionado(idEfector);
    setPeriodoSeleccionado('');
    setCierreHecho(false);
    setMensaje(null);

    try {
      const res = await axios.get(`${API_URL}/api/periodos/${idEfector}`);
      setPeriodos(res.data);
    } catch (error) {
      setPeriodos([]);
    }
  };

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

      setCierreHecho(true);
      Swal.fire('✅ Cierre exitoso', 'El cierre se generó correctamente.', 'success');
      cargarCierres(); // recarga tabla
    } catch (error) {
      Swal.fire('❌ Error', 'Hubo un problema al generar el cierre.', 'error');
    }
  };

  // Columns for react-table
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
        header: 'Auditor',
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
        padding: 24,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <Title level={3}>Cierre de Auditoría</Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin tip="Cargando datos..." size="large" />
        </div>
      ) : (
        <>
          {/* Sección: Formulario */}
          <div style={{ marginBottom: 40 }}>
            <Title level={4}>Generar nuevo cierre</Title>

            {mensaje && (
              <Alert
                message={mensaje.text}
                type={mensaje.type}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <div style={{ marginBottom: 24 }}>
              <label><strong>Efector con auditoría:</strong></label>
              <Select
                placeholder="Seleccione un efector"
                value={efectorSeleccionado || undefined}
                onChange={handleEfectorChange}
                style={{ width: '100%', marginTop: 8 }}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {efectoresConAuditoria.map((ef) => (
                  <Option key={ef.idEfector} value={ef.idEfector}>
                    {ef.RazonSocial}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label><strong>Período:</strong></label>
              <Select
                placeholder="Seleccione un período"
                value={periodoSeleccionado || undefined}
                onChange={setPeriodoSeleccionado}
                disabled={!periodos.length}
                style={{ width: '100%', marginTop: 8 }}
              >
                {periodos.map((p, index) => (
                  <Option key={index} value={p}>
                    {p}
                  </Option>
                ))}
              </Select>
              {!periodos.length && efectorSeleccionado && (
                <small style={{ color: '#888' }}>
                  Este efector no tiene períodos disponibles.
                </small>
              )}
            </div>

            <Button
              type="primary"
              block
              size="large"
              disabled={!efectorSeleccionado || !periodoSeleccionado || cierreHecho}
              onClick={generarCierre}
            >
              {cierreHecho ? 'Cierre generado' : 'Generar Cierre'}
            </Button>
          </div>

          {/* Sección: Tabla de cierres */}
          <Divider />
          <div>
            <Title level={4}>Historial de Cierres</Title>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          style={{
                            padding: '10px',
                            border: '1px solid #ccc',
                            background: '#fafafa',
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
                              padding: '10px',
                              border: '1px solid #ddd',
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
