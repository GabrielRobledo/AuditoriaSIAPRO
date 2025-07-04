const db = require('../db/conexion');

exports.crearAuditoria = (req, res) => {
  const { periodo, idUsuario, idEfector, totalDebito, detalles } = req.body;

  if (!periodo || !idUsuario || !idEfector || !detalles || detalles.length === 0) {
    return res.status(400).json({ mensaje: 'Datos incompletos' });
  }

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ mensaje: 'Error iniciando transacción' });

    db.query(
      'INSERT INTO auditoria (periodo, idUsuario, idEfector, totalDebito) VALUES (?, ?, ?, ?)',
      [periodo, idUsuario, idEfector, totalDebito],
      (err, result) => {
        if (err) return db.rollback(() => {
          console.error(err);
          res.status(500).json({ mensaje: 'Error al guardar auditoría' });
        });

        const idAuditoria = result.insertId;
        const inserts = detalles.map((d) => [d.idAtencion, idAuditoria, d.idMotivo || null, d.debito]);

        db.query(
          'INSERT INTO `detalle-auditoria` (idAtencion, idAuditoria, idMotivo, importe) VALUES ?',
          [inserts],
          (err) => {
            if (err) return db.rollback(() => {
              console.error(err);
              res.status(500).json({ mensaje: 'Error al guardar detalles' });
            });

            db.commit((err) => {
              if (err) return db.rollback(() => {
                console.error(err);
                res.status(500).json({ mensaje: 'Error al confirmar transacción' });
              });

              res.json({ mensaje: 'Auditoría registrada con éxito', idAuditoria });
            });
          }
        );
      }
    );
  });
};

exports.listarAuditorias = (req, res) => {
  db.query(`
    SELECT 
      a.idAuditoria, e.RazonSocial, a.periodo, a.idUsuario, a.idEfector, a.totalDebito,
      da.idAtencion, da.importe AS debito, at.valorTotal
    FROM auditoria as a
    JOIN \`detalle-auditoria\` as da ON a.idAuditoria = da.idAuditoria 
    JOIN efectores as e ON e.idEfector = a.idEfector 
    JOIN atenciones as at ON da.idAtencion = at.idAtencion
    LEFT JOIN motivos m ON da.idMotivo = m.idMotivo
    ORDER BY a.idAuditoria DESC;
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al listar auditorías' });

    const result = rows.reduce((acc, r) => {
      if (!acc[r.idAuditoria]) {
        acc[r.idAuditoria] = {
          idAuditoria: r.idAuditoria,
          Hospital: r.RazonSocial,
          periodo: r.periodo,
          idUsuario: r.idUsuario,
          idEfector: r.idEfector,
          totalDebito: r.totalDebito,
          totalFacturado: 0, 
          detalles: []
        };
      }
      acc[r.idAuditoria].detalles.push({
        idAtencion: r.idAtencion,
        debito: r.debito,
        valorTotal: r.valorTotal
      });
      acc[r.idAuditoria].totalFacturado += parseFloat(r.valorTotal || 0);
      return acc;
    }, {});

    res.json(Object.values(result));
  });
};


exports.obtenerAuditoria = (req, res) => {
  const { id } = req.params;

  db.query(
    `
    SELECT 
      a.idAuditoria, a.periodo, a.idUsuario, a.idEfector, a.totalDebito,
      da.idAtencion, da.importe AS debito, da.idMotivo,

      at.tipoAtencion, at.fecha, 
      b.apeYnom, 
      n.codPractica, at.fechaPractica, 
      at.cantidad, at.valorTotal, 
      m.descripcion AS moduloDescripcion, 
      ef.RazonSocial AS hospital

    FROM auditoria a
    JOIN \`detalle-auditoria\` da ON da.idAuditoria = a.idAuditoria
    JOIN atenciones at ON at.idAtencion = da.idAtencion
    INNER JOIN beneficiarios b ON at.idBeneficiario = b.idBeneficiario
    INNER JOIN nomencladores n ON at.idNomenclador = n.idNomenclador
    INNER JOIN modulos m ON n.idModulo = m.idModulo
    INNER JOIN efectores ef ON at.idEfector = ef.idEfector

    WHERE a.idAuditoria = ?
    `,
    [id],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al obtener auditoría' });
      }
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No existe la auditoría' });
      }

      const aud = {
        idAuditoria: rows[0].idAuditoria,
        periodo: rows[0].periodo,
        idUsuario: rows[0].idUsuario,
        idEfector: rows[0].idEfector,
        totalDebito: rows[0].totalDebito,
        detalles: rows.map(r => ({
          idAtencion: r.idAtencion,
          tipoAtencion: r.tipoAtencion,
          fecha: r.fecha,
          apeYnom: r.apeYnom,
          codPractica: r.codPractica,
          fechaPractica: r.fechaPractica,
          cantidad: r.cantidad,
          valorTotal: parseFloat(r.valorTotal),
          moduloDescripcion: r.moduloDescripcion,
          hospital: r.hospital,
          idMotivo: r.idMotivo || null,
          debito: parseFloat(r.debito)
        }))
      };

      res.json(aud);
    }
  );
};


exports.editarAuditoria = (req, res) => {
  const { id } = req.params;
  const { periodo, totalDebito, detalles } = req.body;

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: 'Error al iniciar transacción' });

    db.query(
      'UPDATE auditoria SET periodo = ?, totalDebito = ? WHERE idAuditoria = ?',
      [periodo, totalDebito, id],
      err => {
        if (err) return db.rollback(() => res.status(500).json({ error: 'Error al actualizar auditoría' }));

        db.query('DELETE FROM `detalle-auditoria` WHERE idAuditoria = ?', [id], err => {
          if (err) return db.rollback(() => res.status(500).json({ error: 'Error al eliminar detalles anteriores' }));

          const valores = detalles.map(d => [
            id,
            d.idAtencion,
            d.idMotivo || null, 
            d.debito,
          ]);

          db.query(
            'INSERT INTO `detalle-auditoria` (idAuditoria, idAtencion, idMotivo, importe) VALUES ?',
            [valores],
            err => {
              if (err) return db.rollback(() => res.status(500).json({ error: 'Error al insertar nuevos detalles' }));

              db.commit(err => {
                if (err) return db.rollback(() => res.status(500).json({ error: 'Error al confirmar edición' }));
                res.json({ mensaje: 'Auditoría editada correctamente' });
              });
            }
          );
        });
      }
    );
  });
};

exports.borrarAuditoria = (req, res) => {
  const { id } = req.params;
  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: 'Error al iniciar transacción' });

    db.query('DELETE FROM `detalle-auditoria` WHERE idAuditoria = ?', [id], err => {
      if (err) return db.rollback(() => res.status(500).json({ error: 'Error al eliminar detalles' }));

      db.query('DELETE FROM auditoria WHERE idAuditoria = ?', [id], err => {
        if (err) return db.rollback(() => res.status(500).json({ error: 'Error al eliminar auditoría' }));

        db.commit(err => {
          if (err) return db.rollback(() => res.status(500).json({ error: 'Error al confirmar eliminación' }));
          res.json({ mensaje: 'Auditoría eliminada correctamente' });
        });
      });
    });
  });
};