const { Router } = require('express');
const pool = require('../db');

const router = Router();

// JOIN 2: ventas con cliente y empleado (usa la VIEW)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM vista_ventas_completa ORDER BY fecha DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// JOIN 3: detalle de una venta — une detalle_venta con productos y categorias
router.get('/:id', async (req, res) => {
  try {
    const venta = await pool.query(
      'SELECT * FROM vista_ventas_completa WHERE venta_id = $1',
      [req.params.id]
    );
    if (!venta.rows.length) return res.status(404).json({ error: 'No encontrada' });

    const detalle = await pool.query(`
      SELECT
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal,
        p.nombre      AS producto,
        c.nombre      AS categoria
      FROM detalle_venta dv
      JOIN productos  p ON dv.producto_id   = p.id
      JOIN categorias c ON p.categoria_id   = c.id
      WHERE dv.venta_id = $1
      ORDER BY p.nombre
    `, [req.params.id]);

    res.json({ ...venta.rows[0], detalle: detalle.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TRANSACCIÓN: crea una venta completa con ROLLBACK si hay stock insuficiente
// Body: { cliente_id, empleado_id, items: [{ producto_id, cantidad }] }
router.post('/', async (req, res) => {
  const { cliente_id, empleado_id, items } = req.body;

  if (!cliente_id || !empleado_id || !items?.length) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insertar la venta con total 0 provisional
    const { rows: [venta] } = await client.query(
      `INSERT INTO ventas (cliente_id, empleado_id, total)
      VALUES ($1, $2, 0) RETURNING id`,
      [cliente_id, empleado_id]
    );
    const venta_id = venta.id;
    let total = 0;

    for (const item of items) {
      // Bloquea la fila del producto para evitar condiciones de carrera
      const { rows } = await client.query(
        'SELECT nombre, precio, stock FROM productos WHERE id = $1 FOR UPDATE',
        [item.producto_id]
      );

      if (!rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          rollback: true,
          error: `Producto con id ${item.producto_id} no existe`
        });
      }

      const producto = rows[0];

      if (producto.stock < item.cantidad) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          rollback: true,
          error: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, solicitado: ${item.cantidad}`
        });
      }

      const subtotal = parseFloat(producto.precio) * item.cantidad;
      total += subtotal;

      await client.query(
        `INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5)`,
        [venta_id, item.producto_id, item.cantidad, producto.precio, subtotal]
      );

      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2',
        [item.cantidad, item.producto_id]
      );
    }

    // Actualizar el total real de la venta
    await client.query(
      'UPDATE ventas SET total = $1 WHERE id = $2',
      [total, venta_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      rollback: false,
      venta_id,
      total,
      mensaje: 'Venta registrada correctamente'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ rollback: true, error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
