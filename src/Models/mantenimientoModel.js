const oracledb = require('oracledb');
const { getConnection } = require('../Config/db');
const MovimientoModel = require('./movimientoModel');

class MantenimientoModel {
  /**
   * Registra un nuevo mantenimiento y cambia el estado del equipo a 'Mantenimiento'.
   * Se ejecuta como una transacción para asegurar integridad.
   */
  static async create(id_art, tip_man, fec_man, des_man) {
    let connection;
    try {
      connection = await getConnection();
      // Iniciar transacción manual
      
      // 1. Insertar el registro de mantenimiento
      const resultMan = await connection.execute(
        `INSERT INTO MANTENIMIENTOS (ID_ART, TIP_MAN, FEC_MAN, DES_MAN)
         VALUES (:id_art, :tip_man, TO_DATE(:fec_man, 'YYYY-MM-DD'), :des_man)
         RETURNING ID_MAN INTO :newId`,
        {
          id_art,
          tip_man,
          fec_man,
          des_man,
          newId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        },
        { autoCommit: false }
      );
      
      const newIdMan = resultMan.outBinds.newId[0];

      // 2. Actualizar el estado del artículo
      await connection.execute(
        `UPDATE ARTICULOS SET EST_ART = 'Mantenimiento' WHERE ID_ART = :id_art`,
        { id_art },
        { autoCommit: false }
      );
      // 3. Registrar movimiento
      await MovimientoModel.create(id_art, `Enviado a mantenimiento (${tip_man})`, connection);

      // Confirmar transacción
      await connection.commit();
      return newIdMan;
    } catch (err) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackErr) {
          console.error('Error al hacer rollback de mantenimiento:', rollbackErr);
        }
      }
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Finaliza el mantenimiento cambiando el estado del artículo de vuelta a 'Disponible'.
   * Opcionalmente, se podrían agregar notas técnicas al DES_MAN existente.
   */
  static async finalizar(id_man, id_art, notas_adicionales) {
    let connection;
    try {
      connection = await getConnection();
      
      // Si enviaron notas técnicas de cierre, las concatenamos en DES_MAN
      if (notas_adicionales) {
        await connection.execute(
          `UPDATE MANTENIMIENTOS 
           SET DES_MAN = DES_MAN || ' | CIERRE: ' || :notas 
           WHERE ID_MAN = :id_man`,
          { notas: notas_adicionales, id_man },
          { autoCommit: false }
        );
      }

      // Actualizar el estado del equipo a Disponible
      const result = await connection.execute(
        `UPDATE ARTICULOS SET EST_ART = 'Disponible' WHERE ID_ART = :id_art`,
        { id_art },
        { autoCommit: false }
      );

      // Registrar movimiento
      await MovimientoModel.create(id_art, 'Mantenimiento finalizado', connection);

      await connection.commit();
      return result.rowsAffected;
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Obtiene todos los artículos que están ACTUALMENTE en estado 'Mantenimiento',
   * trayendo la información de su mantenimiento más reciente.
   */
  static async findActivos() {
    let connection;
    try {
      connection = await getConnection();
      const sql = `
        SELECT a.ID_ART, a.COD_ART, a.NOM_ART, a.EST_ART,
               m.ID_MAN, m.TIP_MAN, m.FEC_MAN, m.DES_MAN
        FROM ARTICULOS a
        JOIN MANTENIMIENTOS m ON a.ID_ART = m.ID_ART
        WHERE a.EST_ART = 'Mantenimiento'
          AND m.ID_MAN = (
              SELECT MAX(ID_MAN) 
              FROM MANTENIMIENTOS 
              WHERE ID_ART = a.ID_ART
          )
        ORDER BY m.FEC_MAN DESC
      `;
      const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = MantenimientoModel;
