const { Router } = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = Router();

// GET /api/productos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.categoria_id,
        p.proveedor_id,
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

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.categoria_id,
        p.proveedor_id,
        c.nombre AS categoria,
        pr.nombre AS proveedor
      FROM productos p
      JOIN categorias  c  ON p.categoria_id  = c.id
      JOIN proveedores pr ON p.proveedor_id  = pr.id
      WHERE p.id = $1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/productos
router.post('/', auth, async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria_id, proveedor_id } = req.body;
  if (!nombre || !precio || !categoria_id || !proveedor_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, precio, categoria_id, proveedor_id' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, proveedor_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombre, descripcion || null, precio, stock ?? 0, categoria_id, proveedor_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/productos/:id
router.put('/:id', auth, async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria_id, proveedor_id } = req.body;
  if (!nombre || !precio || !categoria_id || !proveedor_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, precio, categoria_id, proveedor_id' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE productos
       SET nombre=$1, descripcion=$2, precio=$3, stock=$4, categoria_id=$5, proveedor_id=$6
       WHERE id=$7 RETURNING *`,
      [nombre, descripcion || null, precio, stock, categoria_id, proveedor_id, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/productos/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM productos WHERE id=$1 RETURNING id',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado', id: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
