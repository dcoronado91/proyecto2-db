-- =============================================
-- ROLES Y PERMISOS: Tienda de Tecnología
-- DBMS: PostgreSQL
-- Archivo: 04_roles.sql
-- Descripción: Definición de 5 roles con permisos
--              granulares por tabla y operación.
-- Ejecutar DESPUÉS de 01_schema.sql
-- =============================================

-- ─────────────────────────────────────────────
-- Limpiar roles previos (orden: revocar primero)
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_admin')     THEN REVOKE ALL ON ALL TABLES IN SCHEMA public FROM rol_admin;     DROP ROLE rol_admin;     END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_gerente')   THEN REVOKE ALL ON ALL TABLES IN SCHEMA public FROM rol_gerente;   DROP ROLE rol_gerente;   END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_vendedor')  THEN REVOKE ALL ON ALL TABLES IN SCHEMA public FROM rol_vendedor;  DROP ROLE rol_vendedor;  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_bodeguero') THEN REVOKE ALL ON ALL TABLES IN SCHEMA public FROM rol_bodeguero; DROP ROLE rol_bodeguero; END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_cliente')   THEN REVOKE ALL ON ALL TABLES IN SCHEMA public FROM rol_cliente;   DROP ROLE rol_cliente;   END IF;
END $$;

-- ─────────────────────────────────────────────
-- CREACIÓN DE LOS 5 ROLES
-- ─────────────────────────────────────────────
CREATE ROLE rol_admin;
CREATE ROLE rol_gerente;
CREATE ROLE rol_vendedor;
CREATE ROLE rol_bodeguero;
CREATE ROLE rol_cliente;

-- ─────────────────────────────────────────────
-- ROL_ADMIN
-- Acceso total: SELECT, INSERT, UPDATE, DELETE
-- sobre todas las tablas y secuencias.
-- ─────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE
  ON categorias, proveedores, clientes, empleados,
     productos, ventas, detalle_venta, usuarios
  TO rol_admin;

GRANT USAGE, SELECT, UPDATE
  ON ALL SEQUENCES IN SCHEMA public
  TO rol_admin;

-- ─────────────────────────────────────────────
-- ROL_GERENTE
-- Lectura total + gestión de ventas.
-- Sin DELETE en ninguna tabla.
-- ─────────────────────────────────────────────
GRANT SELECT
  ON categorias, proveedores, clientes, empleados,
     productos, ventas, detalle_venta, usuarios
  TO rol_gerente;

GRANT INSERT, UPDATE
  ON ventas, detalle_venta
  TO rol_gerente;

GRANT USAGE, SELECT
  ON ventas_id_seq
  TO rol_gerente;

REVOKE DELETE
  ON categorias, proveedores, clientes, empleados,
     productos, ventas, detalle_venta, usuarios
  FROM rol_gerente;

-- ─────────────────────────────────────────────
-- ROL_VENDEDOR
-- Puede crear ventas y leer catálogo.
-- Sin acceso a empleados ni administración.
-- ─────────────────────────────────────────────
GRANT SELECT
  ON productos, categorias, proveedores, clientes,
     ventas, detalle_venta
  TO rol_vendedor;

GRANT INSERT
  ON ventas, detalle_venta
  TO rol_vendedor;

GRANT UPDATE (stock)
  ON productos
  TO rol_vendedor;

GRANT USAGE, SELECT
  ON ventas_id_seq
  TO rol_vendedor;

REVOKE SELECT, INSERT, UPDATE, DELETE
  ON usuarios, empleados
  FROM rol_vendedor;

-- ─────────────────────────────────────────────
-- ROL_BODEGUERO
-- Gestión de inventario (productos, categorías,
-- proveedores). Sin acceso a ventas ni usuarios.
-- ─────────────────────────────────────────────
GRANT SELECT
  ON productos, categorias, proveedores
  TO rol_bodeguero;

GRANT INSERT, UPDATE
  ON productos, categorias, proveedores
  TO rol_bodeguero;

GRANT DELETE
  ON productos
  TO rol_bodeguero;

GRANT USAGE, SELECT
  ON productos_id_seq, categorias_id_seq, proveedores_id_seq
  TO rol_bodeguero;

REVOKE SELECT, INSERT, UPDATE, DELETE
  ON ventas, detalle_venta, usuarios, clientes, empleados
  FROM rol_bodeguero;

-- ─────────────────────────────────────────────
-- ROL_CLIENTE
-- Solo lectura de catálogo y sus propias ventas.
-- Sin acceso a datos internos del negocio.
-- ─────────────────────────────────────────────
GRANT SELECT
  ON productos, categorias
  TO rol_cliente;

GRANT SELECT
  ON ventas, detalle_venta
  TO rol_cliente;

REVOKE INSERT, UPDATE, DELETE
  ON productos, categorias, ventas, detalle_venta
  FROM rol_cliente;

REVOKE SELECT, INSERT, UPDATE, DELETE
  ON usuarios, empleados, proveedores, clientes
  FROM rol_cliente;

-- ─────────────────────────────────────────────
-- Asignar todos los roles al usuario de la app
-- (proy3 es el usuario que usa el backend)
-- ─────────────────────────────────────────────
GRANT rol_admin     TO proy3;
GRANT rol_gerente   TO proy3;
GRANT rol_vendedor  TO proy3;
GRANT rol_bodeguero TO proy3;
GRANT rol_cliente   TO proy3;
