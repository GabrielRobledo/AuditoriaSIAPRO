const db = require('../db/conexion');

// Asignar hospitales a un auditor (elimina los anteriores y agrega los nuevos)
exports.asignarEfectores = (req, res) => {
  const { idUsuario, efectoresIds } = req.body;

  if (!idUsuario || !Array.isArray(efectoresIds)) {
    return res.status(400).json({ msg: 'Datos inválidos' });
  }

  // Primero eliminamos asignaciones previas
  db.query('DELETE FROM auditor_efector WHERE idUsuario = ?', [idUsuario], (err) => {
    if (err) {
        console.error('Error en DELETE:', err); // 👈 agregá esto
        return res.status(500).json({ msg: 'Error al limpiar asignaciones previas', error: err });
    }

    if (efectoresIds.length === 0) {
      return res.json({ msg: 'Asignaciones actualizadas (vacías)' });
    }

    // Luego insertamos nuevas asignaciones
    const values = efectoresIds.map(idEfector => [idUsuario, idEfector]);
    db.query('INSERT INTO auditor_efector (idUsuario, idEfector) VALUES ?', [values], (err2) => {
      if (err2) return res.status(500).json({ msg: 'Error al asignar efectores' });
      res.json({ msg: 'Asignación realizada con éxito' });
    });
  });
};

// (opcional) Obtener efectores asignados a un auditor
exports.obtenerEfectoresPorAuditor = (req, res) => {
  const { id } = req.params;
  db.query('SELECT idEfector FROM auditor_efector WHERE idUsuario = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ msg: 'Error al obtener asignaciones' });
    res.json(results.map(row => row.idEfector));
  });
};

exports.eliminarAsignacion = (req, res) => {
  const { idUsuario } = req.params;
  db.query('DELETE FROM auditor_efector WHERE idUsuario = ?', [idUsuario], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: 'Error al eliminar asignaciones', error: err });
    }
    res.json({ msg: 'Asignaciones eliminadas correctamente' });
  });
};


// Obtener todas las asignaciones (usuario + efector)
exports.obtenerTodasAsignaciones = (req, res) => {
  const sql = 'SELECT idUsuario, idEfector FROM `auditor_efector`';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener asignaciones:', err);
      return res.status(500).json({ msg: 'Error al obtener asignaciones' });
    }
    res.json(results);  // retorna [{idUsuario:1, idEfector:2}, ...]
  });
};
