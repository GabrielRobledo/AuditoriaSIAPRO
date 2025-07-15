const db = require('../db/conexion');

const periodos = {
  getAll: (idEfector, callback) => {
    const sql = `
      SELECT DISTINCT periodo 
      FROM auditoria 
      WHERE idEfector = ? 
      ORDER BY periodo DESC
    `;
    db.query(sql, [idEfector], (err, results) => {
      if (err) return callback(err);
      const periodos = results.map(row => row.periodo);
      callback(null, periodos);
    });
  }
};

module.exports = periodos;
