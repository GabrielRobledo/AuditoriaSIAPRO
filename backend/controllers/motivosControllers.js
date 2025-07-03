const motivos = require('../models/motivosModels');

exports.listarMotivos = (req, res) => {
  motivos.getAll((err, data) => {
    if (err) {
      res.status(500).send('Error al obtener los efectores');
    } else {
      res.json(data);
    }
  });
};
exports.obtenerMotivoPorId = (req, res) => {
  const id = req.params.id;
  motivos.getById(id, (err, data) => {
    if (err) {
      res.status(500).send('Error al obtener el motivo');
    } else if (data.length === 0) {
      res.status(404).send('Motivo no encontrado');
    } else {
      res.json(data[0]);
    }
  });
};