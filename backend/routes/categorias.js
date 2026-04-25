const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM categorias ORDER BY nombre'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM categorias WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
