const express = require('express');
const router = express.Router();
const modulosControllers = require('../controllers/modulosControllers');

router.get('/modulos', modulosControllers.listarModulos);

module.exports = router;
