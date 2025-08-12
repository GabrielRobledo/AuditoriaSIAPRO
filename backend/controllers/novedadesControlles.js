const Novedad = require('../models/novedadesModels');

// Listar novedades
exports.listarNovedades = (req, res) => {
  Novedad.getAllNovedades((err, novedades) => {
    if (err) {
      console.error('Error al obtener novedades:', err);
      return res.status(500).json({ error: 'Error al obtener las novedades' });
    }
    res.json(novedades);
  });
};

// Crear novedad
exports.crearNovedad = (req, res) => {
  const { titulo, mensaje } = req.body;

  if (!titulo || !mensaje) {
    return res.status(400).json({ error: 'Título y mensaje son requeridos' });
  }

  Novedad.createNovedad(titulo, mensaje, (err, result) => {
    if (err) {
      console.error('Error al crear la novedad:', err);
      return res.status(500).json({ error: 'Error al crear la novedad' });
    }
    res.status(201).json({ message: 'Novedad creada con éxito' });
  });
};

// Actualizar novedad
exports.actualizarNovedad = (req, res) => {
  const { id, titulo, mensaje } = req.body;

  if (!id || !titulo || !mensaje) {
    return res.status(400).json({ error: 'ID, título y mensaje son requeridos' });
  }

  Novedad.updateNovedad(id, titulo, mensaje, (err, result) => {
    if (err) {
      console.error('Error al actualizar la novedad:', err);
      return res.status(500).json({ error: 'Error al actualizar la novedad' });
    }
    res.json({ message: 'Novedad actualizada con éxito' });
  });
}

// Eliminar novedad
exports.eliminarNovedad = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID es requerido' });
  }

  Novedad.deleteNovedad(id, (err, result) => {
    if (err) {
      console.error('Error al eliminar la novedad:', err);
      return res.status(500).json({ error: 'Error al eliminar la novedad' });
    }
    res.json({ message: 'Novedad eliminada con éxito' });
  });
}
