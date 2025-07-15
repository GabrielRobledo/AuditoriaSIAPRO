const db = require('../db/conexion');

exports.getEfectores = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT idEfector, RazonSocial FROM efectores', (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.getEfectoresConAuditoriaCerrada = (periodo) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT idEfector FROM auditoria WHERE periodo = ?', [periodo], (err, results) => {
      if (err) return reject(err);
      resolve(results.map(r => r.idEfector));
    });
  });
};

exports.getEfectoresConBorrador = (periodo, idUsuario) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT idEfector FROM auditoria_en_progreso WHERE periodo = ? AND idUsuario = ?',
      [periodo, idUsuario],
      (err, results) => {
        if (err) return reject(err);
        resolve(results.map(r => r.idEfector));
      }
    );
  });
};

