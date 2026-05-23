const { Router } = require('express');
const { body, param, validationResult } = require('express-validator');
const { Proveedor } = require('../models');
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

const reglasProveedor = [
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
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Teléfono inválido'),
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

// Lectura: admin, gerente y bodeguero
// Vendedor y cajero no necesitan info de proveedores para su trabajo
const lecturaRoles  = ['admin', 'gerente', 'bodeguero'];
const escrituraRoles = ['admin', 'bodeguero'];

router.get('/', auth, authorize(...lecturaRoles), async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({ order: [['nombre', 'ASC']] });
    res.json(proveedores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id',
  auth, authorize(...lecturaRoles),
  reglasId, validarCampos,
  async (req, res) => {
    try {
      const proveedor = await Proveedor.findByPk(req.params.id);
      if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
      res.json(proveedor);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post('/',
  auth, authorize(...escrituraRoles),
  reglasProveedor, validarCampos,
  async (req, res) => {
    try {
      const { nombre, telefono, email, direccion } = req.body;
      const proveedor = await Proveedor.create({
        nombre,
        telefono:  telefono  || null,
        email:     email     || null,
        direccion: direccion || null,
      });
      res.status(201).json(proveedor);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'El email ya está registrado para otro proveedor' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

router.put('/:id',
  auth, authorize(...escrituraRoles),
  reglasId, reglasProveedor, validarCampos,
  async (req, res) => {
    try {
      const proveedor = await Proveedor.findByPk(req.params.id);
      if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });

      const { nombre, telefono, email, direccion } = req.body;
      await proveedor.update({
        nombre,
        telefono:  telefono  || null,
        email:     email     || null,
        direccion: direccion || null,
      });
      res.json(proveedor);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'El email ya está registrado para otro proveedor' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete('/:id',
  auth, authorize('admin'),
  reglasId, validarCampos,
  async (req, res) => {
    try {
      const proveedor = await Proveedor.findByPk(req.params.id);
      if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });

      await proveedor.destroy();
      res.json({ mensaje: 'Proveedor eliminado', id: req.params.id });
    } catch (err) {
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ error: 'No se puede eliminar: el proveedor tiene productos asociados' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
