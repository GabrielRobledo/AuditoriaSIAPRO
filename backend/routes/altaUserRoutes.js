const express = require('express');
const router = express.Router();
const { register, getAllUsers, deleteUser, updateUser, login, restoreUser } = require('../controllers/altaUserControllers');

router.post('/register', register);
router.post('/login', login);
router.get('/usuarios', getAllUsers);
router.delete('/usuarios/:id', deleteUser);     
router.put('/usuarios/:id', updateUser);
router.put('/usuarios/restore/:id', restoreUser);  

module.exports = router;