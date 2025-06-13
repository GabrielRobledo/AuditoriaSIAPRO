const beneficiarios = require('../models/beneficiarioModels');

exports.listarBeneficiarios = (req, res) => {
  beneficiarios.getAll((err, data) => {
    if (err) {
      res.status(500).send('Error al obtener los beneficiarios');
    } else {
      res.json(data);
    }
  });
};
