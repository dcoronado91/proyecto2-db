-- =============================================
-- STORED PROCEDURES: Tienda de Tecnología
-- DBMS: PostgreSQL
-- Archivo: 05_stored_procedures.sql
-- Descripción: Procedimientos y funciones para
--              operaciones críticas del negocio.
-- Ejecutar DESPUÉS de 01_schema.sql
-- =============================================

-- ─────────────────────────────────────────────
-- SP 1: sp_registrar_venta
-- Registra una venta completa con manejo de
-- transacción explícita y ROLLBACK ante errores
-- de stock o datos inválidos.
-- Params INOUT: p_venta_id, p_total, p_error
-- ─────────────────────────────────────────────
CREATE OR REPLACE PROCEDURE sp_registrar_venta(
    p_cliente_id  INT,
    p_empleado_id INT,
    p_items       JSON,
    INOUT p_venta_id INT     DEFAULT 0,
    INOUT p_total    NUMERIC DEFAULT 0,
    INOUT p_error    TEXT    DEFAULT ''
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_item      JSON;
    v_prod_id   INT;
    v_cantidad  INT;
    v_precio    NUMERIC(10,2);
    v_stock     INT;
    v_nombre    TEXT;
    v_subtotal  NUMERIC(12,2);
BEGIN
    p_venta_id := 0;
    p_total    := 0;
    p_error    := '';

    -- Validaciones básicas de entrada
    IF p_cliente_id IS NULL OR p_empleado_id IS NULL THEN
        p_error := 'cliente_id y empleado_id son obligatorios';
        RETURN;
    END IF;

    IF p_items IS NULL OR json_array_length(p_items) = 0 THEN
        p_error := 'Se requiere al menos un producto en la venta';
        RETURN;
    END IF;

    -- Verificar que el cliente existe
    IF NOT EXISTS (SELECT 1 FROM clientes WHERE id = p_cliente_id) THEN
        p_error := 'Cliente ' || p_cliente_id || ' no existe';
        RETURN;
    END IF;

    -- Verificar que el empleado existe
    IF NOT EXISTS (SELECT 1 FROM empleados WHERE id = p_empleado_id) THEN
        p_error := 'Empleado ' || p_empleado_id || ' no existe';
        RETURN;
    END IF;

    -- Insertar cabecera de la venta (total provisional 0)
    INSERT INTO ventas (cliente_id, empleado_id, total)
    VALUES (p_cliente_id, p_empleado_id, 0)
    RETURNING id INTO p_venta_id;

    -- Procesar cada item del JSON
    FOR v_item IN SELECT * FROM json_array_elements(p_items)
    LOOP
        v_prod_id  := (v_item->>'producto_id')::INT;
        v_cantidad := (v_item->>'cantidad')::INT;

        IF v_cantidad <= 0 THEN
            p_error := 'La cantidad debe ser mayor a cero';
            ROLLBACK;
            RETURN;
        END IF;

        -- Bloquear fila para evitar condiciones de carrera
        SELECT precio, stock, nombre
          INTO v_precio, v_stock, v_nombre
          FROM productos
         WHERE id = v_prod_id
           FOR UPDATE;

        IF NOT FOUND THEN
            p_error := 'Producto con id ' || v_prod_id || ' no existe';
            ROLLBACK;
            RETURN;
        END IF;

        IF v_stock < v_cantidad THEN
            p_error := 'Stock insuficiente para "' || v_nombre ||
                       '". Disponible: ' || v_stock ||
                       ', solicitado: ' || v_cantidad;
            ROLLBACK;
            RETURN;
        END IF;

        v_subtotal := v_precio * v_cantidad;
        p_total    := p_total + v_subtotal;

        INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (p_venta_id, v_prod_id, v_cantidad, v_precio, v_subtotal);

        UPDATE productos SET stock = stock - v_cantidad WHERE id = v_prod_id;
    END LOOP;

    -- Actualizar total real de la venta
    UPDATE ventas SET total = p_total WHERE id = p_venta_id;

    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        p_error    := 'Error interno: ' || SQLERRM;
        p_venta_id := 0;
        p_total    := 0;
        ROLLBACK;
END;
$$;


-- ─────────────────────────────────────────────
-- SP 2: sp_actualizar_stock
-- Ajusta el stock de un producto (delta positivo
-- = entrada, negativo = salida).
-- Parámetros IN/OUT + manejo de excepciones.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sp_actualizar_stock(
    p_producto_id  INT,
    p_delta        INT,
    OUT p_stock_nuevo INT,
    OUT p_error       TEXT
)
RETURNS RECORD
LANGUAGE plpgsql
AS $$
DECLARE
    v_nombre TEXT;
BEGIN
    p_error      := '';
    p_stock_nuevo := -1;

    -- Validar que delta no sea cero
    IF p_delta = 0 THEN
        p_error := 'El delta de stock no puede ser cero';
        RETURN;
    END IF;

    -- Verificar existencia del producto
    SELECT nombre INTO v_nombre FROM productos WHERE id = p_producto_id;
    IF NOT FOUND THEN
        p_error := 'Producto con id ' || p_producto_id || ' no existe';
        RETURN;
    END IF;

    -- Aplicar delta y verificar resultado
    UPDATE productos
       SET stock = stock + p_delta
     WHERE id = p_producto_id
    RETURNING stock INTO p_stock_nuevo;

    -- Si el stock resultante es negativo lanzar excepción
    IF p_stock_nuevo < 0 THEN
        RAISE EXCEPTION 'stock_negativo: stock resultante sería %, mínimo es 0', p_stock_nuevo;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        -- Revertir el update dentro de la transacción del llamador
        UPDATE productos SET stock = stock - p_delta WHERE id = p_producto_id;
        p_error       := SQLERRM;
        p_stock_nuevo := -1;
END;
$$;


-- ─────────────────────────────────────────────
-- SP 3: sp_crear_producto
-- Crea un producto validando integridad de datos.
-- Retorna el id generado o un mensaje de error.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sp_crear_producto(
    p_nombre       VARCHAR(200),
    p_descripcion  TEXT,
    p_precio       NUMERIC(10,2),
    p_stock        INT,
    p_categoria_id INT,
    p_proveedor_id INT,
    OUT p_id    INT,
    OUT p_error TEXT
)
RETURNS RECORD
LANGUAGE plpgsql
AS $$
BEGIN
    p_id    := -1;
    p_error := '';

    -- Validaciones de negocio
    IF p_nombre IS NULL OR TRIM(p_nombre) = '' THEN
        p_error := 'El nombre del producto es obligatorio';
        RETURN;
    END IF;

    IF p_precio IS NULL OR p_precio <= 0 THEN
        p_error := 'El precio debe ser mayor a cero';
        RETURN;
    END IF;

    IF p_stock IS NULL OR p_stock < 0 THEN
        p_error := 'El stock no puede ser negativo';
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM categorias WHERE id = p_categoria_id) THEN
        p_error := 'Categoría ' || p_categoria_id || ' no existe';
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM proveedores WHERE id = p_proveedor_id) THEN
        p_error := 'Proveedor ' || p_proveedor_id || ' no existe';
        RETURN;
    END IF;

    INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, proveedor_id)
    VALUES (TRIM(p_nombre), p_descripcion, p_precio, p_stock, p_categoria_id, p_proveedor_id)
    RETURNING id INTO p_id;

EXCEPTION
    WHEN unique_violation THEN
        p_error := 'Ya existe un producto con ese nombre';
        p_id    := -1;
    WHEN OTHERS THEN
        p_error := 'Error al crear producto: ' || SQLERRM;
        p_id    := -1;
END;
$$;


-- ─────────────────────────────────────────────
-- SP 4: sp_eliminar_producto
-- Elimina un producto solo si no tiene ventas
-- asociadas. Retorna indicador de éxito y error.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sp_eliminar_producto(
    p_producto_id INT,
    OUT p_ok    BOOLEAN,
    OUT p_error TEXT
)
RETURNS RECORD
LANGUAGE plpgsql
AS $$
DECLARE
    v_ventas_count INT;
    v_nombre       TEXT;
BEGIN
    p_ok    := FALSE;
    p_error := '';

    -- Verificar existencia
    SELECT nombre INTO v_nombre FROM productos WHERE id = p_producto_id;
    IF NOT FOUND THEN
        p_error := 'Producto con id ' || p_producto_id || ' no existe';
        RETURN;
    END IF;

    -- Verificar que no tenga ventas registradas
    SELECT COUNT(*) INTO v_ventas_count
      FROM detalle_venta
     WHERE producto_id = p_producto_id;

    IF v_ventas_count > 0 THEN
        RAISE EXCEPTION 'integridad: el producto "%" tiene % venta(s) asociada(s) y no puede eliminarse',
            v_nombre, v_ventas_count;
    END IF;

    DELETE FROM productos WHERE id = p_producto_id;
    p_ok := TRUE;

EXCEPTION
    WHEN OTHERS THEN
        p_ok    := FALSE;
        p_error := SQLERRM;
END;
$$;


-- ─────────────────────────────────────────────
-- SP 5: sp_reporte_ventas_periodo
-- Genera un reporte de ventas entre dos fechas,
-- agregando totales por empleado y cliente.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sp_reporte_ventas_periodo(
    p_fecha_inicio DATE,
    p_fecha_fin    DATE
)
RETURNS TABLE (
    venta_id       INT,
    fecha          DATE,
    cliente        TEXT,
    empleado       TEXT,
    total          NUMERIC,
    num_productos  BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_fecha_inicio IS NULL OR p_fecha_fin IS NULL THEN
        RAISE EXCEPTION 'Las fechas de inicio y fin son obligatorias';
    END IF;

    IF p_fecha_inicio > p_fecha_fin THEN
        RAISE EXCEPTION 'La fecha de inicio no puede ser posterior a la fecha de fin';
    END IF;

    RETURN QUERY
    SELECT
        v.id                          AS venta_id,
        v.fecha                       AS fecha,
        c.nombre::TEXT                AS cliente,
        e.nombre::TEXT                AS empleado,
        v.total                       AS total,
        COUNT(dv.producto_id)         AS num_productos
    FROM ventas v
    JOIN clientes  c  ON v.cliente_id  = c.id
    JOIN empleados e  ON v.empleado_id = e.id
    LEFT JOIN detalle_venta dv ON v.id = dv.venta_id
    WHERE v.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY v.id, v.fecha, c.nombre, e.nombre, v.total
    ORDER BY v.fecha DESC;
END;
$$;


-- ─────────────────────────────────────────────
-- SP 6: sp_actualizar_producto
-- Actualiza datos de un producto con validaciones.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sp_actualizar_producto(
    p_id           INT,
    p_nombre       VARCHAR(200),
    p_descripcion  TEXT,
    p_precio       NUMERIC(10,2),
    p_stock        INT,
    p_categoria_id INT,
    p_proveedor_id INT,
    OUT p_ok    BOOLEAN,
    OUT p_error TEXT
)
RETURNS RECORD
LANGUAGE plpgsql
AS $$
BEGIN
    p_ok    := FALSE;
    p_error := '';

    IF p_nombre IS NULL OR TRIM(p_nombre) = '' THEN
        p_error := 'El nombre del producto es obligatorio';
        RETURN;
    END IF;

    IF p_precio IS NULL OR p_precio <= 0 THEN
        p_error := 'El precio debe ser mayor a cero';
        RETURN;
    END IF;

    IF p_stock IS NULL OR p_stock < 0 THEN
        p_error := 'El stock no puede ser negativo';
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM categorias WHERE id = p_categoria_id) THEN
        p_error := 'Categoría ' || p_categoria_id || ' no existe';
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM proveedores WHERE id = p_proveedor_id) THEN
        p_error := 'Proveedor ' || p_proveedor_id || ' no existe';
        RETURN;
    END IF;

    UPDATE productos
       SET nombre       = TRIM(p_nombre),
           descripcion  = p_descripcion,
           precio       = p_precio,
           stock        = p_stock,
           categoria_id = p_categoria_id,
           proveedor_id = p_proveedor_id
     WHERE id = p_id;

    IF NOT FOUND THEN
        p_error := 'Producto con id ' || p_id || ' no existe';
        RETURN;
    END IF;

    p_ok := TRUE;

EXCEPTION
    WHEN OTHERS THEN
        p_ok    := FALSE;
        p_error := 'Error al actualizar: ' || SQLERRM;
END;
$$;
