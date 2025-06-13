const atenciones = require('../models/atencionesModels');

exports.listarAtenciones = (req, res) => {
  atenciones.getAll((err, data) => {
    if (err) {
      res.status(500).send('Error al obtener los atenciones');
    } else {
      res.json(data);
    }
  });
};