const db = require('../db/conexion');

const beneficiarios = {
    getAll: (callback) => {
        db.query('select * from beneficiarios', (err, results)=>{
            if (err) return callback(err);
            callback(null, results)
        });
    }
};

module.exports = beneficiarios