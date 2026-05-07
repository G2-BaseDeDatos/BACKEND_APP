const CategoriaModel             = require('../Models/categoriaModel');
const { sendSuccess, sendError } = require('../Utils/responseHelper');

const categoriasController = {
  /**
   * GET /api/categorias
   * Retorna todas las categorías. Acceso: todos los roles.
   */
  getAll: async (req, res, next) => {
    try {
      const categorias = await CategoriaModel.findAll();
      sendSuccess(res, categorias, 'Categorías obtenidas correctamente');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/categorias/:id
   * Retorna una categoría por ID. Acceso: todos los roles.
   */
  getById: async (req, res, next) => {
    try {
      const id        = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, 'El ID debe ser un número válido', 400);

      const categoria = await CategoriaModel.findById(id);
      if (!categoria) return sendError(res, `Categoría con ID ${id} no encontrada`, 404);

      sendSuccess(res, categoria, 'Categoría obtenida correctamente');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = categoriasController;
