const DepartamentoModel = require('../Models/departamentoModel');
const { sendSuccess, sendError } = require('../Utils/responseHelper');

const departamentosController = {
  /**
   * GET /api/departamentos
   * Retorna todos los departamentos. Acceso: todos los roles.
   */
  getAll: async (req, res, next) => {
    try {
      const departamentos = await DepartamentoModel.findAll();
      sendSuccess(res, departamentos, 'Departamentos obtenidos correctamente');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/departamentos/:id
   * Retorna un departamento por ID. Acceso: todos los roles.
   */
  getById: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, 'El ID debe ser un número válido', 400);

      const departamento = await DepartamentoModel.findById(id);
      if (!departamento) return sendError(res, `Departamento con ID ${id} no encontrado`, 404);

      sendSuccess(res, departamento, 'Departamento obtenido correctamente');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = departamentosController;
