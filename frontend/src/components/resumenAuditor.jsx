import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ResumenAuditor = () => {
  const { idUsuario } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [data, setData] = useState({ resumen: {}, auditorias: [] });
  const [auditoriasOriginal, setAuditoriasOriginal] = useState([]); // NUEVO estado
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [tabActiva, setTabActiva] = useState('detalle');

  useEffect(() => {
    fetchUsuario();
  }, []);

  useEffect(() => {
    fetchResumen();
  }, []);

  const fetchUsuario = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/usuarios/${idUsuario}`);
      console.log('Usuario:', res.data);
      setUsuario(res.data);
    } catch (err) {
      console.error('Error al obtener el usuario', err);
    }
  };

  const fetchResumen = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/auditorias/resumen/${idUsuario}`);
      setData(res.data);
      setAuditoriasOriginal(res.data.auditorias); // Guardamos todas
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const { resumen } = data;

  // 🧠 APLICAR FILTRO EN FRONTEND
  const auditoriasFiltradas = filtroPeriodo
    ? auditoriasOriginal.filter(a => a.periodo === filtroPeriodo)
    : auditoriasOriginal;

  const periodosUnicos = [...new Set(auditoriasOriginal.map(a => a.periodo))];
  const periodos = auditoriasFiltradas.map(a => a.periodo);
  const totales = auditoriasFiltradas.map(a => a.totalDebito);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(auditoriasFiltradas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Auditorías');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `ResumenAuditor_${usuario?.nombre || idUsuario}.xlsx`);
  };

  const hospitalesUnicos = [...new Set(auditoriasFiltradas.map(a => a.hospital))];

  // Suma totalDebito por hospital
  const totalesPorHospital = hospitalesUnicos.map(hospital => {
    return auditoriasFiltradas
      .filter(a => a.hospital === hospital)
      .reduce((sum, curr) => sum + curr.totalDebito, 0);
  });

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.text(`Resumen Auditor: ${usuario?.nombre || `ID ${idUsuario}`}`, 14, 20);
    doc.autoTable({
      head: [['Periodo', 'Hospital', 'Total Débito', '# Detalles']],
      body: auditoriasFiltradas.map(a => [
        a.periodo,
        a.hospital,
        a.totalDebito,
        a.cantidadDetalles
      ])
    });
    doc.save(`ResumenAuditor_${usuario?.nombre || idUsuario}.pdf`);
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={container}>
      <h2>Resumen del Auditor {usuario ? `${usuario.nombre} ${usuario.apellido}` : `ID ${idUsuario}`}</h2>

      {/* KPIs */}
      <div style={kpiContainer}>
        <KPI title="Total auditorías" value={resumen.totalAuditorias || 0} />
        <KPI title="Último período" value={resumen.ultimoPeriodo || '—'} />
        <KPI title="Promedio x mes" value={resumen.promedioPorMes || 0} />
      </div>

      {/* Filtro por periodo */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          <strong>Filtrar por período:&nbsp;</strong>
          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
          >
            <option value="">— Todos —</option>
            {periodosUnicos.map(periodo => (
              <option key={periodo} value={periodo}>{periodo}</option>
            ))}
          </select>
          <button onClick={() => setFiltroPeriodo('')} style={buttonClear}>
            ❌ Quitar filtro
          </button>
          <button onClick={exportExcel} style={{ ...buttonExport, backgroundColor: '#2e7d32' }}>📥 Excel</button>
          <button onClick={exportPdf} style={{ ...buttonExport, backgroundColor: '#c62828' }}>📄 PDF</button>
        </label>
      </div>

      {/* Tabla + Gráfico de barras */}
      <div style={contentFlex}>
        {/* Tabla */}
        <div style={{ flex: 1, marginRight: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#1976d2', color: 'white' }}>
                <th style={th}>Período</th>
                <th style={th}>Hospital</th>
                <th style={th}>Total débito</th>
                <th style={th}>N° Atenciones</th>
              </tr>
            </thead>
            <tbody>
              {auditoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="4" style={td}>Sin auditorías</td>
                </tr>
              ) : auditoriasFiltradas.map((a, idx) => (
                <tr key={a.idAuditoria} style={rowStyle(idx)}>
                  <td style={td}>{a.periodo}</td>
                  <td style={td}>{a.hospital}</td>
                  <td style={td}>${a.totalDebito.toFixed(2)}</td>
                  <td style={td}>{a.cantidadDetalles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gráfico de barras */}
        <div style={{ width: '40%', height: '300px' }}>
          <Bar
            data={{
              labels: hospitalesUnicos,
              datasets: [{
                label: 'Total débito',
                data: totales,
                backgroundColor: '#1976d2',
              }]
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>
    </div>
  );
};

const KPI = ({ title, value }) => (
  <div style={kpiBox}>
    <div style={{ fontSize: '0.9rem', color: '#666' }}>{title}</div>
    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#222' }}>{value}</div>
  </div>
);

export default ResumenAuditor;

const container = {
  padding: '2rem',
  backgroundColor: '#f5f7fa',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const th = {
  padding: '10px',
  textAlign: 'left'
};

const td = {
  padding: '10px',
  borderBottom: '1px solid #ccc'
};

const rowStyle = (idx) => ({
  backgroundColor: idx % 2 === 0 ? '#f9f9f9' : '#fff'
});

const kpiContainer = {
  display: 'flex',
  justifyContent: 'space-around',
  marginBottom: '2rem'
};

const kpiBox = {
  flex: 1,
  backgroundColor: 'white',
  margin: '0 0.5rem',
  padding: '1rem',
  borderRadius: '6px',
  textAlign: 'center',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
};

const buttonExport = {
  marginLeft: '8px',
  color: 'white',
  border: 'none',
  padding: '6px 10px',
  borderRadius: '4px',
  cursor: 'pointer'
};

const buttonClear = {
  marginLeft: '8px',
  backgroundColor: 'orange',
  color: 'white',
  border: 'none',
  padding: '6px 10px',
  borderRadius: '4px',
  cursor: 'pointer'
};

const contentFlex = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '2rem',
  marginBottom: '2rem'
};
