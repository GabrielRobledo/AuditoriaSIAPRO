const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/altaUserModels');

const login = (req, res) => {
  const { usuario, contraseña } = req.body;

  Usuario.getUserByUsername(usuario, (err, user) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ msg: 'Error del servidor' });
    }

    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ msg: 'Usuario no encontrado' });
    }

    console.log('Usuario recuperado:', user);

    bcrypt.compare(contraseña, user['contraseña'], (err, isMatch) => {
      if (err) {
        console.error('Error al comparar contraseñas:', err);
        return res.status(500).json({ msg: 'Error al verificar credenciales' });
      }

      if (!isMatch) {
        return res.status(401).json({ msg: 'Credenciales inválidas' });
      }

      const token = jwt.sign({
        idUsuario: user.idUsuario,
        nombre: user.nombre,
        usuario: user.usuario,
        idTipoUsuario: user.idTipoUsuario
      }, 'tu_secreto_jwt', { expiresIn: '2h' });

      res.json({ msg: 'Login exitoso', token, user });
    });
  });
};

module.exports = {
  login
};
