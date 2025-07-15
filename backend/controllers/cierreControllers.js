// controllers/cierreController.js
const CierreService = require('../services/cierreServices');

const crearCierre = async (req, res) => {
  try {
    const { idEfector, periodo, idUsuario } = req.body;

    // Validar que estén todos los datos
    if (!idEfector || !periodo || !idUsuario) {
      return res.status(400).json({ error: 'Faltan datos requeridos: idEfector, periodo, idUsuario' });
    }

    // Llamar al servicio que devuelve promesa
    const cierre = await CierreService.crearCierreConDetalle(idEfector, periodo, idUsuario);

    res.status(201).json({ message: 'Cierre creado correctamente', cierre });
  } catch (err) {
    console.error('Error en crearCierre:', err);
    res.status(500).json({ error: 'Error al crear el cierre' });
  }
};

const efectoresConCierre = (req, res) => {
  const { periodo } = req.query;

  db.query(
    'SELECT idEfector FROM cierres WHERE periodo = ?',
    [periodo],
    (err, results) => {
      if (err) {
        console.error('Error al obtener efectores con cierre:', err);
        return res.status(500).send('Error al obtener efectores con cierre');
      }
      const ids = results.map(r => r.idEfector);
      res.json(ids);
    }
  );
};

const listarCierres = (req, res) => {
  CierreService.listarCierres((err, results) => {
    if (err) {
      console.error('Error al listar cierres:', err);
      return res.status(500).send('Error al listar cierres');
    }
    res.json(results);
  });
};

module.exports = { crearCierre, efectoresConCierre, listarCierres };
