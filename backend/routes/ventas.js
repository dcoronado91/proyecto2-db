const { Router } = require('express');
const { body, param, validationResult } = require('express-validator');
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

// GET /api/ventas — usa la VIEW del proyecto 2
router.get('/', auth, authorize('admin', 'gerente', 'vendedor', 'cajero'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM vista_ventas_completa ORDER BY fecha DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ventas/:id
router.get('/:id',
  auth, authorize('admin', 'gerente', 'vendedor', 'cajero'),
  [param('id').isInt({ min: 1 }).withMessage('id inválido').toInt()],
  validarCampos,
  async (req, res) => {
    try {
      const venta = await pool.query(
        'SELECT * FROM vista_ventas_completa WHERE venta_id = $1',
        [req.params.id]
      );
      if (!venta.rows.length) return res.status(404).json({ error: 'Venta no encontrada' });

      const detalle = await pool.query(`
        SELECT dv.cantidad, dv.precio_unitario, dv.subtotal,
               p.nombre AS producto, c.nombre AS categoria
          FROM detalle_venta dv
          JOIN productos  p ON dv.producto_id = p.id
          JOIN categorias c ON p.categoria_id = c.id
         WHERE dv.venta_id = $1
         ORDER BY p.nombre
      `, [req.params.id]);

      res.json({ ...venta.rows[0], detalle: detalle.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/ventas — invoca sp_registrar_venta (stored procedure con ROLLBACK)
router.post('/',
  auth, authorize('admin', 'gerente', 'vendedor', 'cajero'),
  [
    body('cliente_id')
      .isInt({ min: 1 }).withMessage('cliente_id debe ser un entero positivo')
      .toInt(),
    body('empleado_id')
      .isInt({ min: 1 }).withMessage('empleado_id debe ser un entero positivo')
      .toInt(),
    body('items')
      .isArray({ min: 1 }).withMessage('items debe ser un arreglo con al menos un elemento'),
    body('items.*.producto_id')
      .isInt({ min: 1 }).withMessage('producto_id de cada item debe ser un entero positivo')
      .toInt(),
    body('items.*.cantidad')
      .isInt({ min: 1 }).withMessage('cantidad de cada item debe ser mayor a cero')
      .toInt(),
  ],
  validarCampos,
  async (req, res) => {
    const { cliente_id, empleado_id, items } = req.body;

    try {
      // sp_registrar_venta maneja la transacción con ROLLBACK interno
      const result = await pool.query(
        'CALL sp_registrar_venta($1, $2, $3::json, 0, 0::numeric, \'\')',
        [cliente_id, empleado_id, JSON.stringify(items)]
      );

      const { p_venta_id, p_total, p_error } = result.rows[0];

      if (p_error && p_error.trim() !== '') {
        return res.status(409).json({ rollback: true, error: p_error });
      }

      res.status(201).json({
        rollback:  false,
        venta_id:  Number(p_venta_id),
        total:     Number(p_total),
        mensaje:   'Venta registrada correctamente',
      });
    } catch (err) {
      res.status(500).json({ rollback: true, error: err.message });
    }
  }
);

module.exports = router;
