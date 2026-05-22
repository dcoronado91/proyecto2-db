const { Router } = require('express');
const { body, param, validationResult } = require('express-validator');
const { Categoria } = require('../models');
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

const reglasCategoria = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres')
    .escape(),
  body('descripcion')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede superar 500 caracteres'),
];

const reglasId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El id debe ser un entero positivo')
    .toInt(),
];

// GET /api/categorias — lectura pública
router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.findAll({ order: [['nombre', 'ASC']] });
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categorias/:id
router.get('/:id', reglasId, validarCampos, async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(categoria);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categorias — solo admin y bodeguero
router.post('/',
  auth, authorize('admin', 'bodeguero'),
  reglasCategoria, validarCampos,
  async (req, res) => {
    try {
      const { nombre, descripcion } = req.body;
      const nueva = await Categoria.create({
        nombre,
        descripcion: descripcion || null,
      });
      res.status(201).json(nueva);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/categorias/:id — solo admin y bodeguero
router.put('/:id',
  auth, authorize('admin', 'bodeguero'),
  reglasId, reglasCategoria, validarCampos,
  async (req, res) => {
    try {
      const categoria = await Categoria.findByPk(req.params.id);
      if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });

      const { nombre, descripcion } = req.body;
      await categoria.update({ nombre, descripcion: descripcion || null });
      res.json(categoria);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE /api/categorias/:id — solo admin
router.delete('/:id',
  auth, authorize('admin'),
  reglasId, validarCampos,
  async (req, res) => {
    try {
      const categoria = await Categoria.findByPk(req.params.id);
      if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });

      await categoria.destroy();
      res.json({ mensaje: 'Categoría eliminada', id: req.params.id });
    } catch (err) {
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ error: 'No se puede eliminar: la categoría tiene productos asociados' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
