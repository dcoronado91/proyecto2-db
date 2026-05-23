const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
require('dotenv').config();

// ─────────────────────────────────────────────
// Validación del JWT_SECRET al inicio del proceso.
// Un secret débil o el valor por defecto representan
// una brecha de seguridad crítica: cualquiera podría
// generar tokens válidos con rol admin.
// ─────────────────────────────────────────────
const SECRETO_DEFECTO = 'clave_super_secreta_cambiar_en_produccion';
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('[SEGURIDAD] FATAL: JWT_SECRET no está definido en las variables de entorno.');
  process.exit(1);
}
if (jwtSecret === SECRETO_DEFECTO) {
  console.warn('[SEGURIDAD] ADVERTENCIA: Estás usando el JWT_SECRET por defecto.');
  console.warn('[SEGURIDAD] Genera uno seguro con: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
}
if (jwtSecret.length < 32) {
  console.error('[SEGURIDAD] FATAL: JWT_SECRET demasiado corto (mínimo 32 caracteres). El servidor no arrancará.');
  process.exit(1);
}

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
  res.removeHeader('X-Powered-By');
  next();
});

// ─────────────────────────────────────────────
// Body parsing con límite anti-DoS
// ─────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));

// ─────────────────────────────────────────────
// RATE LIMITING
//
// ¿Por qué es importante?
// Sin límite de intentos, un atacante puede probar
// millones de contraseñas (brute-force) en segundos.
// Con rate limiting, 10 intentos fallidos en 15 min
// hacen el ataque inviable en tiempo práctico.
// ─────────────────────────────────────────────

// Login: máximo 10 intentos por IP cada 15 minutos
const loginLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.' },
  skipSuccessfulRequests: true, // solo cuenta los intentos fallidos
});

// Registro: máximo 5 cuentas nuevas por IP por hora
const registerLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             5,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Demasiadas cuentas creadas desde esta IP. Intenta de nuevo en 1 hora.' },
});

// API general: máximo 200 requests por IP por minuto
const apiLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Demasiadas peticiones. Intenta de nuevo en un momento.' },
});

// ─────────────────────────────────────────────
// Rutas
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rate limiters específicos en auth primero
app.use('/api/auth/login',    loginLimiter);
app.use('/api/auth/register', registerLimiter);

// Rate limiter general para toda la API
app.use('/api', apiLimiter);

app.use('/api/auth',        authRouter);
app.use('/api/categorias',  categoriasRouter);
app.use('/api/proveedores', proveedoresRouter);
app.use('/api/clientes',    clientesRouter);
app.use('/api/empleados',   empleadosRouter);
app.use('/api/productos',   productosRouter);
app.use('/api/ventas',      ventasRouter);
app.use('/api/reportes',    reportesRouter);

// ─────────────────────────────────────────────
// Manejo global de errores
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
