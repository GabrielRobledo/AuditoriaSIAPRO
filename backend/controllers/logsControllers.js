const LogModel = require('../models/logsModels');

const LogController = {
  registrar(req, res) {
    const { idUsuario, accion, resultado, descripcion } = req.body;
    LogModel.crearLog({ idUsuario, accion, resultado, descripcion }, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ mensaje: 'Error al registrar el log' });
      }
      res.status(201).json({ mensaje: 'Log registrado' });
    });
  },

  listarPorUsuario(req, res) {
    const { id } = req.params;
    console.log('ID recibido en controller:', id);

    LogModel.obtenerLogsPorUsuario(id, (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ mensaje: 'Error al obtener logs' });
      }

      console.log('Logs devueltos:', rows); // ✅ Te confirma si hay resultados
      res.json(rows);
    });
  }
};

module.exports = LogController;
