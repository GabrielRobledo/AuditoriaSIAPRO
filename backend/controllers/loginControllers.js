const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/altaUserModels');
const LogModel = require('../models/logsModels');

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

    bcrypt.compare(contraseña, user['contraseña'], (err, isMatch) => {
      if (err) {
        console.error('Error al comparar contraseñas:', err);
        return res.status(500).json({ msg: 'Error al verificar credenciales' });
      }

      if (!isMatch) {
        return res.status(401).json({ msg: 'Credenciales inválidas' });
      }

      // ✅ Login exitoso
      const token = jwt.sign({
        idUsuario: user.idUsuario,
        nombre: user.nombre,
        usuario: user.usuario,
        idTipoUsuario: user.idTipoUsuario
      }, 'tu_secreto_jwt', { expiresIn: '2h' });

      res.json({ msg: 'Login exitoso', token, user });

      // 📝 Registrar log de inicio de sesión
      LogModel.crearLog({
        idUsuario: user.idUsuario,
        accion: 'Inicio de sesión',
        resultado: 'Exito',
        descripcion: 'El usuario inició sesión correctamente.'
      }, (err) => {
        if (err) {
          console.error('Error al registrar log de inicio de sesión:', err);
        } else {
          console.log('✅ Log de inicio de sesión registrado');
        }
      });
    });
  });
};



module.exports = {
  login
};
