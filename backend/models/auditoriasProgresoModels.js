const db = require('../db/conexion');

const upsert = (idUsuario, idEfector, periodo, datos) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO auditoria_en_progreso (idUsuario, idEfector, periodo, datos)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        datos = VALUES(datos), 
        fechaguardado = CURRENT_TIMESTAMP
    `;

    db.query(query, [idUsuario, idEfector, periodo, JSON.stringify(datos)], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const get = (idUsuario, idEfector, periodo) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT datos FROM auditoria_en_progreso
      WHERE idUsuario = ? AND idEfector = ? AND periodo = ?
    `;

    db.query(query, [idUsuario, idEfector, periodo], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]?.datos || null);
    });
  });
};

const remove = (idUsuario, idEfector, periodo) => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM auditoria_en_progreso
      WHERE idUsuario = ? AND idEfector = ? AND periodo = ?
    `;

    db.query(query, [idUsuario, idEfector, periodo], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  upsert,
  get,
  remove,
};
