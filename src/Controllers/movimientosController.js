const MovimientoModel = require('../Models/movimientoModel');
const { sendSuccess, sendError } = require('../Utils/responseHelper');

const movimientosController = {
  /**
   * GET /api/articulos/:id/movimientos
   * Obtiene la línea de tiempo (historial) de un artículo
   */
  getByArticulo: async (req, res, next) => {
    try {
      const id_art = parseInt(req.params.id, 10);
      if (isNaN(id_art)) return sendError(res, 'El ID del artículo debe ser un número', 400);

      const movimientos = await MovimientoModel.findByArticulo(id_art);
      sendSuccess(res, movimientos, 'Historial de movimientos obtenido correctamente');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = movimientosController;
