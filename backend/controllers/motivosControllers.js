const motivos = require('../models/motivosModels');

exports.listarMotivos = (req, res) => {
    motivos.getAll((err, data) => {
        if (err) {
            res.status(500).send('Error al obtener los motivos');
        } else {
            res.json(data);
        }
    });
};

exports.obtenerMotivoPorId = (req, res) => {
    const id = req.params.id;
    motivos.getById(id, (err, data) => {
        if (err) {
            res.status(500).send('Error al obtener el motivo');
        } else if (data.length === 0) {
            res.status(404).send('Motivo no encontrado');
        } else {
            res.json(data[0]);
        }
    });
};

exports.agregarMotivo = (req, res) => {
    const { motivo } = req.body;
    console.log(motivo);  // Imprime el motivo que recibes
    motivos.addMotivo({ motivo }, (err, result) => {
        if (err) {
            res.status(500).send('Error al agregar el motivo');
        } else {
            res.status(201).json(result);
        }
    });
};

exports.editarMotivo = (req, res) => {
    const { motivo } = req.body;
    const id = req.params.id;
    motivos.updateMotivo(id, { motivo }, (err, result) => {
        if (err) {
            res.status(500).send('Error al editar el motivo');
        } else {
            res.status(200).json(result);
        }
    });
};
