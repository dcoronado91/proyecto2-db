-- =============================================
-- DDL: Tienda de Tecnología
-- DBMS: PostgreSQL
-- Archivo: 01_schema.sql
-- Descripción: Definición completa de tablas,
--              restricciones e índices
-- =============================================

-- Limpiar si ya existen (orden inverso por FK)
DROP TABLE IF EXISTS detalle_venta  CASCADE;
DROP TABLE IF EXISTS ventas         CASCADE;
DROP TABLE IF EXISTS productos      CASCADE;
DROP TABLE IF EXISTS categorias     CASCADE;
DROP TABLE IF EXISTS proveedores    CASCADE;
DROP TABLE IF EXISTS clientes       CASCADE;
DROP TABLE IF EXISTS empleados      CASCADE;
DROP TABLE IF EXISTS usuarios       CASCADE;

-- ─────────────────────────────────────────────
-- CATEGORIAS
-- ─────────────────────────────────────────────
CREATE TABLE categorias (
    id          SERIAL       PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- ─────────────────────────────────────────────
-- PROVEEDORES
-- ─────────────────────────────────────────────
CREATE TABLE proveedores (
    id        SERIAL       PRIMARY KEY,
    nombre    VARCHAR(150) NOT NULL,
    telefono  VARCHAR(20),
    email     VARCHAR(150) UNIQUE,
    direccion TEXT
);

-- ─────────────────────────────────────────────
-- CLIENTES
-- ─────────────────────────────────────────────
CREATE TABLE clientes (
    id        SERIAL       PRIMARY KEY,
    nombre    VARCHAR(150) NOT NULL,
    telefono  VARCHAR(20),
    email     VARCHAR(150) UNIQUE,
    direccion TEXT
);

-- ─────────────────────────────────────────────
-- EMPLEADOS
-- ─────────────────────────────────────────────
CREATE TABLE empleados (
    id        SERIAL       PRIMARY KEY,
    nombre    VARCHAR(150) NOT NULL,
    telefono  VARCHAR(20),
    email     VARCHAR(150) UNIQUE,
    puesto    VARCHAR(100) NOT NULL
);

-- ─────────────────────────────────────────────
-- PRODUCTOS
-- ─────────────────────────────────────────────
CREATE TABLE productos (
    id            SERIAL        PRIMARY KEY,
    nombre        VARCHAR(200)  NOT NULL,
    descripcion   TEXT,
    precio        NUMERIC(10,2) NOT NULL CHECK (precio > 0),
    stock         INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
    categoria_id  INTEGER       NOT NULL,
    proveedor_id  INTEGER       NOT NULL,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    CONSTRAINT fk_producto_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

-- ─────────────────────────────────────────────
-- VENTAS
-- ─────────────────────────────────────────────
CREATE TABLE ventas (
    id           SERIAL        PRIMARY KEY,
    fecha        DATE          NOT NULL DEFAULT CURRENT_DATE,
    cliente_id   INTEGER       NOT NULL,
    empleado_id  INTEGER       NOT NULL,
    total        NUMERIC(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_venta_cliente
        FOREIGN KEY (cliente_id)  REFERENCES clientes(id),
    CONSTRAINT fk_venta_empleado
        FOREIGN KEY (empleado_id) REFERENCES empleados(id)
);

-- ─────────────────────────────────────────────
-- DETALLE_VENTA  (resuelve la relación N:M entre
--                VENTAS y PRODUCTOS)
-- ─────────────────────────────────────────────
CREATE TABLE detalle_venta (
    venta_id        INTEGER       NOT NULL,
    producto_id     INTEGER       NOT NULL,
    cantidad        INTEGER       NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal        NUMERIC(12,2) NOT NULL,
    PRIMARY KEY (venta_id, producto_id),
    CONSTRAINT fk_detalle_venta
        FOREIGN KEY (venta_id)    REFERENCES ventas(id),
    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- ─────────────────────────────────────────────
-- USUARIOS  (autenticación — independiente del
--            modelo de negocio)
-- ─────────────────────────────────────────────
CREATE TABLE usuarios (
    id            SERIAL       PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol           VARCHAR(50)  NOT NULL DEFAULT 'vendedor'
);

-- =============================================
-- ÍNDICES
-- Justificación:
--   idx_ventas_fecha       → reportes filtrados por rango de fechas
--   idx_productos_categoria→ JOINs frecuentes productos ↔ categorias
--   idx_ventas_cliente     → reportes y filtros por cliente
--   idx_detalle_producto   → consultas de productos más vendidos
-- =============================================
CREATE INDEX idx_ventas_fecha        ON ventas(fecha);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_ventas_cliente      ON ventas(cliente_id);
CREATE INDEX idx_detalle_producto    ON detalle_venta(producto_id);
