const db = require('../db/conexion');

const Nomenclador = {
    getAll: (callback) =>{
        db.query('SELECT * FROM nomencladores', (err, results) =>{
            if (err) return callback(err);
            callback(null, results)
        });
    }
};

module.exports = Nomenclador