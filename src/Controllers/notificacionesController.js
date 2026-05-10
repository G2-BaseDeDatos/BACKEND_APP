const NotificacionModel = require('../Models/notificacionModel');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const { validationResult } = require('express-validator');

const notificacionesController = {
  getMisNotificaciones: async (req, res, next) => {
    try {
      // Obtenemos el ID del usuario desde el token JWT decodificado en req.usuario
      const id_usu = req.usuario.id_usu;
      
      const notificaciones = await NotificacionModel.findByUsuario(id_usu);
      sendSuccess(res, notificaciones, 'Notificaciones obtenidas correctamente');
    } catch (err) {
      next(err);
    }
  },

  marcarComoLeida: async (req, res, next) => {
    try {
      const id_not = parseInt(req.params.id, 10);
      if (isNaN(id_not)) return sendError(res, 'ID de notificación inválido', 400);

      const affectedRows = await NotificacionModel.marcarLeida(id_not);
      if (affectedRows === 0) {
        return sendError(res, 'Notificación no encontrada o no se pudo actualizar', 404);
      }

      sendSuccess(res, { id_not }, 'Notificación marcada como leída');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = notificacionesController;
