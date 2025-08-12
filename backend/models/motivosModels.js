const db = require('../db/conexion');

const Motivos = {
    // Obtener todos los motivos
    getAll: (callback) => {
        db.query('SELECT * FROM motivos', (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    // Agregar nuevo motivo
    addMotivo: (motivo, callback) => {
        const { motivo: descripcion } = motivo;  // Usamos 'motivo' para la descripción
        const query = 'INSERT INTO motivos (motivo) VALUES (?)';  // Solo 'motivo' en la consulta
        db.query(query, [descripcion], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    // Editar motivo
    updateMotivo: (id, motivo, callback) => {
        const { motivo: descripcion } = motivo;  // Usamos 'motivo' para la descripción
        const query = 'UPDATE motivos SET motivo = ? WHERE idMotivo = ?';  // Usamos 'idMotivo' para identificar
        db.query(query, [descripcion, id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },
    // En tu archivo motivosModels.js
    getById: (id, callback) => {
        const query = 'SELECT * FROM motivos WHERE idMotivo = ?';
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },
    
    
};


module.exports = Motivos;
