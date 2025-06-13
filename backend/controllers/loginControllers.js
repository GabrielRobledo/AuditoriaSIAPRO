const loginModels = require ('../models/loginModels');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Login = (req, res) => {
  const { user, pass } = req.body;

  loginModels.usuarioEmail(user, async (err, userFromDB) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!userFromDB || !userFromDB.contraseña) {
      return res.status(401).json({ message: 'El usuario no existe o no tiene contraseña.' });
    }

    const isMatch = await bcrypt.compare(pass, userFromDB.contraseña);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta!!' });

    const token = jwt.sign({ id: userFromDB.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
};

module.exports = {Login};