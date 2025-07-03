const db = require('../db/conexion')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/altaUserModels');

const register = (req, res) => {
  const { nombre, usuario, contraseña, idTipoUsuario } = req.body;

  if (!nombre || !usuario || !contraseña || !idTipoUsuario) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
  }

  Usuario.getUserByUsername(usuario, (err, existingUser) => {
    if (err) {
      console.error('Error al verificar usuario:', err);
      return res.status(500).json({ msg: 'Error del servidor' });
    }

    if (existingUser) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    bcrypt.hash(contraseña, 10, (err, hash) => {
      if (err) {
        console.error('Error al encriptar contraseña:', err);
        return res.status(500).json({ msg: 'Error al procesar la contraseña' });
      }

      Usuario.createUser(nombre, usuario, hash, parseInt(idTipoUsuario), (err, result) => {
        if (err) {
          console.error('Error al crear usuario:', err);
          return res.status(500).json({ msg: 'Error al registrar el usuario' });
        }

        res.status(201).json({ msg: 'Usuario registrado con éxito' });
      });
    });
  });
};

const getAllUsers = (req, res) => {
  const mostrarEliminados = req.query.eliminados === 'true';

  Usuario.getAllUsers(mostrarEliminados, (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return res.status(500).json({ msg: 'Error al obtener usuarios' });
    }
    res.json(results);
  });
};

const deleteUser = (req, res) => {
  const id = req.params.id;

  // Verificar si tiene efectores asignados
  const checkAssignments = 'SELECT COUNT(*) AS cantidad FROM auditor_efector WHERE idUsuario = ?';
  db.query(checkAssignments, [id], (err, result) => {
    if (err) {
      console.error('Error al verificar asignaciones:', err);
      return res.status(500).json({ msg: 'Error al verificar asignaciones' });
    }


    const cantidad = result[0].cantidad;
    if (cantidad > 0) {
      return res.status(400).json({ msg: 'El usuario tiene hospitales asignados' });
    }

    // Si no tiene hospitales asignados, se elimina lógicamente
    Usuario.deleteUser(id, (err, result) => {
      if (err) {
        console.error('Error al eliminar usuario:', err);
        return res.status(500).json({ msg: 'Error al eliminar usuario' });
      }
      res.json({ msg: 'Usuario eliminado correctamente' });
    });
  });
};


const updateUser = (req, res) => {
  const id = req.params.id;
  const { nombre, usuario, idTipoUsuario } = req.body;
  Usuario.updateUser(id, nombre, usuario, parseInt(idTipoUsuario), (err, result) => {
    if (err) return res.status(500).json({ msg: 'Error al actualizar usuario' });
    res.json({ msg: 'Usuario actualizado correctamente' });
  });
};

const login = (req, res) => {
  const { usuario, contraseña } = req.body;

  if (!usuario || !contraseña) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
  }

  Usuario.getUserByUsername(usuario, (err, user) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ msg: 'Error del servidor' });
    }

    if (!user) {
      return res.status(401).json({ msg: 'Credenciales inválidas' });
    }

    console.log('Contraseña ingresada:', contraseña);
    console.log('Hash en base de datos:', user.contraseña);

    // Comparar la contraseña
    bcrypt.compare(contraseña, user.contraseña, (err, isMatch) => {
      if (err) {
        console.error('Error al comparar contraseñas:', err);
        return res.status(500).json({ msg: 'Error al verificar credenciales' });
      }

      if (!isMatch) {
        return res.status(401).json({ msg: 'Credenciales inválidas' });
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          idUsuario: user.idUsuario,
          nombre: user.nombre,
          usuario: user.usuario,
          idTipoUsuario: user.idTipoUsuario
        },
        'tu_secreto_jwt', 
        { expiresIn: '2h' }
      );

      res.json({ msg: 'Login exitoso', token, user });
    });
  });
};

const restoreUser = (req, res) => {
  const id = req.params.id;
  Usuario.restoreUser(id, (err, result) => {
    if (err) return res.status(500).json({ msg: 'Error al restaurar usuario' });
    res.json({ msg: 'Usuario restaurado correctamente' });
  });
};

module.exports = {
  register,
  getAllUsers,
  deleteUser,
  updateUser,
  login,
  restoreUser
};