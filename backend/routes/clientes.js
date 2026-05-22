const { Router } = require('express');
const { body, param, validationResult } = require('express-validator');
const { Cliente } = require('../models');
const auth      = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = Router();

const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};

const reglasCliente = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 150 }).withMessage('El nombre no puede superar 150 caracteres')
    .escape(),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail().withMessage('El email no tiene un formato válido')
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage('El email no puede superar 150 caracteres'),
  body('telefono')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('El teléfono no puede superar 20 caracteres')
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('El teléfono solo puede contener dígitos y caracteres +, -, (, )'),
  body('direccion')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('La dirección no puede superar 500 caracteres'),
];

const reglasId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El id debe ser un entero positivo')
    .toInt(),
];

const staffRoles = ['admin', 'gerente', 'vendedor', 'cajero'];

// GET /api/clientes
router.get('/', auth, authorize(...staffRoles), async (req, res) => {
  try {
    const clientes = await Cliente.findAll({ order: [['nombre', 'ASC']] });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clientes/:id
router.get('/:id',
  auth, authorize(...staffRoles),
  reglasId, validarCampos,
  async (req, res) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
      res.json(cliente);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/clientes
router.post('/',
  auth, authorize('admin', 'gerente'),
  reglasCliente, validarCampos,
  async (req, res) => {
    try {
      const { nombre, telefono, email, direccion } = req.body;
      const cliente = await Cliente.create({
        nombre,
        telefono: telefono || null,
        email:    email    || null,
        direccion: direccion || null,
      });
      res.status(201).json(cliente);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/clientes/:id
router.put('/:id',
  auth, authorize('admin', 'gerente'),
  reglasId, reglasCliente, validarCampos,
  async (req, res) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

      const { nombre, telefono, email, direccion } = req.body;
      await cliente.update({
        nombre,
        telefono:  telefono  || null,
        email:     email     || null,
        direccion: direccion || null,
      });
      res.json(cliente);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE /api/clientes/:id
router.delete('/:id',
  auth, authorize('admin'),
  reglasId, validarCampos,
  async (req, res) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

      await cliente.destroy();
      res.json({ mensaje: 'Cliente eliminado', id: req.params.id });
    } catch (err) {
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ error: 'No se puede eliminar: el cliente tiene ventas registradas' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
