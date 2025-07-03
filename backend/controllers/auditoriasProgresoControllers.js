const model = require('../models/auditoriasProgresoModels');

const saveOrUpdate = async (req, res) => {
  const idUsuario = parseInt(req.params.idUsuario, 10);
  const { idEfector, periodo, datos } = req.body;

  try {
    await model.upsert(idUsuario, idEfector, periodo, datos);
    res.json({ message: 'Guardado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar auditoría en progreso' });
  }
};

const getDraft = async (req, res) => {
  const idUsuario = parseInt(req.params.idUsuario, 10);
  const idEfector = parseInt(req.params.idEfector, 10);
  const periodo = req.params.periodo;

  try {
    const datos = await model.get(idUsuario, idEfector, periodo);
    if (!datos) return res.status(404).json({ message: 'No hay borrador' });
    res.json(JSON.parse(datos));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener borrador' });
  }
};

const deleteDraft = async (req, res) => {
  const idUsuario = parseInt(req.params.idUsuario, 10);
  const idEfector = parseInt(req.params.idEfector, 10);
  const periodo = req.params.periodo;

  try {
    await model.remove(idUsuario, idEfector, periodo);
    res.json({ message: 'Borrador eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar borrador' });
  }
};

module.exports = {
  saveOrUpdate,
  getDraft,
  deleteDraft,
};
