const {Cierre} = require('../models/cierreModels');

const crearCierreConDetalle = (idEfector, periodo, idUsuario) => {
  return new Promise((resolve, reject) => {
   Cierre.crearCierre(idEfector, periodo, idUsuario, (err, idCierre) => {
    if (err) return reject(err);

    Cierre.guardarDetalle(idCierre, idEfector, periodo, (err2, result) => {
      if (err2) return reject(err2);

      resolve({ idCierre });
    });
  });
  });
};

const listarCierres = (callback) => {
  Cierre.listarCierres(callback);
};

module.exports = { crearCierreConDetalle, listarCierres};