const { Router } = require('express');
const pool = require('../db');

const router = Router();

// JOIN 1: productos con su categoría y proveedor
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        c.nombre AS categoria,
        pr.nombre AS proveedor
      FROM productos p
      JOIN categorias  c  ON p.categoria_id  = c.id
      JOIN proveedores pr ON p.proveedor_id  = pr.id
      ORDER BY p.nombre
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        c.nombre AS categoria,
        pr.nombre AS proveedor
      FROM productos p
      JOIN categorias  c  ON p.categoria_id  = c.id
      JOIN proveedores pr ON p.proveedor_id  = pr.id
      WHERE p.id = $1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
