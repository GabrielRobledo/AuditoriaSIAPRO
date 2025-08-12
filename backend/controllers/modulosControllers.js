const modulos = require('../models/modulosModels');

exports.listarModulos = (res, req) => {
    modulos.getAll((err, data) => {
    if (err) {
      res.status(500).send('Error al obtener los modulos');
    } else {
      res.json(data);
    }
  });
}