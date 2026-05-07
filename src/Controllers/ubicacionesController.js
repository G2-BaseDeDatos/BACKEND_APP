const UbicacionModel             = require('../Models/ubicacionModel');
const { sendSuccess, sendError } = require('../Utils/responseHelper');

const ubicacionesController = {
  /**
   * GET /api/ubicaciones
   * Retorna todas las ubicaciones con su departamento. Acceso: todos.
   */
  getAll: async (req, res, next) => {
    try {
      const ubicaciones = await UbicacionModel.findAll();
      sendSuccess(res, ubicaciones, 'Ubicaciones obtenidas correctamente');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/ubicaciones/:id
   * Retorna una ubicación por ID. Acceso: todos.
   */
  getById: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, 'El ID debe ser un número válido', 400);

      const ubicacion = await UbicacionModel.findById(id);
      if (!ubicacion) return sendError(res, `Ubicación con ID ${id} no encontrada`, 404);

      sendSuccess(res, ubicacion, 'Ubicación obtenida correctamente');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/ubicaciones/departamento/:idDep
   * Retorna todas las ubicaciones de un departamento. Acceso: todos.
   */
  getByDepartamento: async (req, res, next) => {
    try {
      const idDep = parseInt(req.params.idDep, 10);
      if (isNaN(idDep)) return sendError(res, 'El ID de departamento debe ser un número válido', 400);

      const ubicaciones = await UbicacionModel.findByDepartamento(idDep);
      sendSuccess(res, ubicaciones, `Ubicaciones del departamento ${idDep} obtenidas correctamente`);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ubicacionesController;
