const oracledb = require('oracledb');
const { getConnection } = require('../Config/db');

class AuditoriaModel {
  /**
   * Registra una acción en la tabla de auditorías.
   */
  static async create(id_usu, accion, existingConnection = null) {
    let connection = existingConnection;
    let ownConnection = false;
    
    try {
      if (!connection) {
        connection = await getConnection();
        ownConnection = true;
      }

      await connection.execute(
        `INSERT INTO AUDITORIAS (ID_USU, ACC_AUD, FEC_AUD)
         VALUES (:id_usu, :accion, SYSDATE)`,
        { id_usu, accion },
        { autoCommit: ownConnection }
      );

    } catch (err) {
      console.error('Error al registrar auditoría:', err);
      // No lanzamos el error para no romper el flujo principal por culpa de la auditoría
    } finally {
      if (ownConnection && connection) {
        try { await connection.close(); } catch(e) {}
      }
    }
  }

  /**
   * Obtiene el registro histórico de todas las auditorías, con los datos del usuario.
   */
  static async findAll() {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT a.ID_AUD, a.ACC_AUD, a.FEC_AUD,
                u.ID_USU, u.NOM_USU, u.COR_USU, r.NOM_ROL
         FROM AUDITORIAS a
         JOIN USUARIOS u ON a.ID_USU = u.ID_USU
         JOIN ROLES r ON u.ID_ROL = r.ID_ROL
         ORDER BY a.FEC_AUD DESC, a.ID_AUD DESC`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = AuditoriaModel;
