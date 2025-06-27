import { useEffect, useState } from 'react';
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
  const [tab, setTab] = useState('listado'); // 'listado' | 'graficos'
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/api/auditorias')
      .then(res => res.json())
      .then(setAuditorias)
      .catch(err => Swal.fire('Error', err.message, 'error'));
  }, []);

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
    <div style={{ padding: '2rem' }}>
      <h2>Auditorías</h2>

      {/* Pestañas */}
      <div style={{ display: 'flex', borderBottom: '2px solid #ccc', marginBottom: '1rem' }}>
        <button
          onClick={() => setTab('listado')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderBottom: tab === 'listado' ? '3px solid #1976d2' : 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontWeight: tab === 'listado' ? 'bold' : 'normal',
            color: tab === 'listado' ? '#1976d2' : '#555'
          }}
        >
          🗂 Listado de Auditorías
        </button>
        <button
          onClick={() => setTab('graficos')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderBottom: tab === 'graficos' ? '3px solid #1976d2' : 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontWeight: tab === 'graficos' ? 'bold' : 'normal',
            color: tab === 'graficos' ? '#1976d2' : '#555'
          }}
        >
          📊 Visualización Gráfica
        </button>
      </div>

      {/* Contenido según la pestaña activa */}
      {tab === 'listado' && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Hospital</th>
              <th>Periodo</th>
              <th>Total Débito</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {auditorias.map(a => (
              <tr key={a.idAuditoria}>
                <td>{a.idAuditoria}</td>
                <td>{a.Hospital}</td>
                <td>{a.periodo}</td>
                <td>${a.totalDebito}</td>
                <td>
                  <button
                    onClick={() => navigate(`/auditorias/${a.idAuditoria}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#1976d2',
                      fontSize: '1.2rem',
                      marginRight: '10px'
                    }}
                    title="Editar"
                  >
                    <FiEdit />
                  </button>

                  <button
                    onClick={() => eliminar(a.idAuditoria)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#d32f2f',
                      fontSize: '1.2rem'
                    }}
                    title="Eliminar"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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
            {/* Gráfico de Barras */}
            <div style={{ flex: '1 1 600px', maxWidth: '800px' }}>
              <Bar
                data={{
                  labels: auditorias.map(a => a.Hospital),
                  datasets: [
                    {
                      label: 'Total Débito por Hospital',
                      data: auditorias.map(a => a.totalDebito),
                      backgroundColor: 'rgba(25, 118, 210, 0.7)',
                      borderColor: 'rgba(25, 118, 210, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Débitos por Hospital' }
                  }
                }}
                height={300}
              />
            </div>

            {/* Gráfico de Pastel */}
            <div style={{ flex: '1 1 500px', maxWidth: '600px' }}>
              <Pie
                data={{
                  labels: auditorias.map(a => a.Hospital),
                  datasets: [
                    {
                      label: 'Total Débito',
                      data: auditorias.map(a => a.totalDebito),
                      backgroundColor: auditorias.map(() =>
                        `hsl(${Math.random() * 360}, 70%, 60%)`
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
    </div>
  );
}
