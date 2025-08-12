const express = require('express');
const router = express.Router();
const motivosControllers = require('../controllers/motivosControllers');

router.get('/motivos', motivosControllers.listarMotivos);
router.get('/motivos/:id', motivosControllers.obtenerMotivoPorId);
router.post('/motivosCrear', motivosControllers.agregarMotivo); // Crear un nuevo motivo
router.put('/motivosEditar/:id', motivosControllers.editarMotivo); // Editar un motivo existente


module.exports = router;
