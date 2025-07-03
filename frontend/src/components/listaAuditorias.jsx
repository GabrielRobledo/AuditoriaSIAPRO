import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AuditoriasList() {
  const [auditorias, setAuditorias] = useState([]);
  const [tab, setTab] = useState('listado');
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/api/auditorias')
      .then(res => res.json())
      .then(data => {
        // Ordenar descendente por idAuditoria
        const sortedData = data.sort((a, b) => b.idAuditoria - a.idAuditoria);
        setAuditorias(sortedData);
      })
      .catch(err => Swal.fire('Error', err.message, 'error'));
  }, []);

  const filteredRows = auditorias; // Aquí podrías aplicar filtros en el futuro

  const paginatedRows = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, pageIndex, pageSize]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);

  const eliminar = id => {
    Swal.fire({
      title: '¿Eliminar esta auditoría?',
      icon: 'warning',
      showCancelButton: true
    }).then(ok => {
      if (!ok.isConfirmed) return;
      fetch(`http://localhost:3000/api/auditorias/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            setAuditorias(prev => prev.filter(a => a.idAuditoria !== id));
            Swal.fire('Eliminada', 'Auditoría eliminada', 'success');
          }
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
    });
  };

  return (
    <div style={{ padding: '2rem', position: 'relative', minHeight: '100vh' }}>
      <h2>Auditorías</h2>

      {/* Pestañas */}
      <div style={{ display: 'flex', borderBottom: '2px solid #ccc', marginBottom: '1rem' }}>
        <button
          onClick={() => setTab('listado')}
          style={tabButtonStyle(tab === 'listado')}
        >
          🗂 Listado de Auditorías
        </button>
        <button
          onClick={() => setTab('graficos')}
          style={tabButtonStyle(tab === 'graficos')}
        >
          📊 Visualización Gráfica
        </button>
      </div>

      {/* === Tabla estilizada === */}
      {tab === 'listado' && (
        <div style={{
          overflowX: 'auto',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#fff',
          marginTop: '10px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Hospital</th>
                <th style={thStyle}>Periodo</th>
                <th style={thStyle}>Total Facturado</th>
                <th style={thStyle}>Total Débito</th>
                <th style={thStyle}>Total Neto</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((a, idx) => (
                <tr
                  key={a.idAuditoria}
                  style={{
                    backgroundColor: (pageIndex * pageSize + idx) % 2 === 0 ? '#f5f5f5' : '#fff',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e3f2fd')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor =
                    (pageIndex * pageSize + idx) % 2 === 0 ? '#f5f5f5' : '#fff')}
                >
                  <td style={tdStyle}>{a.idAuditoria}</td>
                  <td style={tdStyle}>{a.Hospital}</td>
                  <td style={tdStyle}>{a.periodo}</td>
                  <td style={tdStyle}>${parseFloat(a.totalFacturado || 0).toFixed(2)}</td>
                  <td style={tdStyle}>${parseFloat(a.totalDebito).toFixed(2)}</td>
                  <td style={tdStyle}>
                    ${a.totalFacturado && a.totalDebito
                      ? (a.totalFacturado - a.totalDebito).toFixed(2)
                      : a.totalFacturado}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/auditorias/${a.idAuditoria}`)}
                      style={iconButtonStyle('#1976d2')}
                      title="Editar"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => eliminar(a.idAuditoria)}
                      style={iconButtonStyle('#d32f2f')}
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          <div style={{ marginTop: "10px", textAlign: 'center' }}>
            <button
              onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
              disabled={pageIndex === 0}
              style={paginationButtonStyle(pageIndex === 0)}
            >
              &lt;
            </button>

            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
              Página {pageIndex + 1} de {totalPages}
            </span>

            <button
              onClick={() => setPageIndex((p) => Math.min(p + 1, totalPages - 1))}
              disabled={pageIndex >= totalPages - 1}
              style={paginationButtonStyle(pageIndex >= totalPages - 1)}
            >
              &gt;
            </button>

            <span style={{ marginLeft: '15px', fontSize: '14px', color: '#555' }}>
              Total de registros: {filteredRows.length}
            </span>
          </div>
        </div>
      )}

      {/* === Gráficos === */}
      {tab === 'graficos' && auditorias.length > 0 && (
        <div>
          <h3>Visualización de Datos</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '2rem',
              marginTop: '2rem'
            }}
          >
            <div style={{ flex: '1 1 600px', maxWidth: '800px' }}>
              <Bar
                data={{
                  labels: auditorias.map(a => a.Hospital),
                  datasets: [
                    {
                      label: 'Total Débito',
                      data: auditorias.map(a => a.totalDebito),
                      backgroundColor: 'rgba(25, 118, 210, 0.7)',
                      borderColor: 'rgba(25, 118, 210, 1)',
                      borderWidth: 1
                    },
                    {
                      label: 'Total Facturado',
                      data: auditorias.map(a => a.totalFacturado),
                      backgroundColor: 'rgba(76, 175, 80, 0.7)',
                      borderColor: 'rgba(76, 175, 80, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Comparativa: Débito vs Facturación' }
                  }
                }}
                height={300}
              />
            </div>

            <div style={{ flex: '1 1 500px', maxWidth: '600px' }}>
              <Pie
                data={{
                  labels: auditorias.map(a => a.Hospital),
                  datasets: [
                    {
                      label: 'Total Débito',
                      data: auditorias.map(a => a.totalDebito),
                      backgroundColor: auditorias.map(
                        () => `hsl(${Math.random() * 360}, 70%, 60%)`
                      )
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }}
                height={250}
              />
            </div>
          </div>
        </div>
      )}

      {/* Botón de Volver */}
      <button
        onClick={() => navigate('/dashboardAuditor')}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          padding: '10px 20px',
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        ← Volver al Dashboard
      </button>
    </div>
  );
}

// === Estilos reutilizables ===

const thStyle = {
  backgroundColor: '#1976d2',
  color: '#fff',
  textAlign: 'left',
  padding: '12px 16px'
};

const tdStyle = {
  padding: '12px 16px',
  borderBottom: '1px solid #e0e0e0'
};

const tabButtonStyle = (active) => ({
  padding: '0.5rem 1rem',
  border: 'none',
  borderBottom: active ? '3px solid #1976d2' : 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontWeight: active ? 'bold' : 'normal',
  color: active ? '#1976d2' : '#555'
});

const iconButtonStyle = (color) => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color,
  fontSize: '1.2rem',
  marginRight: '10px'
});

const paginationButtonStyle = (disabled) => ({
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '6px 10px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  margin: '0 8px'
});
