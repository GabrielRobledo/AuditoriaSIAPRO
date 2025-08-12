const express = require('express');
const router = express.Router();
const novedadController = require('../controllers/novedadesControlles');

// Rutas
router.get('/novedades', novedadController.listarNovedades);
router.post('/crearNovedades', novedadController.crearNovedad);
router.put('/actualizarNovedad', novedadController.actualizarNovedad);
router.delete('/eliminarNovedad/:id', novedadController.eliminarNovedad);

module.exports = router;
