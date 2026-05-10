const MantenimientoModel = require('../Models/mantenimientoModel');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const { validationResult } = require('express-validator');

const mantenimientosController = {
  create: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    try {
      const { id_art, tip_man, fec_man, des_man } = req.body;

      const newId = await MantenimientoModel.create(id_art, tip_man, fec_man, des_man);

      sendSuccess(res, { id_man: newId }, 'Mantenimiento registrado y equipo marcado como En Reparación', 201);
    } catch (err) {
      next(err);
    }
  },

  finalizar: async (req, res, next) => {
    try {
      const id_man = parseInt(req.params.id, 10);
      const { id_art, notas_adicionales } = req.body;

      if (isNaN(id_man)) return sendError(res, 'ID de mantenimiento inválido', 400);
      if (!id_art) return sendError(res, 'Debe proporcionar el id_art', 400);

      const affectedRows = await MantenimientoModel.finalizar(id_man, id_art, notas_adicionales);

      if (affectedRows === 0) {
        return sendError(res, 'No se pudo finalizar. Verifique los IDs.', 404);
      }

      sendSuccess(res, null, 'Mantenimiento finalizado. El equipo ahora está Disponible nuevamente.');
    } catch (err) {
      next(err);
    }
  },

  getActivos: async (req, res, next) => {
    try {
      const mantenimientos = await MantenimientoModel.findActivos();
      sendSuccess(res, mantenimientos, 'Lista de equipos en mantenimiento obtenida');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = mantenimientosController;
