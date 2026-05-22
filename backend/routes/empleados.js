const { Router } = require('express');
const { param, validationResult } = require('express-validator');
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

const staffRoles = ['admin', 'gerente', 'vendedor', 'cajero', 'bodeguero'];

// GET /api/empleados
router.get('/', auth, authorize(...staffRoles), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM empleados ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/empleados/:id
router.get('/:id',
  auth, authorize(...staffRoles),
  [param('id').isInt({ min: 1 }).withMessage('id inválido').toInt()],
  validarCampos,
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM empleados WHERE id = $1',
        [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Empleado no encontrado' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
