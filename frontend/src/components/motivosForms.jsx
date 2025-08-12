import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Container, Grid, Card, CardContent } from '@mui/material';
import axios from 'axios';
import API_URL from '../config';
import Swal from 'sweetalert2';

const Motivos = () => {
  const [motivos, setMotivos] = useState([]);
  const [motivo, setMotivo] = useState({ motivo: '' });  // Solo el campo 'motivo' ahora
  const [isEdit, setIsEdit] = useState(false); // Estado para verificar si estamos en modo editar
  const [editId, setEditId] = useState(null);  // Para almacenar el ID del motivo a editar

  // Obtener lista de motivos
  useEffect(() => {
    axios.get(`${API_URL}/api/motivos`)
      .then(response => setMotivos(response.data))
      .catch(err => alert('Error al obtener los motivos: ' + err.message));

    // Si estamos en modo edición, obtenemos el motivo por su ID
    if (isEdit && editId) {
      axios.get(`${API_URL}/api/motivos/${editId}`)
        .then(response => {
          setMotivo({ motivo: response.data.motivo }); // Solo 'motivo' (sin descripcion)
        })
        .catch(error => {
          console.error("Hubo un error al obtener el motivo:", error);
        });
    }
  }, [isEdit, editId]);  // Dependemos de isEdit y editId para cargar el motivo

  // Manejo de cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMotivo((prevMotivo) => ({
      ...prevMotivo,
      [name]: value
    }));
  };

  // Manejo del envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      // Editar motivo
      axios.put(`${API_URL}/api/motivosEditar/${editId}`, motivo)
        .then(() => {
          Swal.fire({
            title: 'Éxito!',
            text: 'Motivo actualizado correctamente.',
            icon: 'success',
            confirmButtonText: 'Ok'
          });

          // Limpiar los campos después de editar
          setMotivo({ motivo: '' });
          setIsEdit(false);
          setEditId(null);

          // Recargar la lista de motivos
          axios.get(`${API_URL}/api/motivos`)
            .then(response => setMotivos(response.data))
            .catch(err => alert('Error al obtener la lista de motivos actualizada: ' + err.message));
        })
        .catch(err => {
          Swal.fire({
            title: 'Error!',
            text: 'Hubo un problema al actualizar el motivo.',
            icon: 'error',
            confirmButtonText: 'Ok'
          });
        });
    } else {
      // Agregar nuevo motivo
      axios.post(`${API_URL}/api/motivosCrear`, motivo)
        .then(() => {
          Swal.fire({
            title: 'Éxito!',
            text: 'Motivo agregado correctamente.',
            icon: 'success',
            confirmButtonText: 'Ok'
          });

          // Limpiar los campos después de agregar
          setMotivo({ motivo: '' });

          // Recargar la lista de motivos
          axios.get(`${API_URL}/api/motivos`)
            .then(response => setMotivos(response.data))
            .catch(err => alert('Error al obtener la lista de motivos: ' + err.message));
        })
        .catch(err => {
          Swal.fire({
            title: 'Error!',
            text: 'Hubo un problema al agregar el motivo.',
            icon: 'error',
            confirmButtonText: 'Ok'
          });
        });
    }
  };

  // Función para ir al modo edición
  const handleEdit = (id) => {
    setIsEdit(true);
    setEditId(id);  // Guardamos el ID del motivo a editar
  };

  return (
    <Container>
      {/* Formulario para agregar o editar un motivo */}
      <Box sx={{ mt: 4, mb: 4, padding: 3, boxShadow: 3, borderRadius: 2, backgroundColor: '#fff' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {isEdit ? 'Editar Motivo' : 'Agregar Motivo'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Motivo"  // Nombre del motivo
            name="motivo"
            value={motivo.motivo}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            {isEdit ? 'Actualizar' : 'Agregar'}
          </Button>
        </form>
      </Box>

      {/* Lista de motivos */}
      {!isEdit && (
        <>
          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>Motivos</Typography>
          <Grid container spacing={3}>
            {motivos.map(motivo => (
              <Grid item xs={12} sm={6} md={4} key={motivo.idMotivo}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{motivo.motivo}</Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEdit(motivo.idMotivo)}  // Manejo de la edición directamente
                      sx={{ mt: 2 }}
                    >
                      Editar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Motivos;
