const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriasControllers');

router.post('/auditorias', auditoriaController.crearAuditoria);
router.get('/auditorias', auditoriaController.listarAuditorias);
router.get('/auditorias/:id', auditoriaController.obtenerAuditoria);
router.put('/auditorias/:id', auditoriaController.editarAuditoria);
router.delete('/auditorias/:id', auditoriaController.borrarAuditoria);
router.get('/estado/:periodo/:idUsuario', auditoriaController.getEstadoAuditorias);
router.get('/borradores/:idUsuario', auditoriaController.getBorradores);
router.get('/auditorias/resumen/:idUsuario', auditoriaController.obtenerResumenAuditor);
router.get('/count-auditorias', auditoriaController.countAuditoriasXUsuario);


module.exports = router;
