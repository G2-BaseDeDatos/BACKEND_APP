const PrestamoModel = require('../Models/prestamoModel');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const { validationResult } = require('express-validator');

const prestamosController = {
  create: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    try {
      const { id_usu, fsa_pre, fpr_pre, articulos_ids } = req.body;

      const newId = await PrestamoModel.create(id_usu, fsa_pre, fpr_pre, articulos_ids);

      sendSuccess(res, { id_pre: newId }, 'Préstamo creado exitosamente', 201);
    } catch (err) {
      // Capturar error ORA-20001: Trigger advierte que el artículo ya está prestado
      if (err.message && err.message.includes('ORA-20001')) {
        return sendError(res, 'Uno o más de los artículos seleccionados ya se encuentran en un préstamo activo o no están disponibles.', 400);
      }
      next(err);
    }
  },

  devolucion: async (req, res, next) => {
    try {
      const { id } = req.params;
      const affectedRows = await PrestamoModel.devolver(id);

      if (affectedRows === 0) {
        return sendError(res, 'Préstamo no encontrado', 404);
      }

      sendSuccess(res, null, 'Devolución registrada exitosamente. Los artículos ahora están marcados como Disponibles.');
    } catch (err) {
      next(err);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const prestamos = await PrestamoModel.findAll();
      sendSuccess(res, prestamos);
    } catch (err) {
      next(err);
    }
  },

  getMisPrestamos: async (req, res, next) => {
    try {
      // Obtenemos el ID del usuario directamente desde el Token JWT
      const id_usu = req.usuario.id_usu;
      const prestamos = await PrestamoModel.findByUsuario(id_usu);
      sendSuccess(res, prestamos);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = prestamosController;
