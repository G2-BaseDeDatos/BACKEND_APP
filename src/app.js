const express = require('express');
const cors    = require('cors');
const path    = require('path');

const errorHandler = require('./Middlewares/errorHandler');

// ── Rutas (se irán añadiendo conforme se construyan los módulos) ──────────────
const authRoutes           = require('./Routes/authRoutes');
const rolesRoutes          = require('./Routes/rolesRoutes');
const categoriasRoutes     = require('./Routes/categoriasRoutes');
const departamentosRoutes  = require('./Routes/departamentosRoutes');
const ubicacionesRoutes    = require('./Routes/ubicacionesRoutes');
const usuariosRoutes       = require('./Routes/usuariosRoutes');
const articulosRoutes      = require('./Routes/articulosRoutes');
// const imagenesRoutes       = require('./Routes/imagenesRoutes');
const prestamosRoutes      = require('./Routes/prestamosRoutes');
const mantenimientosRoutes = require('./Routes/mantenimientosRoutes');
// const movimientosRoutes    = require('./Routes/movimientosRoutes');
const notificacionesRoutes = require('./Routes/notificacionesRoutes');
const auditoriasRoutes     = require('./Routes/auditoriasRoutes');

const app = express();

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Servir la carpeta public/uploads de forma estática
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ── Rutas de la API ───────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);          // público – sin JWT
app.use('/api/roles',          rolesRoutes);
app.use('/api/categorias',     categoriasRoutes);
app.use('/api/departamentos',  departamentosRoutes);
app.use('/api/ubicaciones',    ubicacionesRoutes);
app.use('/api/usuarios',       usuariosRoutes);
app.use('/api/articulos',      articulosRoutes);
// app.use('/api/imagenes',       imagenesRoutes);
app.use('/api/prestamos',      prestamosRoutes);
app.use('/api/mantenimientos', mantenimientosRoutes);
// app.use('/api/movimientos',    movimientosRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/auditorias',     auditoriasRoutes);

// ── Health check (sin autenticación) ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', timestamp: new Date() },
    message: 'API GITT funcionando correctamente',
  });
});

// ── Ruta no encontrada ────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
});

// ── Error handler global (debe ser el ÚLTIMO middleware) ──────────────────────
app.use(errorHandler);

module.exports = app;