const oracledb          = require('oracledb');
const { getConnection } = require('../Config/db');

class DepartamentoModel {
  /**
   * Retorna todos los departamentos de la tabla DEPARTAMENTOS.
   * @returns {Promise<object[]>}
   */
  static async findAll() {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT ID_DEP, NOM_DEP FROM DEPARTAMENTOS ORDER BY ID_DEP`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Retorna un departamento por su ID.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT ID_DEP, NOM_DEP FROM DEPARTAMENTOS WHERE ID_DEP = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0] || null;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = DepartamentoModel;
