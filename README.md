## Información del estudiante

- **Nombre:** Derek Friedhelm Coronado Chilin  
- **Carnet:** 24732  
- **Curso:** CC3088 - Bases de Datos 1  
- **Sección:** 10  

# Tienda Tech — Sistema de Gestión

Sistema de gestión para una tienda de tecnología construido como proyecto universitario. Cubre el ciclo completo: autenticación con roles, catálogo de productos, registro de ventas con transacciones y ROLLBACK visible, reportes SQL avanzados y portal de compra para clientes.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Base de datos | PostgreSQL 15 |
| Backend | Node.js 22 + Express |
| Frontend | React 19 + Vite 6 |
| Estilos | Tailwind CSS v4 + CSS Variables |
| Auth | JWT + bcryptjs |
| Contenedores | Docker + Docker Compose |

---

## Levantar el proyecto

### Requisitos previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo

### Primera vez (o después de cambios en el esquema)

```bash
docker compose down -v
docker compose up
```

El flag `-v` elimina el volumen de la base de datos para que los scripts SQL se ejecuten desde cero. Esperar a que los tres contenedores estén `healthy`.

### Ejecuciones posteriores (sin cambios de esquema)

```bash
docker compose up
```

### Servicios disponibles

| Servicio | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| Backend (API REST) | http://localhost:4000 |
| Base de datos | localhost:5432 |

---

## Crear usuarios de prueba

La base de datos incluye datos semilla (clientes, empleados, productos, ventas). Los usuarios deben crearse manualmente mediante el endpoint de registro o desde el frontend.

**Desde el frontend:** ir a `http://localhost:5173/register` para crear una cuenta de cliente.

**Desde Postman / curl** (para roles de staff):

```json
POST http://localhost:4000/api/auth/register

{ "username": "derek",     "password": "1234", "rol": "admin"   }
{ "username": "vendedor1", "password": "1234", "rol": "vendedor" }
{ "username": "gerente1",  "password": "1234", "rol": "gerente"  }
```

### Roles y permisos

| Rol | Dashboard | Productos | Detalle | Ventas | Reportes |
|---|:---:|:---:|:---:|:---:|:---:|
| `admin` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `gerente` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `vendedor` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `cajero` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `cliente` | ✓ | ✓ | ✓ (comprar) | — | — |

---

## Estructura del proyecto

```
proyecto2/
├── docker-compose.yml
├── db/
│   ├── 01_schema.sql       # Definición de tablas e índices
│   ├── 02_seed.sql         # Datos de prueba (30 productos, 25 clientes, etc.)
│   └── 03_views.sql        # Vista vista_ventas_completa
├── backend/
│   ├── server.js           # Entry point Express
│   ├── db.js               # Pool de conexión PostgreSQL
│   ├── middleware/
│   │   └── auth.js         # Verificación JWT
│   └── routes/
│       ├── auth.js         # POST /register, POST /login
│       ├── productos.js    # GET /productos, GET /productos/:id
│       ├── clientes.js     # GET /clientes
│       ├── empleados.js    # GET /empleados
│       ├── ventas.js       # GET /ventas, POST /ventas (transacción)
│       └── reportes.js     # 4 endpoints de reportes SQL
└── frontend/
    └── src/
        ├── api/axios.js        # Cliente HTTP con interceptor JWT
        ├── components/
        │   └── Navbar.jsx
        ├── data/
        │   └── imagenes.js     # Mapa de URLs de imágenes por producto ID
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Productos.jsx   # Grid de cards con imágenes
            ├── Producto.jsx    # Detalle + compra para clientes
            ├── Ventas.jsx      # Formulario de venta + historial
            └── Reportes.jsx    # 4 paneles de reportes
```

---

## Modelo de base de datos

```
categorias ──┐
             ├── productos ──┐
proveedores ─┘               │
                             ├── detalle_venta
clientes ──┐                 │
           ├── ventas ───────┘
empleados ─┘

usuarios (id, username, password_hash, rol, cliente_id → clientes)
```

**Tablas:** `categorias`, `proveedores`, `clientes`, `empleados`, `productos`, `ventas`, `detalle_venta`, `usuarios`

---

## Cumplimiento del rubric SQL

### JOIN 1 — Productos con categoría y proveedor
```sql
SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
FROM productos p
JOIN categorias  c  ON p.categoria_id = c.id
JOIN proveedores pr ON p.proveedor_id = pr.id
```
*Archivo:* `backend/routes/productos.js`

---

### JOIN 2 — Historial de ventas (usa la VIEW)
```sql
SELECT * FROM vista_ventas_completa ORDER BY fecha DESC
```
*Archivo:* `backend/routes/ventas.js`

---

### JOIN 3 — Detalle de una venta con productos y categorías
```sql
SELECT dv.cantidad, dv.precio_unitario, dv.subtotal,
       p.nombre AS producto, c.nombre AS categoria
FROM detalle_venta dv
JOIN productos  p ON dv.producto_id = p.id
JOIN categorias c ON p.categoria_id = c.id
WHERE dv.venta_id = $1
```
*Archivo:* `backend/routes/ventas.js`

---

### VIEW — Vista de ventas completa
```sql
CREATE OR REPLACE VIEW vista_ventas_completa AS
SELECT v.id AS venta_id, v.fecha, v.total,
       c.nombre AS cliente, c.email AS cliente_email,
       e.nombre AS empleado, e.puesto
FROM ventas v
JOIN clientes  c ON v.cliente_id  = c.id
JOIN empleados e ON v.empleado_id = e.id
```
*Archivo:* `db/03_views.sql`

---

### Subconsulta 1 — Productos con stock menor al promedio
```sql
SELECT p.nombre, p.stock FROM productos p
JOIN categorias c ON p.categoria_id = c.id
WHERE p.stock < (SELECT AVG(stock) FROM productos)
```
*Endpoint:* `GET /api/reportes/stock-bajo`

---

### Subconsulta 2 — Clientes que gastan más que el promedio
```sql
SELECT c.nombre, SUM(v.total) AS total_compras
FROM clientes c JOIN ventas v ON c.id = v.cliente_id
GROUP BY c.id
HAVING SUM(v.total) > (
  SELECT AVG(suma) FROM (
    SELECT SUM(total) AS suma FROM ventas GROUP BY cliente_id
  ) sub
)
```
*Endpoint:* `GET /api/reportes/mejores-clientes`

---

### GROUP BY + HAVING — Empleados con ventas superiores a Q5,000
```sql
SELECT e.nombre, COUNT(v.id) AS num_ventas, SUM(v.total) AS total_vendido
FROM empleados e JOIN ventas v ON e.id = v.empleado_id
GROUP BY e.id
HAVING SUM(v.total) > 5000
```
*Endpoint:* `GET /api/reportes/rendimiento-empleados`

---

### CTE — Ranking de productos más vendidos
```sql
WITH ventas_por_producto AS (
  SELECT p.nombre, SUM(dv.cantidad) AS unidades, SUM(dv.subtotal) AS ingresos
  FROM detalle_venta dv
  JOIN productos  p ON dv.producto_id = p.id
  JOIN categorias c ON p.categoria_id = c.id
  GROUP BY p.id, p.nombre, c.nombre
)
SELECT * FROM ventas_por_producto ORDER BY unidades DESC
```
*Endpoint:* `GET /api/reportes/productos-mas-vendidos`

---

### Transacción con ROLLBACK visible

El endpoint `POST /api/ventas` ejecuta una transacción completa con bloqueo `FOR UPDATE` en cada producto. Si el stock es insuficiente para cualquier ítem, se ejecuta `ROLLBACK` y el error se muestra visualmente en la UI con el mensaje **"ROLLBACK EJECUTADO — Transacción revertida"**.

```
POST /api/ventas → BEGIN → FOR UPDATE → stock check
  ├── stock insuficiente → ROLLBACK → { rollback: true, error: "..." }
  └── todo ok           → COMMIT   → { rollback: false, venta_id, total }
```

*Archivo:* `backend/routes/ventas.js`

---

## Variables de entorno

El backend lee las siguientes variables (configuradas en `docker-compose.yml`):

| Variable | Valor en desarrollo |
|---|---|
| `DATABASE_URL` | `postgres://proy2:secret@db:5432/tienda` |
| `JWT_SECRET` | `clave_super_secreta_cambiar_en_produccion` |
| `PORT` | `4000` |