import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Container,
  Typography,
  Autocomplete,
  TextField,
  Grid,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItemText,
  ListItemButton,
  IconButton,
  Button,
  Tabs,
  Tab,
  Box,
  Badge
} from '@mui/material';
import { ArrowForward, ArrowBack, Delete as DeleteIcon } from '@mui/icons-material';

const AsignarHospitales = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [efectores, setEfectores] = useState([]);
  const [asignacionesTotales, setAsignacionesTotales] = useState([]);
  const [auditorId, setAuditorId] = useState(null);
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

      const asignacionesAgrupadas = auditores
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
        setAuditorId(null);
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
            setAuditorId(null);
            setAsignados([]);
          })
          .catch(() => {
            Swal.fire('Error', 'No se pudo eliminar la asignación.', 'error');
          });
      }
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Gestión de Asignaciones
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={(_, newIndex) => setTabIndex(newIndex)}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Asignar Hospitales" />
        <Tab label="Ver Asignaciones" />
      </Tabs>

      {tabIndex === 0 && (
        <>
          <Autocomplete
            options={usuarios}
            getOptionLabel={(option) => option.nombre}
            value={usuarios.find(u => u.idUsuario === auditorId) || null}
            onChange={(_, newValue) => setAuditorId(newValue ? newValue.idUsuario : null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Seleccionar Auditor"
                variant="outlined"
                sx={{ mb: 4 }}
              />
            )}
            clearOnEscape
          />

          {auditorId && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Card elevation={6}>
                  <CardHeader
                    title="Hospitales disponibles"
                    sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    action={<Badge badgeContent={disponibles.length} color="secondary" />}
                  />
                  <CardContent sx={{ maxHeight: 480, overflowY: 'auto', p: 0 }}>
                    <List dense>
                      {disponibles.map(e => (
                        <ListItemButton
                          key={e.idEfector}
                          onClick={() => asignar(e.idEfector)}
                          sx={{
                            px: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'nowrap',
                            gap: 1,
                            '&:hover': {
                              bgcolor: 'primary.light',
                              color: 'white',
                            },
                          }}
                        >
                          <ListItemText
                            primary={e.RazonSocial}
                            sx={{
                              flexGrow: 1,
                              overflow: 'hidden',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                            }}
                          />
                          <Box sx={{ flexShrink: 0 }}>
                            <ArrowForward />
                          </Box>
                        </ListItemButton>


                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card elevation={6}>
                  <CardHeader
                    title="Hospitales asignados"
                    sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    action={<Badge badgeContent={asignados.length} color="secondary" />}
                  />
                  <CardContent sx={{ maxHeight: 480, overflowY: 'auto', p: 0 }}>
                    <List dense>
                      {asignados.map(e => (
                      <ListItemButton
                        key={e.idEfector}
                        onClick={() => quitar(e.idEfector)}
                        sx={{
                          px: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'nowrap',
                          gap: 1,
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'white',
                          },
                        }}
                      >
                        <ListItemText
                          primary={e.RazonSocial}
                          sx={{
                            flexGrow: 1,
                            overflow: 'hidden',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                          }}
                        />
                        <Box sx={{ flexShrink: 0 }}>
                          <ArrowBack />
                        </Box>
                      </ListItemButton>


                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          <Box textAlign="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ mt: 2, minWidth: 180, fontWeight: 'bold' }}
            >
              Guardar Asignación
            </Button>
          </Box>
        </>
      )}

      {tabIndex === 1 && (
        <Card elevation={6} sx={{ mt: 2 }}>
          <CardHeader
            title="Asignaciones Existentes"
            sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
            titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
          />
          <CardContent sx={{ p: 0 }}>
            <List>
              {asignacionesTotales.map((a, i) => (
                <ListItemButton
                  key={i}
                  divider
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <ListItemText
                    primary={a.nombre}
                    secondary={`Hospitales: ${a.hospitales.join(', ')}`}
                    sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                  />
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => eliminarAsignacion(a.idUsuario)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemButton>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default AsignarHospitales;
