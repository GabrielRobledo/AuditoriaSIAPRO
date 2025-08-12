const express = require('express');
const router = express.Router();
const atencionesControllers = require('../controllers/atencionesControllers');

router.get('/atenciones', atencionesControllers.listarAtenciones);
router.get('/atencionesTotales', atencionesControllers.ListarAtencionesTotales);

module.exports = router;