const { Router } = require('express');
const pool = require('../db');

const router = Router();

// SUBQUERY 1: productos con stock menor al promedio general
router.get('/stock-bajo', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.nombre,
        p.stock,
        p.precio,
        c.nombre AS categoria
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

// SUBQUERY 2: clientes que han gastado más que el promedio de todos los clientes
router.get('/mejores-clientes', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        c.nombre   AS cliente,
        c.email,
        SUM(v.total) AS total_compras
      FROM clientes c
      JOIN ventas v ON c.id = v.cliente_id
      GROUP BY c.id, c.nombre, c.email
      HAVING SUM(v.total) > (
        SELECT AVG(suma)
        FROM (
          SELECT SUM(total) AS suma
          FROM ventas
          GROUP BY cliente_id
        ) sub
      )
      ORDER BY total_compras DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GROUP BY + HAVING: empleados con total vendido mayor a 5000
router.get('/rendimiento-empleados', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        e.nombre       AS empleado,
        e.puesto,
        COUNT(v.id)    AS num_ventas,
        SUM(v.total)   AS total_vendido
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

// CTE: ranking de productos más vendidos (unidades e ingresos)
router.get('/productos-mas-vendidos', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      WITH ventas_por_producto AS (
        SELECT
          p.id,
          p.nombre            AS producto,
          cat.nombre          AS categoria,
          SUM(dv.cantidad)    AS unidades_vendidas,
          SUM(dv.subtotal)    AS ingresos_total
        FROM detalle_venta dv
        JOIN productos  p   ON dv.producto_id  = p.id
        JOIN categorias cat ON p.categoria_id  = cat.id
        GROUP BY p.id, p.nombre, cat.nombre
      )
      SELECT
        producto,
        categoria,
        unidades_vendidas,
        ingresos_total
      FROM ventas_por_producto
      ORDER BY unidades_vendidas DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
