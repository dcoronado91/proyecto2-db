const { Router } = require('express');
const { query, validationResult } = require('express-validator');
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

const reporteRoles = ['admin', 'gerente'];

// GET /api/reportes/periodo — invoca sp_reporte_ventas_periodo
router.get('/periodo',
  auth, authorize(...reporteRoles),
  [
    query('desde')
      .notEmpty().withMessage('El parámetro "desde" es obligatorio')
      .isISO8601().withMessage('La fecha "desde" debe tener formato YYYY-MM-DD'),
    query('hasta')
      .notEmpty().withMessage('El parámetro "hasta" es obligatorio')
      .isISO8601().withMessage('La fecha "hasta" debe tener formato YYYY-MM-DD'),
  ],
  validarCampos,
  async (req, res) => {
    const { desde, hasta } = req.query;
    try {
      const result = await pool.query(
        'SELECT * FROM sp_reporte_ventas_periodo($1::date, $2::date)',
        [desde, hasta]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/reportes/stock-bajo — subquery: productos bajo el promedio de stock
router.get('/stock-bajo', auth, authorize(...reporteRoles), async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.nombre, p.stock, p.precio, c.nombre AS categoria
        FROM productos p
        JOIN categorias c ON p.categoria_id = c.id
       WHERE p.stock < (SELECT AVG(stock) FROM productos)
       ORDER BY p.stock ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reportes/mejores-clientes — clientes sobre el promedio de gasto
router.get('/mejores-clientes', auth, authorize(...reporteRoles), async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.nombre AS cliente, c.email, SUM(v.total) AS total_compras
        FROM clientes c
        JOIN ventas v ON c.id = v.cliente_id
       GROUP BY c.id, c.nombre, c.email
      HAVING SUM(v.total) > (
        SELECT AVG(suma) FROM (
          SELECT SUM(total) AS suma FROM ventas GROUP BY cliente_id
        ) sub
      )
       ORDER BY total_compras DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reportes/rendimiento-empleados — GROUP BY + HAVING
router.get('/rendimiento-empleados', auth, authorize(...reporteRoles), async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.nombre AS empleado, e.puesto,
             COUNT(v.id) AS num_ventas, SUM(v.total) AS total_vendido
        FROM empleados e
        JOIN ventas v ON e.id = v.empleado_id
       GROUP BY e.id, e.nombre, e.puesto
      HAVING SUM(v.total) > 5000
       ORDER BY total_vendido DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reportes/productos-mas-vendidos — CTE
router.get('/productos-mas-vendidos', auth, authorize(...reporteRoles), async (req, res) => {
  try {
    const { rows } = await pool.query(`
      WITH ventas_por_producto AS (
        SELECT p.id, p.nombre AS producto, cat.nombre AS categoria,
               SUM(dv.cantidad) AS unidades_vendidas,
               SUM(dv.subtotal) AS ingresos_total
          FROM detalle_venta dv
          JOIN productos  p   ON dv.producto_id = p.id
          JOIN categorias cat ON p.categoria_id = cat.id
         GROUP BY p.id, p.nombre, cat.nombre
      )
      SELECT producto, categoria, unidades_vendidas, ingresos_total
        FROM ventas_por_producto
       ORDER BY unidades_vendidas DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
