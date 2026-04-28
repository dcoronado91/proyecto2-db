-- =============================================
-- VIEW: vista_ventas_completa
-- Muestra cada venta con datos de cliente y
-- empleado resueltos mediante JOINs.
-- Uso: SELECT * FROM vista_ventas_completa
-- =============================================

CREATE OR REPLACE VIEW vista_ventas_completa AS
SELECT
  v.id          AS venta_id,
  v.fecha,
  v.total,
  c.id          AS cliente_id,
  c.nombre      AS cliente,
  c.email       AS cliente_email,
  e.id          AS empleado_id,
  e.nombre      AS empleado,
  e.puesto
FROM ventas v
JOIN clientes  c ON v.cliente_id  = c.id
JOIN empleados e ON v.empleado_id = e.id;
