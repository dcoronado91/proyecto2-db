const { Router } = require('express');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const pool       = require('../db');

const router = Router();

// POST /api/auth/register
// Body: { username, password, rol?, nombre?, email? }
// Si rol === 'cliente', crea también un registro en la tabla clientes
router.post('/register', async (req, res) => {
  const { username, password, rol = 'vendedor', nombre, email } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let cliente_id = null;

    if (rol === 'cliente') {
      const { rows: [cli] } = await client.query(
        `INSERT INTO clientes (nombre, email) VALUES ($1, $2) RETURNING id`,
        [nombre || username, email || null]
      );
      cliente_id = cli.id;
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await client.query(
      `INSERT INTO usuarios (username, password_hash, rol, cliente_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, rol, cliente_id`,
      [username, hash, rol, cliente_id]
    );

    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ error: 'Usuario ya existe' });
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
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
      { id: usuario.id, username: usuario.username, rol: usuario.rol, cliente_id: usuario.cliente_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, username: usuario.username, rol: usuario.rol, cliente_id: usuario.cliente_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
