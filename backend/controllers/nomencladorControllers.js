const nomencladores = require('../models/nomencladorModels');

exports.listarNomenclador = (res, req) => {
    nomencladores.getAll((err, data) => {
    if (err) {
      res.status(500).send('Error al obtener el nomenclador');
    } else {
      res.json(data);
    }
  });
}