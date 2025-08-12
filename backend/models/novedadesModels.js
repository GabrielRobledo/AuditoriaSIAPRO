const db = require('../db/conexion');

// Obtener todas las novedades visibles
exports.getAllNovedades = (callback) => {
  db.query(
    'SELECT * FROM novedades WHERE visible = 1 ORDER BY fecha_creacion DESC',
    (err, results) => {
      callback(err, results);
    }
  );
};

// Crear una nueva novedad
exports.createNovedad = (titulo, mensaje, callback) => {
  db.query(
    'INSERT INTO novedades (titulo, mensaje) VALUES (?, ?)',
    [titulo, mensaje],
    (err, result) => {
      callback(err, result);
    }
  );
};

exports.updateNovedad = (id, titulo, mensaje, callback) => {
  db.query(
    'UPDATE novedades SET titulo = ?, mensaje = ? WHERE id = ?',
    [titulo, mensaje, id],
    (err, result) => {
      callback(err, result);
    }
  );
};

exports.deleteNovedad = (id, callback) => {
  db.query(
    'DELETE FROM novedades WHERE id = ?',
    [id],
    (err, result) => {
      callback(err, result);
    }
  );
};
