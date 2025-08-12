const reportesModels = require('../models/reportesModels');


exports.listaPracticasConDebito = (req, res) => {
    reportesModels.getAll((err, data) => {
    if (err) {
      res.status(500).send('Error al obtener el resumen de practicas con debitos');
    } else {
      res.json(data);

    }
  });
}