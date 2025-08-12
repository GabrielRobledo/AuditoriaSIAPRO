const db = require('../db/conexion');

const Modulos = {
    getAll: (callback) =>{
        db.query('SELECT * FROM modulos', (err, results) =>{
            if (err) return callback(err);
            callback(null, results)
        });
    }
};

module.exports = Modulos