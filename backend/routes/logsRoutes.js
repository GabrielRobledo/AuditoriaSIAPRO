const express = require('express');
const router = express.Router();
const LogController = require('../controllers/logsControllers');

router.post('/', LogController.registrar);
router.get('/:id', LogController.listarPorUsuario);

module.exports = router;
