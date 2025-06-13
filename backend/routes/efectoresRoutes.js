const express = require('express');
const router = express.Router();
const efectoresControllers = require('../controllers/efectoresControllers');

router.get('/efectores', efectoresControllers.listarEfectores);

module.exports = router;
