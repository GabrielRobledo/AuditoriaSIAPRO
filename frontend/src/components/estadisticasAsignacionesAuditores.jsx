import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { Bar, Pie } from 'react-chartjs-2';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, ChartTooltip, Legend);

import {
  FaUserTie,
  FaHospital,
  FaChartPie
} from 'react-icons/fa';

import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  // otros...
} from '@mui/material';

const DashboardAuditoria = () => {
  const [data, setData] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // agregado
  const [efectores, setEfectores] = useState([]); // agregado
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuariosRes, efectoresRes, asignacionesRes] = await Promise.all([
          axios.get(`${API_URL}/api/auth/usuarios`),
          axios.get(`${API_URL}/api/efectores`),
          axios.get(`${API_URL}/api/asignaciones`)
        ]);

        setUsuarios(usuariosRes.data); // guardo usuarios completos
        setEfectores(efectoresRes.data); // guardo efectores completos

        const usuariosData = usuariosRes.data;
        const efectoresData = efectoresRes.data;
        const asignaciones = asignacionesRes.data;

        // Agregamos nombre del auditor y del hospital a cada asignación
        const enriched = asignaciones.map(asignacion => {
          const auditor = usuariosData.find(u => u.idUsuario === asignacion.idUsuario);
          const efector = efectoresData.find(e => e.idEfector === asignacion.idEfector);
          return {
            ...asignacion,
            nombre: auditor?.nombre || 'Sin nombre',
            RazonSocial: efector?.RazonSocial || 'Sin hospital',
          };
        });

        setData(enriched);
      } catch (error) {
        console.error('Error cargando datos para dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const kpis = useMemo(() => {
    const totalAuditores = new Set(data.map(d => d.idUsuario)).size;
    const totalHospitales = new Set(data.map(d => d.idEfector)).size;

    const asignaciones = data.reduce((acc, d) => {
      acc[d.nombre] = (acc[d.nombre] || 0) + 1;
      return acc;
    }, {});
    const auditorMax = Object.keys(asignaciones).reduce((a, b) =>
      asignaciones[a] > asignaciones[b] ? a : b, '');

    // Nuevos cálculos:
    const asignadosHospitales = new Set(data.map(d => d.idEfector));
    const asignadosAuditores = new Set(data.map(d => d.idUsuario));

    const hospSinAsignar = efectores.filter(e => !asignadosHospitales.has(e.idEfector)).length;
    const auditoresSinAsignar = usuarios.filter(u => u.tipoUsuario === 'auditor' && !asignadosAuditores.has(u.idUsuario)).length;

    return {
      totalAuditores,
      totalHospitales,
      auditorMax,
      maxAsignaciones: asignaciones[auditorMax] || 0,
      hospSinAsignar,
      auditoresSinAsignar
    };
  }, [data, efectores, usuarios]);

  const barData = useMemo(() => {
    const asignacionesPorAuditor = data.reduce((acc, curr) => {
      acc[curr.nombre] = (acc[curr.nombre] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(asignacionesPorAuditor),
      datasets: [{
        label: 'Hospitales asignados',
        data: Object.values(asignacionesPorAuditor),
        backgroundColor: 'rgba(25, 118, 210, 0.7)',
      }]
    };
  }, [data]);

  const pieData = useMemo(() => {
    const asignacionesPorHospital = data.reduce((acc, curr) => {
      acc[curr.RazonSocial] = (acc[curr.RazonSocial] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(asignacionesPorHospital),
      datasets: [{
        data: Object.values(asignacionesPorHospital),
        backgroundColor: [
          '#1976d2', '#dc004e', '#ffb300', '#388e3c', '#7b1fa2',
          '#f57c00', '#0097a7', '#c2185b', '#512da8', '#303f9f'
        ]
      }]
    };
  }, [data]);

  const columns = useMemo(() => [
    { accessorKey: 'nombre', header: 'Auditor' },
    { accessorKey: 'RazonSocial', header: 'Hospital asignado' }
  ], []);

  const groupedData = useMemo(() => {
    const result = {};
    data.forEach(({ nombre, RazonSocial }) => {
      if (!result[nombre]) result[nombre] = [];
      result[nombre].push(RazonSocial);
    });
    return result;
  }, [data]);

  return (
    <div style={{ padding: 20, fontFamily: "'Roboto', sans-serif", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: 20 }}>🧑‍⚕️ Dashboard de Auditores</h2>

      {/* KPIs */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 20,
        marginBottom: 30
      }}>
        {[{
          title: "Total Auditores",
          value: kpis.totalAuditores,
          icon: <FaUserTie size={28} color="#1976d2" />
        }, {
          title: "Hospitales Asignados",
          value: kpis.totalHospitales,
          icon: <FaHospital size={28} color="#388e3c" />
        }, {
          title: "Auditor Más Asignado",
          value: kpis.auditorMax,
          sub: `${kpis.maxAsignaciones} hospital(es)`,
          icon: <FaUserTie size={28} color="#e53935" />
        }, {
          title: "Hospitales sin asignar",         // KPI nuevo
          value: kpis.hospSinAsignar,
          icon: <FaHospital size={28} color="#ff9800" />
        }, {
          title: "Auditores sin asignar",          // KPI nuevo
          value: kpis.auditoresSinAsignar,
          icon: <FaUserTie size={28} color="#9c27b0" />
        }].map(({ title, value, icon, sub }) => (
          <div key={title} style={{
            background: "#fff",
            padding: "15px 20px",
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            minWidth: 200,
            display: "flex",
            alignItems: "center",
            gap: 15
          }}>
            <div>{icon}</div>
            <div style={{ textAlign: "left" }}>
              <h4 style={{ margin: 0, fontSize: 14, color: "#999" }}>{title}</h4>
              <p style={{ fontSize: "1.8rem", margin: "5px 0", fontWeight: "700", color: "#222" }}>{value || '-'}</p>
              {sub && <p style={{ fontSize: "0.9rem", margin: 0, color: "#555" }}>{sub}</p>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 30, alignItems: 'flex-start' }}>
        {/* Tabla agrupada */}
        <div style={{ flex: 1, background: "#fff", borderRadius: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.1)", padding: 20, overflowY: 'auto', maxHeight: 500 }}>
          <h4 style={{ marginBottom: 10 }}>Asignaciones por Auditor</h4>
          {Object.entries(groupedData).map(([auditor, hospitales]) => (
            <Box key={auditor} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                🧑‍⚕️ {auditor}
              </Typography>
              <List dense>
                {hospitales.map((hospital, idx) => (
                  <ListItem key={idx} sx={{ pl: 4 }}>
                    <ListItemText primary={hospital} />
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
        </div>
        {/* Gráfico horizontal */}
        <div style={{ flex: 1, background: "#fff", borderRadius: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.1)", padding: 20 }}>
          <h4 style={{ marginBottom: 10 }}>Hospitales por Auditor</h4>
          <div style={{ height: 400 }}>
            <Bar
              data={barData}
              options={{
                indexAxis: 'x',
                responsive: true,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: { beginAtZero: true }
                }
              }}
            />
          </div>
        </div>
      </div>

    </div>
  );

};

export default DashboardAuditoria;
