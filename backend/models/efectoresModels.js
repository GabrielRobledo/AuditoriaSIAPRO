const db = require('../db/conexion');

const Efectores = {
    getAll: (callback) =>{
        db.query('SELECT * FROM efectores', (err, results) =>{
            if (err) return callback(err);
            callback(null, results)
        });
    }
};

module.exports = Efectores