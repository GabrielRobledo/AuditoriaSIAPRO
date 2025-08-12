import React, { useEffect, useState } from 'react';
import API_URL from '../config';
import { Bar, Pie } from 'react-chartjs-2';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import '../styles/tablaPracticas.css';
import {
  FaDollarSign,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaHospital,
  FaFileExport,
} from 'react-icons/fa';

import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, Title);

const PracticasMasDebitadas = () => {
  const [practicas, setPracticas] = useState([]);
  const [modulesList, setModulesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pieData, setPieData] = useState({ labels: [], datasets: [] });

  const [filtroModulo, setFiltroModulo] = useState('');
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

  const [resumen, setResumen] = useState(null);
  const [graficoData, setGraficoData] = useState({ labels: [], datasets: [] });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [activeTab, setActiveTab] = useState('tabla'); // Tabs

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtroModulo) params.append('modulo', filtroModulo);
    if (fechaDesde) params.append('desde', fechaDesde.toISOString().split('T')[0]);
    if (fechaHasta) params.append('hasta', fechaHasta.toISOString().split('T')[0]);

    fetch(`${API_URL}/api/practicas-mas-debitadas?${params}`)
      .then(res => {
        if (!res.ok) throw new Error('Error en la solicitud');
        return res.json();
      })
      .then(data => {
        setPracticas(data);
        setModulesList([...new Set(data.map(d => d.modulo))]);

        const total_debitado = data.reduce((a, p) => a + p.total_debitado, 0);
        const total_debitos = data.reduce((a, p) => a + p.cantidad_debitos, 0);
        const total_practicas = data.length;
        const moduloTot = data.reduce((acc, curr) => {
          acc[curr.modulo] = (acc[curr.modulo] || 0) + curr.total_debitado;
          return acc;
        }, {});
        const modulo_top = Object.entries(moduloTot).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

        const moduloDebitos = data.reduce((acc, curr) => {
          acc[curr.modulo] = (acc[curr.modulo] || 0) + curr.cantidad_debitos;
          return acc;
        }, {});
        const pieLabels = Object.keys(moduloDebitos);
        const pieValues = Object.values(moduloDebitos);
        setPieData({
          labels: pieLabels,
          datasets: [{
            label: 'Cantidad de Débitos',
            data: pieValues,
            backgroundColor: [
              '#4e73df', '#1cc88a', '#f6c23e', '#36b9cc', '#e74a3b',
              '#858796', '#fd7e14', '#20c997', '#6610f2', '#6f42c1'
            ],
            borderWidth: 1
          }]
        });


        setResumen({ total_debitado, total_debitos, total_practicas, modulo_top });

        const labels = Object.keys(moduloTot);
        const totals = Object.values(moduloTot);
        setGraficoData({
          labels,
          datasets: [{ label: 'Total Debitado', data: totals, backgroundColor: '#4e73df' }]
        });

        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [filtroModulo, fechaDesde, fechaHasta]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(practicas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Prácticas");
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf]), 'practicas_mas_debitadas.xlsx');
  };

  const filteredPracticas = practicas.filter(item =>
    item.practica.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.modulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPracticas.length / rowsPerPage);
  const paginatedPracticas = filteredPracticas.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Módulos con mayor débito total' }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: v => `$${v}` }
      }
    }
  };

  const getKpiColor = (value, thresholds) => {
    if (value > thresholds.critico) return '#e74a3b'; // rojo
    if (value > thresholds.alerta) return '#f6c23e';  // amarillo
    return '#1cc88a'; // verde
  };

  
  return (
    <div style={{ padding: '30px' }}>
      <h1>Prácticas Más Debitadas</h1>

      {resumen && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div style={{ ...kpiStyle, backgroundColor: getKpiColor(resumen.total_debitado, { alerta: 10000, critico: 20000 }) }}>
            <FaDollarSign size={30} /><div>Total Debitado</div><strong>${resumen.total_debitado.toFixed(2)}</strong>
          </div>
          <div style={kpiStyle}><FaFileInvoiceDollar size={30} color="#1cc88a" /><div>Cantidad Débitos</div><strong>{resumen.total_debitos}</strong></div>
          <div style={kpiStyle}><FaClipboardList size={30} color="#36b9cc" /><div>Prácticas Distintas</div><strong>{resumen.total_practicas}</strong></div>
          <div style={kpiStyle}><FaHospital size={30} color="#f6c23e" /><div>Módulo Top</div><strong>{resumen.modulo_top}</strong></div>
        </div>
      )}

      {/* Tabs estilo AuditoriasList */}
      <div style={{ display: 'flex', borderBottom: '2px solid #ccc', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('tabla')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderBottom: activeTab === 'tabla' ? '3px solid #4e73df' : 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'tabla' ? 'bold' : 'normal',
            color: activeTab === 'tabla' ? '#4e73df' : '#555',
            userSelect: 'none'
          }}>
          📋 Tabla resumen de practicas
        </button>
        <button
          onClick={() => setActiveTab('graficos')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderBottom: activeTab === 'graficos' ? '3px solid #4e73df' : 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'graficos' ? 'bold' : 'normal',
            color: activeTab === 'graficos' ? '#4e73df' : '#555',
            userSelect: 'none'
          }}>
          📊 Visualización de Gráficos
        </button>
      </div>

      {/* TABLA */}
      {activeTab === 'tabla' && (
        <>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>

          </div>

          {/* Buscador con ícono */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '350px', marginBottom: '1rem' }}>
            <FaFileInvoiceDollar style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: '#4e73df' }} />
            <input
              type="text"
              placeholder="🔍 Buscar práctica o módulo..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ padding: '10px 40px', width: '100%', border: '2px solid #4e73df', borderRadius: '5px' }}
            />
          </div>

          {/* Tabla */}
          <div className="table-container">
            <table className="table" aria-label="Tabla de prácticas más debitadas">
              <thead>
                <tr>
                  <th>Práctica</th>
                  <th>Módulo</th>
                  <th>Total Debitado</th>
                  <th>Cantidad Débitos</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPracticas.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.practica}</td>
                    <td>{item.modulo}</td>
                    <td>${item.total_debitado.toFixed(2)}</td>
                    <td>{item.cantidad_debitos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  padding: '6px 12px',
                  background: currentPage === i + 1 ? '#4e73df' : '#f0f0f0',
                  color: currentPage === i + 1 ? '#fff' : '#000',
                  border: 'none',
                  borderRadius: '4px'
                }}>
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
      {activeTab === 'graficos' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginBottom: '40px' }}>
          <div style={{ flex: '1 1 400px', maxWidth: '600px' }}>
            <Bar data={graficoData} options={options} />
          </div>
          <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Distribución de Débitos por Módulo</h3>
            <Pie data={pieData} />
          </div>
        </div>
      )}
    </div>
  );
};

const kpiStyle = {
  flex: '1',
  background: '#f8f9fc',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
  textAlign: 'center',
  fontWeight: 'bold',
  minWidth: '200px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
};

export default PracticasMasDebitadas;
