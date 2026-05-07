require('dotenv').config();

const app               = require('./app');
const { initPool, closePool } = require('./Config/db');

const PORT = process.env.PORT || 3006;

async function start() {
  try {
    // 1. Inicializar el pool de Oracle ANTES de levantar Express
    await initPool();

    // 2. Levantar el servidor HTTP
    const server = app.listen(PORT, () => {
      console.log(`🚀 Backend GITT corriendo en http://localhost:${PORT}`);
    });

    // 3. Shutdown graceful (Ctrl+C o señal del OS)
    const shutdown = async (signal) => {
      console.log(`\n⚠️  Señal ${signal} recibida. Cerrando servidor...`);
      server.close(async () => {
        await closePool();
        console.log('✅ Servidor cerrado correctamente.');
        process.exit(0);
      });
    };

    process.on('SIGINT',  () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

start();
