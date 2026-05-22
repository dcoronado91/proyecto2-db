const { Router } = require('express');
const { body, param, validationResult } = require('express-validator');
const { Producto, Categoria, Proveedor } = require('../models');
const pool      = require('../db');
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

const reglasProducto = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 200 }).withMessage('El nombre no puede superar 200 caracteres')
    .escape(),
  body('descripcion')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('La descripción no puede superar 2000 caracteres'),
  body('precio')
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a cero')
    .toFloat(),
  body('stock')
    .isInt({ min: 0 }).withMessage('El stock no puede ser negativo')
    .toInt(),
  body('categoria_id')
    .isInt({ min: 1 }).withMessage('categoria_id debe ser un entero positivo')
    .toInt(),
  body('proveedor_id')
    .isInt({ min: 1 }).withMessage('proveedor_id debe ser un entero positivo')
    .toInt(),
];

const reglasId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El id debe ser un entero positivo')
    .toInt(),
];

// GET /api/productos — Sequelize con asociaciones (ORM)
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: [
        { model: Categoria, as: 'categoria', attributes: ['nombre'] },
        { model: Proveedor,  as: 'proveedor',  attributes: ['nombre'] },
      ],
      order: [['nombre', 'ASC']],
    });

    const data = productos.map(p => ({
      id:           p.id,
      nombre:       p.nombre,
      descripcion:  p.descripcion,
      precio:       p.precio,
      stock:        p.stock,
      categoria_id: p.categoria_id,
      proveedor_id: p.proveedor_id,
      categoria:    p.categoria?.nombre,
      proveedor:    p.proveedor?.nombre,
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/productos/:id — Sequelize (ORM)
router.get('/:id', reglasId, validarCampos, async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, {
      include: [
        { model: Categoria, as: 'categoria', attributes: ['nombre'] },
        { model: Proveedor,  as: 'proveedor',  attributes: ['nombre'] },
      ],
    });

    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({
      id:           producto.id,
      nombre:       producto.nombre,
      descripcion:  producto.descripcion,
      precio:       producto.precio,
      stock:        producto.stock,
      categoria_id: producto.categoria_id,
      proveedor_id: producto.proveedor_id,
      categoria:    producto.categoria?.nombre,
      proveedor:    producto.proveedor?.nombre,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/productos — invoca sp_crear_producto
router.post('/',
  auth, authorize('admin', 'bodeguero'),
  reglasProducto, validarCampos,
  async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria_id, proveedor_id } = req.body;
    try {
      const result = await pool.query(
        'SELECT p_id, p_error FROM sp_crear_producto($1, $2, $3, $4, $5, $6)',
        [nombre, descripcion || null, precio, stock, categoria_id, proveedor_id]
      );

      const { p_id, p_error } = result.rows[0];
      if (p_error && p_error.trim() !== '') {
        return res.status(400).json({ error: p_error });
      }

      res.status(201).json({ id: Number(p_id), mensaje: 'Producto creado correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/productos/:id — invoca sp_actualizar_producto
router.put('/:id',
  auth, authorize('admin', 'bodeguero'),
  reglasId, reglasProducto, validarCampos,
  async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria_id, proveedor_id } = req.body;
    try {
      const result = await pool.query(
        'SELECT p_ok, p_error FROM sp_actualizar_producto($1, $2, $3, $4, $5, $6, $7)',
        [req.params.id, nombre, descripcion || null, precio, stock, categoria_id, proveedor_id]
      );

      const { p_ok, p_error } = result.rows[0];
      if (!p_ok) {
        const status = p_error.includes('no existe') ? 404 : 400;
        return res.status(status).json({ error: p_error });
      }

      res.json({ mensaje: 'Producto actualizado correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PATCH /api/productos/:id/stock — invoca sp_actualizar_stock (IN/OUT + excepciones)
router.patch('/:id/stock',
  auth, authorize('admin', 'bodeguero'),
  [
    param('id').isInt({ min: 1 }).withMessage('id inválido').toInt(),
    body('delta')
      .isInt().withMessage('delta debe ser un entero (positivo = entrada, negativo = salida)')
      .toInt(),
  ],
  validarCampos,
  async (req, res) => {
    const { delta } = req.body;
    try {
      const result = await pool.query(
        'SELECT p_stock_nuevo, p_error FROM sp_actualizar_stock($1, $2)',
        [req.params.id, delta]
      );

      const { p_stock_nuevo, p_error } = result.rows[0];
      if (p_error && p_error.trim() !== '') {
        return res.status(400).json({ error: p_error });
      }

      res.json({ stock_nuevo: Number(p_stock_nuevo), mensaje: 'Stock actualizado correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE /api/productos/:id — invoca sp_eliminar_producto
router.delete('/:id',
  auth, authorize('admin'),
  reglasId, validarCampos,
  async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT p_ok, p_error FROM sp_eliminar_producto($1)',
        [req.params.id]
      );

      const { p_ok, p_error } = result.rows[0];
      if (!p_ok) {
        const status = p_error.includes('no existe') ? 404 : 409;
        return res.status(status).json({ error: p_error });
      }

      res.json({ mensaje: 'Producto eliminado', id: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
