const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRouter        = require('./routes/auth');
const categoriasRouter  = require('./routes/categorias');
const proveedoresRouter = require('./routes/proveedores');
const clientesRouter    = require('./routes/clientes');
const empleadosRouter   = require('./routes/empleados');
const productosRouter   = require('./routes/productos');
const ventasRouter      = require('./routes/ventas');
const reportesRouter    = require('./routes/reportes');

const app  = express();
const PORT = process.env.PORT || 4000;

// ─────────────────────────────────────────────
// CORS — solo acepta el origen del frontend
// ─────────────────────────────────────────────
const origenesPermitidos = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, server-to-server)
    if (!origin || origenesPermitidos.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origen no permitido — ${origin}`));
    }
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─────────────────────────────────────────────
// Cabeceras de seguridad HTTP
// ─────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  // Evitar filtrado de info del servidor
  res.removeHeader('X-Powered-By');
  next();
});

// ─────────────────────────────────────────────
// Body parsing con límite para prevenir payloads
// maliciosos o ataques de denegación de servicio
// ─────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));

// ─────────────────────────────────────────────
// Rutas
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth',        authRouter);
app.use('/api/categorias',  categoriasRouter);
app.use('/api/proveedores', proveedoresRouter);
app.use('/api/clientes',    clientesRouter);
app.use('/api/empleados',   empleadosRouter);
app.use('/api/productos',   productosRouter);
app.use('/api/ventas',      ventasRouter);
app.use('/api/reportes',    reportesRouter);

// ─────────────────────────────────────────────
// Manejo global de errores (incluye errores CORS)
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message?.startsWith('CORS')) {
    return res.status(403).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Orígenes CORS permitidos: ${origenesPermitidos.join(', ')}`);
});
