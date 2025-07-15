const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auditoriasProgresoControllers');
const auditoriasProgresoController = require('../controllers/auditoriasProgresoControllers');
const auditoriaController = require('../controllers/auditoriasControllers');

router.put('/auditorias-en-progreso/:idUsuario', ctrl.saveOrUpdate);
router.get('/auditorias-en-progreso/:idUsuario/:idEfector/:periodo', ctrl.getDraft);
router.delete('/auditorias-en-progreso/:idUsuario/:idEfector/:periodo', ctrl.deleteDraft);
router.get('/borradores/:idUsuario', auditoriasProgresoController.listarBorradores);
router.get('/borradores/efector/:idEfector', auditoriaController.obtenerBorradorPorEfector);
router.delete('/borradores/:idSerial', auditoriasProgresoController.deleteProgreso);


module.exports = router;
