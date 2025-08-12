const db = require('../db/conexion');

const LogModel = {
  crearLog({ idUsuario, accion, resultado, descripcion }, callback) {
    const query = `
      INSERT INTO logs (idUsuario, accion, resultado, descripcion)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [idUsuario, accion, resultado, descripcion], callback);
  },

  obtenerLogsPorUsuario(idUsuario, callback) {
    const query = `
      SELECT * FROM logs WHERE idUsuario = ? ORDER BY fecha DESC
    `;
    db.query(query, [idUsuario], callback);
  }
};

module.exports = LogModel;
