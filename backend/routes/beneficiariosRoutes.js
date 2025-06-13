const express = require('express');
const router = express.Router();
const beneficiariosControllers = require('../controllers/beneficiariosControllers');

router.get('/beneficiarios', beneficiariosControllers.listarBeneficiarios);

module.exports = router;