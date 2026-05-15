const { Router } = require('express');
const pool = require('../db');

const router = Router();

// GET /api/clientes
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM clientes ORDER BY nombre'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM clientes WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clientes
router.post('/', async (req, res) => {
  const { nombre, telefono, email, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO clientes (nombre, telefono, email, direccion)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, telefono || null, email || null, direccion || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'El email ya está registrado' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
  const { nombre, telefono, email, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    const { rows } = await pool.query(
      `UPDATE clientes
       SET nombre=$1, telefono=$2, email=$3, direccion=$4
       WHERE id=$5 RETURNING *`,
      [nombre, telefono || null, email || null, direccion || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'El email ya está registrado' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM clientes WHERE id=$1 RETURNING id',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ mensaje: 'Cliente eliminado', id: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
