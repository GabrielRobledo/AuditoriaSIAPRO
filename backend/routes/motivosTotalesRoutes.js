const express = require('express');
const router = express.Router();
const motivosTotalesControllers = require('../controllers/motivosTotalesControllers');

router.get('/motivosTotales', motivosTotalesControllers.listarMotivosTotales);

module.exports = router;
