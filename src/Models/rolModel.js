const oracledb      = require('oracledb');
const { getConnection } = require('../Config/db');

class RolModel {
  /**
   * Retorna todos los roles de la tabla ROLES.
   * @returns {Promise<object[]>}
   */
  static async findAll() {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT ID_ROL, NOM_ROL FROM ROLES ORDER BY ID_ROL`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Retorna un rol por su ID.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT ID_ROL, NOM_ROL FROM ROLES WHERE ID_ROL = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0] || null;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = RolModel;
