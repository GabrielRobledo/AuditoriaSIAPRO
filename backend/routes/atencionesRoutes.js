const express = require('express');
const router = express.Router();
const atencionesControllers = require('../controllers/atencionesControllers');

router.get('/atenciones', atencionesControllers.listarAtenciones);

module.exports = router;