const {atenciones, atencionesTotales}  = require('../models/atencionesModels');

exports.listarAtenciones = (req, res) => {
  atenciones.getAll((err, data) => {
    if (err) {
      res.status(500).send('Error al obtener los atenciones');
    } else {
      res.json(data);
    }
  });
};

exports.ListarAtencionesTotales = (req, res) => {
  atencionesTotales.getAll((err, data) => {
    if (err) {
      res.status(500).send('Error al obtener todas las atenciones');
    } else {
      res.json(data);
    }
  });
};