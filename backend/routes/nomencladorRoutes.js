const express = require('express');
const router = express.Router();
const nomencladorControllers = require('../controllers/nomencladorControllers');

router.get('/nomenclador', nomencladorControllers.listarNomenclador);

module.exports = router;
