const { Router } = require('express');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const pool       = require('../db');

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password, rol = 'vendedor' } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (username, password_hash, rol)
       VALUES ($1, $2, $3)
       RETURNING id, username, rol`,
      [username, hash, rol]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Usuario ya existe' });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1',
      [username]
    );
    if (!rows.length) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const usuario = rows[0];
    const valido  = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: usuario.id, username: usuario.username, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, username: usuario.username, rol: usuario.rol });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
