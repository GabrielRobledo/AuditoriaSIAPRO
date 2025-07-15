const periodos = require('../models/periodosModels');

exports.listarPeriodos = (req, res) => {
  const { idEfector } = req.params;

  if (!idEfector) {
    return res.status(400).json({ error: 'Falta idEfector en la URL' });
  }

  periodos.getAll(idEfector, (err, data) => {
    if (err) {
      console.error('Error al obtener los periodos:', err);
      res.status(500).send('Error al obtener los periodos');
    } else {
      res.json(data);
    }
  });
};