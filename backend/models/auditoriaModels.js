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

exports.getCountAuditoriasXUsuario = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      SELECT
        usuarios.idUsuario, 
        COUNT(auditoria.idAuditoria) AS auditoriasCount
      FROM usuarios
      LEFT JOIN auditoria ON auditoria.idUsuario = usuarios.idUsuario
      GROUP BY usuarios.idUsuario;
      `,
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  } );
};


exports.getResumenPorAuditor = (idUsuario) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      SELECT 
        a.idAuditoria,
        a.periodo,
        a.totalDebito,
        e.RazonSocial AS hospital,
        COUNT(da.\`idDetalle-auditoria\`) AS cantidadDetalles,
        SUM(da.importe) AS totalDebitos
      FROM auditoria a
      JOIN \`detalle-auditoria\` da ON a.idAuditoria = da.idAuditoria
      JOIN efectores e ON a.idEfector = e.idEfector
      WHERE a.idUsuario = ?
      GROUP BY a.idAuditoria
      ORDER BY a.periodo DESC
      `,
      [idUsuario],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};
