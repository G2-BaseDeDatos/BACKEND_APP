const AuditoriaModel = require('../Models/auditoriaModel');
const { sendSuccess, sendError } = require('../Utils/responseHelper');

const auditoriasController = {
  /**
   * GET /api/auditorias
   * Lista todos los registros de auditoría (Solo para Administradores)
   */
  getAll: async (req, res, next) => {
    try {
      const logs = await AuditoriaModel.findAll();
      sendSuccess(res, logs, 'Registros de auditoría obtenidos correctamente');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = auditoriasController;
