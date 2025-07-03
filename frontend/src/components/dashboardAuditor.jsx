import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiClipboard, FiDollarSign } from 'react-icons/fi';
import { FaHospital, FaTasks } from 'react-icons/fa';

export default function DashboardAuditor() {
  const [auditorias, setAuditorias] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/api/auditorias')
      .then(res => res.json())
      .then(setAuditorias)
      .catch(err => Swal.fire('Error', err.message, 'error'));

    fetch('http://localhost:3000/api/atenciones')
      .then(res => res.json())
      .then(setAtenciones)
      .catch(err => Swal.fire('Error', err.message, 'error'));
  }, []);

  const totalDebito = auditorias.reduce((acc, a) => acc + (parseFloat(a.totalDebito) || 0), 0);
  const auditoriasRecientes = auditorias
  .slice() // para no mutar el estado original
  .sort((a, b) => b.idAuditoria - a.idAuditoria)
  .slice(0, 5);
  const hospitalesPendientes = new Set(atenciones.map(a => a.idEfector)).size;

  const atencionesPorTipo = atenciones.reduce((acc, a) => {
    acc[a.tipoAtencion] = (acc[a.tipoAtencion] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={containerStyle}>
      <div style={dashboardRow}>
        <div style={cardBlock}>
          <h2 style={sectionTitle}>Auditorías Cerradas</h2>
          <div style={cardsContainer}>
            <div style={{ ...cardStyle, borderLeft: '5px solid #1976d2' }}>
              <FaTasks size={32} color="#1976d2" />
              <h3>Total Auditorías</h3>
              <p style={valueStyle}>{auditorias.length}</p>
            </div>

            <div style={{ ...cardStyle, borderLeft: '5px solid #2e7d32' }}>
              <FiDollarSign size={32} color="#2e7d32" />
              <h3>Total Débito</h3>
              <p style={valueStyle}>${totalDebito.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div style={cardBlock}>
          <h2 style={sectionTitle}>Atenciones Pendientes</h2>
          <div style={cardsContainer}>
            <div style={{ ...cardStyle, borderLeft: '5px solid #f57c00' }}>
              <FaHospital size={32} color="#f57c00" />
              <h3>Hospitales Pendientes</h3>
              <p style={valueStyle}>{hospitalesPendientes}</p>
            </div>

            <div style={{ ...cardStyle, borderLeft: '5px solid #c2185b' }}>
              <FiClipboard size={32} color="#c2185b" />
              <h3>Atenciones por Tipo</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {Object.entries(atencionesPorTipo).map(([tipo, count]) => (
                  <li key={tipo}><strong>{tipo}:</strong> {count}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* === Tabla mejorada === */}
      <h2 style={{ marginTop: '40px' }}>Últimas Auditorías Cerradas</h2>
      <div style={{
        overflowX: 'auto',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        marginTop: '10px'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '600px'
        }}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Hospital</th>
              <th style={thStyle}>Periodo</th>
              <th style={thStyle}>Total Débito</th>
            </tr>
          </thead>
          <tbody>
            {auditoriasRecientes.map((a, idx) => (
              <tr
                key={a.idAuditoria}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#f5f5f5' : '#fff',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e3f2fd')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#f5f5f5' : '#fff')}
              >
                <td style={tdStyle}>{a.idAuditoria}</td>
                <td style={tdStyle}>{a.Hospital}</td>
                <td style={tdStyle}>{a.periodo}</td>
                <td style={tdStyle}>${parseFloat(a.totalDebito).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => navigate('/auditorias')}
        style={buttonStyle}
      >
        Ver todas las auditorías
      </button>
    </div>
  );
}

// === Estilos inline ===

const containerStyle = {
  padding: '40px',
  fontFamily: 'Arial, sans-serif',
  color: '#333',
  backgroundColor: '#f9f9f9',
  minHeight: '100vh'
};

const dashboardRow = {
  display: 'flex',
  gap: '30px',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginBottom: '40px'
};

const cardBlock = {
  flex: '1 1 48%',
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  minWidth: '300px'
};

const sectionTitle = {
  fontSize: '1.2rem',
  marginBottom: '20px',
  color: '#444'
};

const cardsContainer = {
  display: 'flex',
  gap: '20px',
  flexWrap: 'wrap'
};

const cardStyle = {
  flex: '1 1 250px',
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  transition: 'transform 0.3s',
};

const valueStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  margin: '10px 0 0'
};

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

const buttonStyle = {
  marginTop: '30px',
  padding: '12px 24px',
  backgroundColor: '#1976d2',
  color: '#fff',
  fontSize: '1rem',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'background 0.3s'
};
