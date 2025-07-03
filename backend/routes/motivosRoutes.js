const express = require('express');
const router = express.Router();
const motivosControllers = require('../controllers/motivosControllers');

router.get('/motivos', motivosControllers.listarMotivos);
router.get('/motivos/:id', motivosControllers.obtenerMotivoPorId);

module.exports = router;
