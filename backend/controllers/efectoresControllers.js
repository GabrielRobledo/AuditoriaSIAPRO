const efectores = require('../models/efectoresModels');

exports.listarEfectores = (req, res) => {
  efectores.getAll((err, data) => {
    if (err) {
      res.status(500).send('Error al obtener los efectores');
    } else {
      res.json(data);
    }
  });
};
