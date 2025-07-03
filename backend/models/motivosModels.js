const db = require('../db/conexion');

const Motivos = {
    getAll: (callback) =>{
        db.query('SELECT * FROM motivos', (err, results) =>{
            if (err) return callback(err);
            callback(null, results)
        });
    }
};

module.exports = Motivos