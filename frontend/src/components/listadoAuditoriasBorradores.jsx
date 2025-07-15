// HospConBorradorCards.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import '../styles/cardsHosp.css';
import API_URL from '../config';

ChartJS.register(ArcElement, Tooltip, Legend);

const HospConBorradorCards = () => {
  const [borradores, setBorradores] = useState([]);
  const [progresos, setProgresos] = useState({});
  const navigate = useNavigate();

  const idUsuario = 2; // 🔁 En el futuro, obtenerlo dinámicamente

  // Primer efecto: obtener hospitales con borrador
  useEffect(() => {
    fetch(`${API_URL}/api/borradores/${idUsuario}`)
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener borradores');
        return res.json();
      })
      .then(data => setBorradores(data))
      .catch(err => {
        console.error('Error al cargar hospitales con borrador:', err);
        setBorradores([]);
      });
  }, []);

  // Segundo efecto: calcular progreso y resumen económico
  useEffect(() => {
    if (!borradores.length) return;

    const fetchProgreso = async () => {
      const nuevosProgresos = {};

      await Promise.all(
        borradores.map(async ({ idEfector }) => {
          try {
            const res = await fetch(`${API_URL}/api/borradores/efector/${idEfector}`);
            const json = await res.json();
            const datos = Array.isArray(json) ? json : json.datos || [];

            const total = datos.length;
            const revisadas = datos.filter(a => a.revisado).length;

            const totalValor = datos.reduce((sum, a) => sum + (a.valorTotal || 0), 0);
            const totalDebito = datos.reduce((sum, a) => sum + (parseFloat(a.debito) || 0), 0);
            const conDebito = datos.filter(a => parseFloat(a.debito) > 0).length;

            nuevosProgresos[idEfector] = {
              total,
              revisadas,
              totalValor,
              totalDebito,
              conDebito,
            };
          } catch (err) {
            console.error(`Error cargando progreso para efector ${idEfector}:`, err);
            nuevosProgresos[idEfector] = {
              total: 0,
              revisadas: 0,
              totalValor: 0,
              totalDebito: 0,
              conDebito: 0,
            };
          }
        })
      );

      setProgresos(nuevosProgresos);
    };

    fetchProgreso();
  }, [borradores]);

  if (!borradores.length) {
    return <p>No hay hospitales con auditoría en progreso.</p>;
  }

  return (
    <div className="cards-grid">
      {borradores.map(({ idEfector, RazonSocial }) => {
        const progreso = progresos[idEfector];
        const total = progreso?.total || 0;
        const revisadas = progreso?.revisadas || 0;
        const porcentaje = total ? Math.round((revisadas / total) * 100) : 0;
        const totalValor = progreso?.totalValor || 0;
        const totalDebito = progreso?.totalDebito || 0;
        const conDebito = progreso?.conDebito || 0;

        const data = {
          labels: ['Revisadas', 'Pendientes'],
          datasets: [
            {
              data: [revisadas, total - revisadas],
              backgroundColor: ['#4caf50', '#e0e0e0'],
              borderWidth: 0,
            },
          ],
        };

        const options = {
          cutout: '70%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.label}: ${context.parsed}`;
                },
              },
            },
          },
        };

        return (
          <div
            key={idEfector}
            className="card"
            onClick={() => navigate(`/borradores/tabla/${idEfector}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-header">
              <div className="card-icon">
                <LocalHospitalIcon />
              </div>
              <h3 className="card-title">{RazonSocial}</h3>
            </div>
            <p className="card-subtitle">Continuar auditoría</p>

            {total > 0 && (
              <>
                <div className="chart-container">
                  <Doughnut data={data} options={options} />
                  <div className="chart-center-text">{`${porcentaje}%`}</div>
                </div>

                <div className="card-summary">
                  <p className="card-detail">✔ Atenciones revisadas: {revisadas}</p>
                  <p className="card-detail">💰 Total Facturado: ${totalValor.toLocaleString()}</p>
                  <p className="card-detail">⚠ Débito total: ${totalDebito.toLocaleString()}</p>
                  <p className="card-detail">❌ Con débito: {conDebito}</p>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HospConBorradorCards;
