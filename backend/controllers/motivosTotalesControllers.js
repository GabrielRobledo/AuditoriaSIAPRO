const motivosTotales = require('../models/motivosTotalesModels');

exports.listarMotivosTotales = (req, res) => {
  motivosTotales.getAll((err, data) => {
    if (err) {
      res.status(500).send('Error al obtener los totales de motivos: ' + err.message);
    } else {
      res.json(data);
    }
  });
};