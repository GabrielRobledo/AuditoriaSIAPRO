const express = require('express');
const router = express.Router();
const { register, getAllUsers, deleteUser, updateUser, login, restoreUser, cambiarPassword } = require('../controllers/altaUserControllers');

router.post('/register', register);
router.post('/login', login);
router.get('/usuarios', getAllUsers);
router.delete('/usuarios/:id', deleteUser);     
router.put('/usuarios/:id', updateUser);
router.put('/usuarios/restore/:id', restoreUser);  
router.put('/usuarios/:id/cambiar-password', cambiarPassword);

module.exports = router;