const db = require('../db/conexion');

const atenciones = {
    getAll: (callback) => {
        db.query('SELECT idAtencion, tipoAtencion, fecha, b.apeYnom, n.codPractica, fechaPractica, cantidad, valorTotal, m.descripcion, e.RazonSocial, e.idEfector FROM `atenciones` as a inner join beneficiarios as b on a.idBeneficiario = b.idBeneficiario INNER JOIN nomencladores as n on a.idNomenclador = n.idNomenclador INNER JOIN efectores as e on a.idEfector = e.idEfector INNER JOIN modulos as m on n.idModulo = m.idModulo LEFT join auditoria as au on a.idEfector=au.idEfector where au.idEfector is null;', (err, results)=>{
            if (err) return callback(err);
            callback(null, results)
        });
    }
};

module.exports = atenciones