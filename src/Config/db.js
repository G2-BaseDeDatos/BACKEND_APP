const oracledb = require('oracledb');
require('dotenv').config();

// Thick mode: necesario para Oracle XE 10g/11g (32-bit).
// Requiere Oracle Instant Client 64-bit extraído en C:\instantclient
// Descarga: https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html
try {
  oracledb.initOracleClient({ libDir: 'C:\\instantclient' });
  console.log('🔧 oracledb Thick mode activado (Instant Client 64-bit).');
} catch (err) {
  console.error('❌ No se pudo activar Thick mode:', err.message);
  console.error('   Descarga Oracle Instant Client 64-bit y extráelo en C:\\instantclient');
  console.error('   URL: https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html');
  process.exit(1);
}

// Pool singleton – se inicializa una sola vez en server.js
let pool = null;

/**
 * Crea el pool de conexiones. Se llama UNA SOLA VEZ al arrancar el servidor.
 */
async function initPool() {
  pool = await oracledb.createPool({
    user:             process.env.DB_USER,
    password:         process.env.DB_PASSWORD,
    connectString:    process.env.DB_CONNECT_STRING,
    poolMin:          0,   // No crea conexiones al arrancar (clave para Oracle XE)
    poolMax:          5,   // XE tiene límite bajo; 5 es seguro para desarrollo
    poolIncrement:    1,
    poolTimeout:      60,
  });
  console.log('✅ Pool de conexiones Oracle inicializado.');
}

/**
 * Obtiene una conexión del pool.
 * Los modelos deben llamar connection.close() en su bloque finally.
 * @returns {Promise<oracledb.Connection>}
 */
async function getConnection() {
  if (!pool) throw new Error('El pool de Oracle no ha sido inicializado.');
  return pool.getConnection();
}

/**
 * Cierra el pool de forma limpia (para shutdown graceful).
 */
async function closePool() {
  if (pool) {
    await pool.close(0);
    console.log('🔒 Pool de Oracle cerrado.');
  }
}

module.exports = { initPool, getConnection, closePool };