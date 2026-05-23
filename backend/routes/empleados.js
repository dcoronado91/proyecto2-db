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

// Solo roles que necesitan ver empleados:
// - admin y gerente: gestión y reportes
// - vendedor y cajero: necesitan el listado para asignar empleado_id al crear ventas
// - cliente: necesita el listado para seleccionar vendedor en el carrito
// - bodeguero: NO necesita datos de RRHH
const rolesPermitidos = ['admin', 'gerente', 'vendedor', 'cajero', 'cliente'];

router.get('/', auth, authorize(...rolesPermitidos), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nombre, puesto FROM empleados ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id',
  auth, authorize(...rolesPermitidos),
  [param('id').isInt({ min: 1 }).withMessage('id inválido').toInt()],
  validarCampos,
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT id, nombre, puesto FROM empleados WHERE id = $1',
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
