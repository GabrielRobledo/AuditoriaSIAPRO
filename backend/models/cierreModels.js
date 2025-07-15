const db = require('../db/conexion');

const Cierre = {
  crearCierre(idEfector, periodo, idUsuario, callback) {
    const sql = 'INSERT INTO cierres (idEfector, periodo, idUsuario) VALUES (?, ?, ?)';
    db.query(sql, [idEfector, periodo, idUsuario], (err, result) => {
      if (err) return callback(err);
      console.log('Nuevo idCierre:', result.insertId);
      callback(null, result.insertId);
    });
  },

  guardarDetalle(idCierre, idEfector, periodo, callback) {
    const sql = `
      INSERT INTO cierres_detalle (idCierre, idAtencion, tieneDebito, totalDebito, motivos)
      SELECT 
        ? AS idCierre,
        a.idAtencion,
        CASE WHEN da.importe > 0 THEN TRUE ELSE FALSE END AS tieneDebito,
        IFNULL(da.importe, 0) AS totalDebito,
        IF(da.importe > 0 AND m.motivo IS NOT NULL, m.motivo, NULL) AS motivos
      FROM atenciones a
      JOIN auditoria au ON a.idEfector = au.idEfector
      LEFT JOIN \`detalle-auditoria\` da ON a.idAtencion = da.idAtencion
      LEFT JOIN motivos m ON da.idMotivo = m.idMotivo
      WHERE a.idEfector = ?
      AND au.periodo = ?
      GROUP BY a.idAtencion;
    `;

    db.query(sql, [idCierre, idEfector, periodo], (err, result) => {
      if (err) {
        console.error('Error en guardarDetalle:', err);
        return callback(err);
      }
      console.log('Resultado guardarDetalle:', result);
      callback(null, result);
    });
  },

  listarCierres(callback) {
    const sql = `
      SELECT c.idCierre, c.periodo, c.idEfector, e.RazonSocial, u.nombre AS usuario
      FROM cierres c
      JOIN efectores e ON c.idEfector = e.idEfector
      JOIN usuarios u ON c.idUsuario = u.idUsuario
      ORDER BY c.periodo DESC, e.RazonSocial;
    `;
    db.query(sql, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  }
};

module.exports = { Cierre };
