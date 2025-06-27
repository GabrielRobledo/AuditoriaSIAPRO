import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import { ArrowForward, ArrowBack, Delete as DeleteIcon } from '@mui/icons-material';

const AsignarHospitales = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [efectores, setEfectores] = useState([]);
  const [asignacionesTotales, setAsignacionesTotales] = useState([]);
  const [auditorId, setAuditorId] = useState('');
  const [asignados, setAsignados] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  const fetchData = async () => {
    try {
      const [usuariosRes, efectoresRes, asignacionesRes] = await Promise.all([
        axios.get('http://localhost:3000/api/auth/usuarios'),
        axios.get('http://localhost:3000/api/efectores'),
        axios.get('http://localhost:3000/api/asignaciones')
      ]);

      const usuariosData = usuariosRes.data;
      const efectoresData = efectoresRes.data;
      const asignacionesData = asignacionesRes.data;

      const auditores = usuariosData.filter(u => u.tipoUsuario === 'auditor');
      const auditoresAsignados = new Set(asignacionesData.map(a => a.idUsuario));
      const efectoresAsignados = new Set(asignacionesData.map(a => a.idEfector));

      setUsuarios(auditores.filter(a => !auditoresAsignados.has(a.idUsuario)));
      setEfectores(efectoresData.filter(e => !efectoresAsignados.has(e.idEfector)));
      setDisponibles(efectoresData.filter(e => !efectoresAsignados.has(e.idEfector)));

      const asignacionesAgrupadas = usuariosData
        .filter(u => u.tipoUsuario === 'auditor')
        .map(auditor => {
          const hospitales = asignacionesData
            .filter(a => a.idUsuario === auditor.idUsuario)
            .map(a => {
              const hosp = efectoresData.find(e => e.idEfector === a.idEfector);
              return hosp ? hosp.RazonSocial : 'Hospital no encontrado';
            });

          return {
            idUsuario: auditor.idUsuario,
            nombre: auditor.nombre,
            hospitales
          };
        })
        .filter(grupo => grupo.hospitales.length > 0);

      setAsignacionesTotales(asignacionesAgrupadas);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo cargar la información.', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!auditorId) {
      setAsignados([]);
      setDisponibles(efectores);
      return;
    }

    axios.get(`http://localhost:3000/api/asignaciones/${auditorId}`)
      .then(res => {
        const idsAsignados = res.data.map(a => a.idEfector);
        setAsignados(efectores.filter(e => idsAsignados.includes(e.idEfector)));
        setDisponibles(efectores.filter(e => !idsAsignados.includes(e.idEfector)));
      })
      .catch(() => {
        setAsignados([]);
        setDisponibles(efectores);
      });
  }, [auditorId, efectores]);

  const asignar = (idEfector) => {
    const seleccionado = disponibles.find(e => e.idEfector === idEfector);
    setAsignados(prev => [...prev, seleccionado]);
    setDisponibles(prev => prev.filter(e => e.idEfector !== idEfector));
  };

  const quitar = (idEfector) => {
    const seleccionado = asignados.find(e => e.idEfector === idEfector);
    setDisponibles(prev => [...prev, seleccionado]);
    setAsignados(prev => prev.filter(e => e.idEfector !== idEfector));
  };

  const handleSubmit = () => {
    if (!auditorId) {
      Swal.fire({
        icon: 'warning',
        title: 'Auditor no seleccionado',
        text: 'Seleccioná un auditor antes de guardar.',
      });
      return;
    }

    const efectoresIds = asignados.map(e => e.idEfector);

    axios.post('http://localhost:3000/api/asignar-efectores', {
      idUsuario: auditorId,
      efectoresIds
    })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Asignación exitosa',
          text: 'Los hospitales fueron asignados correctamente.',
          timer: 2000,
          showConfirmButton: false,
        });
        setAuditorId('');
        setAsignados([]);
        fetchData();
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error al guardar',
          text: 'Ocurrió un problema al asignar los hospitales.',
        });
      });
  };

  const eliminarAsignacion = (idUsuario) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará todas las asignaciones de este auditor.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:3000/api/asignaciones/${idUsuario}`)
          .then(() => {
            Swal.fire('Eliminado', 'Las asignaciones fueron eliminadas.', 'success');
            fetchData();
            setAuditorId('');
            setAsignados([]);
          })
          .catch(() => {
            Swal.fire('Error', 'No se pudo eliminar la asignación.', 'error');
          });
      }
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Asignaciones
      </Typography>

      <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)} sx={{ mb: 3 }}>
        <Tab label="Asignar Hospitales" />
        <Tab label="Ver Asignaciones" />
      </Tabs>

      {tabIndex === 0 && (
        <>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Auditor</InputLabel>
            <Select
              value={auditorId}
              label="Auditor"
              onChange={(e) => setAuditorId(e.target.value)}
            >
              {usuarios.map((u) => (
                <MenuItem key={u.idUsuario} value={u.idUsuario}>
                  {u.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {auditorId && (
            <Grid container spacing={2}>
              <Grid item xs={5}>
                <Typography variant="h6">Hospitales disponibles</Typography>
                <Paper elevation={3} sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <List dense>
                    {disponibles.map(e => (
                      <ListItem
                        key={e.idEfector}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => asignar(e.idEfector)}>
                            <ArrowForward />
                          </IconButton>
                        }
                      >
                        <ListItemText primary={e.RazonSocial} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={2} />

              <Grid item xs={5}>
                <Typography variant="h6">Hospitales asignados</Typography>
                <Paper elevation={3} sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <List dense>
                    {asignados.map(e => (
                      <ListItem
                        key={e.idEfector}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => quitar(e.idEfector)}>
                            <ArrowBack />
                          </IconButton>
                        }
                      >
                        <ListItemText primary={e.RazonSocial} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mt: 4 }}
          >
            Guardar Asignación
          </Button>
        </>
      )}

      {tabIndex === 1 && (
        <Container sx={{ mt: 2 }}>
          <Typography variant="h5" gutterBottom>
            Asignaciones Existentes
          </Typography>
          <Paper elevation={3}>
            <List>
              {asignacionesTotales.map((a, i) => (
                <ListItem
                  key={i}
                  divider
                  secondaryAction={
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => eliminarAsignacion(a.idUsuario)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={a.nombre}
                    secondary={`Hospitales: ${a.hospitales.join(', ')}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Container>
      )}
    </Container>
  );
};

export default AsignarHospitales;
