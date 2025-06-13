const db = require('../db/conexion');

const usuarioEmail = (email, callback) => {
  db.query('SELECT * FROM usuarios WHERE usuario = "?"', [email], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

const crearUsuario = (email, callback) => {
  db.query('INSERT INTO usuarios SET ?', email, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

module.exports = { usuarioEmail, crearUsuario };
