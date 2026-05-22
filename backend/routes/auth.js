const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../db');

const router = Router();

const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};

const ROLES_VALIDOS = ['admin', 'gerente', 'vendedor', 'cajero', 'bodeguero', 'cliente'];

// POST /api/auth/register
router.post('/register',
  [
    body('username')
      .trim()
      .notEmpty().withMessage('El username es obligatorio')
      .isLength({ min: 3, max: 50 }).withMessage('El username debe tener entre 3 y 50 caracteres')
      .matches(/^[a-zA-Z0-9_.\-]+$/).withMessage('El username solo puede contener letras, números, _, . y -')
      .escape(),
    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('rol')
      .optional()
      .trim()
      .isIn(ROLES_VALIDOS).withMessage(`El rol debe ser uno de: ${ROLES_VALIDOS.join(', ')}`),
    body('nombre')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 150 }).withMessage('El nombre no puede superar 150 caracteres')
      .escape(),
    body('email')
      .optional({ checkFalsy: true })
      .trim()
      .isEmail().withMessage('El email no tiene un formato válido')
      .normalizeEmail()
      .isLength({ max: 150 }).withMessage('El email no puede superar 150 caracteres'),
  ],
  validarCampos,
  async (req, res) => {
    const { username, password, rol = 'vendedor', nombre, email } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let cliente_id = null;

      if (rol === 'cliente') {
        const { rows: [cli] } = await client.query(
          'INSERT INTO clientes (nombre, email) VALUES ($1, $2) RETURNING id',
          [nombre || username, email || null]
        );
        cliente_id = cli.id;
      }

      const hash = await bcrypt.hash(password, 10);
      const { rows } = await client.query(
        `INSERT INTO usuarios (username, password_hash, rol, cliente_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, username, rol, cliente_id`,
        [username, hash, rol, cliente_id]
      );

      await client.query('COMMIT');
      res.status(201).json(rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.code === '23505') return res.status(409).json({ error: 'El usuario ya existe' });
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  }
);

// POST /api/auth/login
router.post('/login',
  [
    body('username')
      .trim()
      .notEmpty().withMessage('El username es obligatorio')
      .isLength({ max: 100 }).withMessage('Username demasiado largo')
      .escape(),
    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria')
      .isLength({ max: 200 }).withMessage('Contraseña demasiado larga'),
  ],
  validarCampos,
  async (req, res) => {
    const { username, password } = req.body;
    try {
      const { rows } = await pool.query(
        'SELECT * FROM usuarios WHERE username = $1',
        [username]
      );

      // Respuesta genérica para no revelar si el usuario existe
      if (!rows.length) {
        await bcrypt.hash(password, 10); // timing-safe: evita enumeración de usuarios
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      const usuario = rows[0];
      const valido  = await bcrypt.compare(password, usuario.password_hash);
      if (!valido) return res.status(401).json({ error: 'Credenciales incorrectas' });

      const token = jwt.sign(
        { id: usuario.id, username: usuario.username, rol: usuario.rol, cliente_id: usuario.cliente_id },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        token,
        username:   usuario.username,
        rol:        usuario.rol,
        cliente_id: usuario.cliente_id,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
