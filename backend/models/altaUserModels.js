const db = require('../db/conexion');

const createUser = (nombre, usuario, contraseña, idTipoUsuario, callback) => {
  const sql = 'INSERT INTO usuarios (nombre, usuario, contraseña, idTipoUsuario) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, usuario, contraseña, idTipoUsuario], callback);
};

const getUserByUsername = (usuario, callback) => {
  const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
  db.query(sql, [usuario], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]); // ✅ esto estaba faltando
  });
};

const updateUser = (id, nombre, usuario, idTipoUsuario, callback) => {
  const sql = 'UPDATE usuarios SET nombre = ?, usuario = ?, idTipoUsuario = ? WHERE idUsuario = ?';
  db.query(sql, [nombre, usuario, idTipoUsuario, id], callback);
};

const deleteUser = (id, callback) => {
  const sql = 'DELETE FROM usuarios WHERE idUsuario = ?';
  db.query(sql, [id], callback);
};

const getAllUsers = (callback) => {
  const sql = `
    SELECT u.idUsuario, u.nombre, u.usuario, t.tipo AS tipoUsuario
    FROM usuarios u
    JOIN tipousuarios t ON u.idTipoUsuario = t.idTipoUsuario
  `;
  db.query(sql, callback);
};

module.exports = { createUser, getUserByUsername, getAllUsers, updateUser, deleteUser };
