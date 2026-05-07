const oracledb          = require('oracledb');
const { getConnection } = require('../Config/db');

class UbicacionModel {
  /**
   * Retorna todas las ubicaciones (incluye nombre del departamento via JOIN).
   * @returns {Promise<object[]>}
   */
  static async findAll() {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT u.ID_UBI, u.NOM_UBI, u.ID_DEP, d.NOM_DEP
         FROM UBICACIONES u
         JOIN DEPARTAMENTOS d ON u.ID_DEP = d.ID_DEP
         ORDER BY u.ID_UBI`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Retorna una ubicación por su ID.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT u.ID_UBI, u.NOM_UBI, u.ID_DEP, d.NOM_DEP
         FROM UBICACIONES u
         JOIN DEPARTAMENTOS d ON u.ID_DEP = d.ID_DEP
         WHERE u.ID_UBI = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0] || null;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Retorna todas las ubicaciones de un departamento específico.
   * @param {number} idDep
   * @returns {Promise<object[]>}
   */
  static async findByDepartamento(idDep) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT u.ID_UBI, u.NOM_UBI, u.ID_DEP, d.NOM_DEP
         FROM UBICACIONES u
         JOIN DEPARTAMENTOS d ON u.ID_DEP = d.ID_DEP
         WHERE u.ID_DEP = :idDep
         ORDER BY u.ID_UBI`,
        { idDep },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = UbicacionModel;
