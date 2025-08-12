const express = require('express');
const router = express.Router();
const reportesControllers = require('../controllers/reportesControllers');

router.get('/practicas-mas-debitadas', reportesControllers.listaPracticasConDebito);

module.exports = router;
