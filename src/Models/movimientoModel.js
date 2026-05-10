const oracledb = require('oracledb');
const { getConnection } = require('../Config/db');

class MovimientoModel {
  /**
   * Registra un nuevo movimiento en el historial de un artículo.
   * IMPORTANTE: No hace commit por sí solo para permitir que sea parte de otras transacciones.
   * Si 'connection' se pasa como parámetro, usa esa conexión. Si no, obtiene una y hace commit.
   */
  static async create(id_art, mot_mov, existingConnection = null) {
    let connection = existingConnection;
    let ownConnection = false;
    
    try {
      if (!connection) {
        connection = await getConnection();
        ownConnection = true;
      }

      await connection.execute(
        `INSERT INTO MOVIMIENTOS (ID_ART, FEC_MOV, MOT_MOV)
         VALUES (:id_art, SYSDATE, :mot_mov)`,
        { id_art, mot_mov },
        { autoCommit: ownConnection }
      );

    } finally {
      if (ownConnection && connection) {
        await connection.close();
      }
    }
  }

  /**
   * Obtiene todos los movimientos de un artículo específico, ordenados del más reciente al más antiguo.
   */
  static async findByArticulo(id_art) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT ID_MOV, ID_ART, FEC_MOV, MOT_MOV
         FROM MOVIMIENTOS
         WHERE ID_ART = :id_art
         ORDER BY FEC_MOV DESC, ID_MOV DESC`,
        { id_art },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = MovimientoModel;
