const express = require('express');
const router = express.Router();
const periodosControllers = require('../controllers/periodosControllers');

// Ruta para obtener periodos disponibles por efector
router.get('/periodos/:idEfector', periodosControllers.listarPeriodos);

module.exports = router;
