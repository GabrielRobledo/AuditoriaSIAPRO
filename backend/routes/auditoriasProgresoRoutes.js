const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auditoriasProgresoControllers');

router.put('/auditorias-en-progreso/:idUsuario', ctrl.saveOrUpdate);
router.get('/auditorias-en-progreso/:idUsuario/:idEfector/:periodo', ctrl.getDraft);
router.delete('/auditorias-en-progreso/:idUsuario/:idEfector/:periodo', ctrl.deleteDraft);

module.exports = router;
