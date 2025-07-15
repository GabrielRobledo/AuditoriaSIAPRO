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

const deleteProgreso = (idSerial) => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM auditoria_en_progreso
      WHERE idSerial = ?
    `;

    db.query(query, [idSerial], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Devuelve los datos JSON guardados en un borrador por ID (numérico)
async function getDraftById(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT datos FROM auditoria_en_progreso WHERE idSerial = ?', [id], (err, rows) => {
      if (err) return reject(err);
      if (rows.length === 0) return resolve(null);
      try {
        const datos = JSON.parse(rows[0].datos);
        resolve(datos);
      } catch (e) {
        reject(e);
      }
    });
  });
}

const listarParaUsuario = (idUsuario) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT idSerial, idEfector, periodo FROM auditoria_en_progreso WHERE idUsuario = ?',
      [idUsuario],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
};

const getDraftByEfector = (idEfector, idUsuario = null) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT aep.idSerial AS id,
             aep.idEfector,
             aep.idUsuario,
             aep.periodo,
             aep.datos
      FROM auditoria_en_progreso aep
      WHERE aep.idEfector = ?
    `;
    const params = [idEfector];

    if (idUsuario != null) {
      sql += ' AND aep.idUsuario = ?';
      params.push(idUsuario);
    }

    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(null);

      let datos = [];

      try {
        datos = JSON.parse(results[0].datos);
      } catch (error) {
        console.warn('⚠️ Error al parsear campo `datos` como JSON:', error);
      }

      resolve({
        id: results[0].id,
        idEfector: results[0].idEfector,
        idUsuario: results[0].idUsuario,
        periodo: results[0].periodo,
        datos // ← se devuelve el array completo que usás para renderizar la tabla
      });
    });
  });
};




module.exports = {
  upsert,
  get,
  remove,
  getDraftById,
  listarParaUsuario,
  getDraftByEfector,
  deleteProgreso,
};
