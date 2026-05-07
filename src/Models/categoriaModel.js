const oracledb = require('oracledb');
const { getConnection } = require('../Config/db');

class CategoriaModel {
  /**
   * Retorna todas las categorías de la tabla CATEGORIAS.
   * @returns {Promise<object[]>}
   */
  static async findAll() {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT ID_CAT, NOM_CAT FROM CATEGORIAS ORDER BY ID_CAT`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Retorna una categoría por su ID.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT ID_CAT, NOM_CAT FROM CATEGORIAS WHERE ID_CAT = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0] || null;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = CategoriaModel;
