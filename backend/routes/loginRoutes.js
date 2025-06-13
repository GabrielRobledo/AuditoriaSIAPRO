const { Login } = require('../controllers/loginControllers');
const express = require('express');
const router = express.Router();

router.post('/login', Login);

module.exports = router;