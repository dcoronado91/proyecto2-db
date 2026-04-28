const { Router } = require('express');
const pool = require('../db');

const router = Router();

// JOIN 2: ventas con cliente y empleado (usa la VIEW)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM vista_ventas_completa ORDER BY fecha DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// JOIN 3: detalle de una venta — une detalle_venta con productos y categorias
router.get('/:id', async (req, res) => {
  try {
    const venta = await pool.query(
      'SELECT * FROM vista_ventas_completa WHERE venta_id = $1',
      [req.params.id]
    );
    if (!venta.rows.length) return res.status(404).json({ error: 'No encontrada' });

    const detalle = await pool.query(`
      SELECT
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal,
        p.nombre      AS producto,
        c.nombre      AS categoria
      FROM detalle_venta dv
      JOIN productos  p ON dv.producto_id   = p.id
      JOIN categorias c ON p.categoria_id   = c.id
      WHERE dv.venta_id = $1
      ORDER BY p.nombre
    `, [req.params.id]);

    res.json({ ...venta.rows[0], detalle: detalle.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
