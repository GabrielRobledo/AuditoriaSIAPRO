// routes/cierreRoutes.js
const express = require('express');
const router = express.Router();
const cierreController = require('../controllers/cierreControllers');

// POST /api/cierres
router.post('/cierres', cierreController.crearCierre);
router.get('/efectores-con-cierre', cierreController.efectoresConCierre);
router.get('/listarCierres', cierreController.listarCierres);


module.exports = router;
