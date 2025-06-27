import { useEffect, useState } from 'react';
import axios from 'axios';
import KpiCard from './kipcards';
import { Modal, Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import {
  FaUserInjured,
  FaMoneyBillWave,
  FaHospital,
  FaUsers,
  FaUserShield,
  FaBuilding,
  FaUserTimes,
  FaHospitalAlt
} from 'react-icons/fa';


const Dashboard = () => {
  const [atenciones, setAtenciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [efectores, setEfectores] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalItems, setModalItems] = useState([]);

  const handleOpenModal = (title, items) => {
    setModalTitle(title);
    setModalItems(items);
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [atRes, usRes, efRes, asigRes] = await Promise.all([
          axios.get('http://localhost:3000/api/atenciones'),
          axios.get('http://localhost:3000/api/auth/usuarios'),
          axios.get('http://localhost:3000/api/efectores'),
          axios.get('http://localhost:3000/api/asignaciones')
        ]);
        setAtenciones(atRes.data);
        setUsuarios(usRes.data);
        setEfectores(efRes.data);
        setAsignaciones(asigRes.data);
      } catch (error) {
        console.error('Error al cargar los datos del dashboard', error);
      }
    };
    fetchData();
  }, []);

  // KPIs de atenciones
  const totalAtenciones = atenciones.length;
  const totalFacturado = atenciones.reduce((acc, item) => acc + (item.valorTotal || 0), 0);
  const totalEfectoresAtendidos = new Set(atenciones.map(a => a.idEfector)).size;
  const totalBeneficiarios = new Set(atenciones.map(a => a.apeYnom)).size;

  // KPIs de asignaciones
  const auditores = usuarios.filter(u => u.tipoUsuario === 'auditor');
  const auditoresAsignados = new Set(asignaciones.map(a => a.idUsuario));
  const efectoresAsignados = new Set(asignaciones.map(a => a.idEfector));

  const totalAuditores = auditores.length;
  const totalAuditoresAsignados = auditores.filter(a => auditoresAsignados.has(a.idUsuario)).length;
  const totalAuditoresSinAsignar = totalAuditores - totalAuditoresAsignados;

  const totalHospitales = efectores.length;
  const totalHospitalesAsignados = efectores.filter(e => efectoresAsignados.has(e.idEfector)).length;
  const totalHospitalesSinAsignar = totalHospitales - totalHospitalesAsignados;

  return (
    <div style={{ padding: '20px' }}>
      {/* Bloque: Atenciones */}
      <h2 style={{ marginBottom: '10px', color: '#4e73df' }}>📊 Datos de Atenciones</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
        <KpiCard icon={FaUserInjured} title="Total Atenciones" value={totalAtenciones} color="#4e73df" />
        <KpiCard icon={FaMoneyBillWave} title="Valor Total Facturado" value={`$${totalFacturado.toLocaleString()}`} color="#1cc88a" />
        <KpiCard icon={FaHospital} title="Efectores con Atenciones" value={totalEfectoresAtendidos} color="#36b9cc" />
        <KpiCard icon={FaUsers} title="Beneficiarios Atendidos" value={totalBeneficiarios} color="#f6c23e" />
      </div>

      {/* Bloque: Asignaciones */}
      <h2 style={{ marginBottom: '10px', color: '#6f42c1' }}>🏥 Estado de Asignaciones</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <KpiCard
          icon={FaUserShield}
          title="Auditores Asignados"
          value={totalAuditoresAsignados}
          color="#6f42c1"
          onClick={() =>
            handleOpenModal(
              'Auditores Asignados',
              auditores.filter(a => auditoresAsignados.has(a.idUsuario)).map(a => a.nombre)
            )
          }
        />
        <KpiCard
          icon={FaUserTimes}
          title="Auditores Sin Asignar"
          value={totalAuditoresSinAsignar}
          color="#dc3545"
          onClick={() =>
            handleOpenModal(
              'Auditores Sin Asignar',
              auditores.filter(a => !auditoresAsignados.has(a.idUsuario)).map(a => a.nombre)
            )
          }
        />
        <KpiCard
          icon={FaBuilding}
          title="Hospitales Asignados"
          value={totalHospitalesAsignados}
          color="#20c997"
          onClick={() =>
            handleOpenModal(
              'Hospitales Asignados',
              efectores.filter(e => efectoresAsignados.has(e.idEfector)).map(e => e.RazonSocial)
            )
          }
        />
        <KpiCard
          icon={FaHospitalAlt}
          title="Hospitales Sin Asignar"
          value={totalHospitalesSinAsignar}
          color="#ffc107"
          onClick={() =>
            handleOpenModal(
              'Hospitales Sin Asignar',
              efectores.filter(e => !efectoresAsignados.has(e.idEfector)).map(e => e.RazonSocial)
            )
          }
        />
      </div>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            {modalTitle}
          </Typography>
          <List dense>
            {modalItems.length > 0 ? (
              modalItems.map((item, idx) => (
                <ListItem key={idx}>
                  <ListItemText primary={item} />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay datos para mostrar.
              </Typography>
            )}
          </List>
        </Box>
      </Modal>

    </div>
    
  );
  

};

export default Dashboard;
