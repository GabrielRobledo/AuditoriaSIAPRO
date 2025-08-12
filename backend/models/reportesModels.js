const db = require('../db/conexion');

const practicasConDebitos = {
  getAll: (callback) => {
    const sql = `
    SELECT 
      n.descripcion AS practica,
      m.descripcion AS modulo,
      SUM(da.importe) AS total_debitado,
      COUNT(*) AS cantidad_debitos
    FROM 
      \`detalle-auditoria\` da
    JOIN 
      atenciones a ON da.idAtencion = a.idAtencion
    JOIN 
      nomencladores n ON a.idNomenclador = n.idNomenclador
    JOIN 
      modulos m ON n.idModulo = m.idModulo
    GROUP BY 
      n.idNomenclador, n.descripcion, m.descripcion
    ORDER BY 
      total_debitado DESC
    `;
    db.query(sql, (err, results) =>{
            if (err) return callback(err);
            callback(null, results)
        });
    }
};



module.exports = practicasConDebitos;
