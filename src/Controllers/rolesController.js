const RolModel                  = require('../Models/rolModel');
const { sendSuccess, sendError } = require('../Utils/responseHelper');

const rolesController = {
  /**
   * GET /api/roles
   * Retorna todos los roles. Acceso: Docente, Administrador.
   */
  getAll: async (req, res, next) => {
    try {
      const roles = await RolModel.findAll();
      sendSuccess(res, roles, 'Roles obtenidos correctamente');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/roles/:id
   * Retorna un rol por ID. Acceso: Docente, Administrador.
   */
  getById: async (req, res, next) => {
    try {
      const id  = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, 'El ID debe ser un número válido', 400);

      const rol = await RolModel.findById(id);
      if (!rol) return sendError(res, `Rol con ID ${id} no encontrado`, 404);

      sendSuccess(res, rol, 'Rol obtenido correctamente');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = rolesController;
