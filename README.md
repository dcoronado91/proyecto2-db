## Información del estudiante

- **Nombre:** Derek Friedhelm Coronado Chilin
- **Carnet:** 24732

### Proyectos incluidos en este repositorio

| Proyecto | Curso | Sección |
|---|---|---|
| Proyecto 1 — Base de datos relacional | CC3088 - Bases de Datos 1 | 10 |
| Proyecto 2 — Aplicación web fullstack | CC3062 - Sistemas y Tecnologías Web | 10 |

> **Nota de fusión:** Este repositorio combina ambos proyectos. El trabajo correspondiente a CC3088 (esquema SQL, vistas, subconsultas, transacciones y la documentación de cumplimiento de rúbrica SQL que aparece más abajo) quedó consolidado en el commit **`bbe2769`** del 3 de mayo de 2026. Todo lo que viene después de ese commit pertenece al proyecto web (CC3062).

---

# Tienda Tech — Sistema de Gestión

Sistema de gestión para una tienda de tecnología construido como proyecto universitario. Cubre el ciclo completo: autenticación con roles, catálogo de productos, registro de ventas con transacciones y ROLLBACK visible, reportes SQL avanzados y portal de compra para clientes.

## Demo en producción

| Servicio | URL |
|---|---|
| Frontend (Netlify) | https://tienda-tech-frontend.netlify.app/ |
| Backend / API (Vercel) | https://tienda-tech-liart.vercel.app/ |

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
| `cliente` | — | ✓ | ✓ (comprar) | — | — |

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
│       ├── productos.js    # CRUD completo de productos
│       ├── clientes.js     # CRUD completo de clientes
│       ├── empleados.js    # GET /empleados
│       ├── categorias.js   # GET /categorias
│       ├── proveedores.js  # GET /proveedores
│       ├── ventas.js       # GET /ventas, POST /ventas (transacción)
│       └── reportes.js     # 4 endpoints de reportes SQL
└── frontend/
    └── src/
        ├── api/axios.js        # Cliente HTTP con interceptor JWT
        ├── context/
        │   └── AuthContext.jsx # useReducer + Context (login/logout/rol)
        ├── components/
        │   └── Navbar.jsx
        ├── data/
        │   └── imagenes.js     # Mapa de URLs de imágenes por producto ID
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   ├── Productos.jsx   # Grid con useMemo para filtros
        │   ├── Producto.jsx    # Detalle + compra para clientes
        │   ├── Ventas.jsx      # Formulario de venta + historial
        │   ├── Reportes.jsx    # 4 reportes con exportación CSV
        │   ├── AdminProductos.jsx  # CRUD de productos con validación
        │   └── AdminClientes.jsx   # CRUD de clientes con validación
        └── test/
            └── logica.test.js  # Tests unitarios (vitest)
```

---

## API Reference

Base URL (local): `http://localhost:4000/api`
Base URL (producción): `https://tienda-tech-liart.vercel.app/api`

Las rutas marcadas con 🔒 requieren el header `Authorization: Bearer <token>`.

---

### Auth

#### `POST /auth/register`
Crea un nuevo usuario. Si `rol` es `cliente`, también crea el registro en la tabla `clientes`.

**Body:**
```json
{
  "username": "juan",
  "password": "1234",
  "rol": "cliente",
  "nombre": "Juan Pérez",
  "email": "juan@mail.com"
}
```
`rol` acepta: `admin`, `gerente`, `vendedor`, `cajero`, `cliente`. Default: `vendedor`.

**Respuesta 201:**
```json
{ "id": 1, "username": "juan", "rol": "cliente", "cliente_id": 5 }
```

**Errores:** `400` campos faltantes · `409` username ya existe

---

#### `POST /auth/login`
Autentica al usuario y devuelve un token JWT (duración 8 h).

**Body:**
```json
{ "username": "juan", "password": "1234" }
```

**Respuesta 200:**
```json
{
  "token": "eyJhbGci...",
  "username": "juan",
  "rol": "cliente",
  "cliente_id": 5
}
```

**Errores:** `401` credenciales incorrectas

---

### Productos

#### `GET /productos`
Devuelve todos los productos con su categoría y proveedor (JOIN).

**Respuesta 200:**
```json
[
  {
    "id": 1,
    "nombre": "Laptop Dell Inspiron",
    "descripcion": "Intel i5, 8 GB RAM, 512 GB SSD",
    "precio": "4500.00",
    "stock": 12,
    "categoria_id": 1,
    "proveedor_id": 2,
    "categoria": "Laptops",
    "proveedor": "TechImport"
  }
]
```

---

#### `GET /productos/:id`
Devuelve un producto individual.

**Respuesta 200:** mismo objeto que el array anterior.
**Errores:** `404` producto no encontrado

---

#### `POST /productos` 🔒
Crea un nuevo producto.

**Body:**
```json
{
  "nombre": "Laptop Dell Inspiron",
  "descripcion": "Intel i5, 8 GB RAM",
  "precio": 4500.00,
  "stock": 10,
  "categoria_id": 1,
  "proveedor_id": 2
}
```

**Respuesta 201:** objeto del producto creado (con todos los campos).
**Errores:** `400` faltan nombre / precio / categoria_id / proveedor_id

---

#### `PUT /productos/:id` 🔒
Actualiza un producto existente. Requiere los mismos campos que POST.

**Respuesta 200:** objeto del producto actualizado.
**Errores:** `400` campos faltantes · `404` producto no encontrado

---

#### `DELETE /productos/:id` 🔒
Elimina un producto.

**Respuesta 200:**
```json
{ "mensaje": "Producto eliminado", "id": 1 }
```
**Errores:** `404` producto no encontrado

---

### Clientes

#### `GET /clientes`
Devuelve todos los clientes ordenados por nombre.

**Respuesta 200:**
```json
[
  { "id": 1, "nombre": "María García", "email": "maria@mail.com", "telefono": "5555-1234", "direccion": "Zona 10" }
]
```

---

#### `GET /clientes/:id`
Devuelve un cliente individual.
**Errores:** `404` cliente no encontrado

---

#### `POST /clientes`
Crea un nuevo cliente.

**Body:**
```json
{
  "nombre": "María García",
  "email": "maria@mail.com",
  "telefono": "5555-1234",
  "direccion": "Zona 10"
}
```
Solo `nombre` es requerido.

**Respuesta 201:** objeto del cliente creado.
**Errores:** `400` nombre requerido · `409` email ya registrado

---

#### `PUT /clientes/:id`
Actualiza un cliente. Requiere al menos `nombre`.

**Respuesta 200:** objeto del cliente actualizado.
**Errores:** `400` nombre requerido · `404` cliente no encontrado · `409` email duplicado

---

#### `DELETE /clientes/:id`
Elimina un cliente.

**Respuesta 200:**
```json
{ "mensaje": "Cliente eliminado", "id": 1 }
```
**Errores:** `404` cliente no encontrado

---

### Empleados

#### `GET /empleados`
Devuelve todos los empleados.

**Respuesta 200:**
```json
[
  { "id": 1, "nombre": "Carlos López", "puesto": "Vendedor", "email": "carlos@tienda.com" }
]
```

---

### Categorías

#### `GET /categorias`
Devuelve todas las categorías ordenadas por nombre.

#### `GET /categorias/:id`
Devuelve una categoría individual.

---

### Proveedores

#### `GET /proveedores`
Devuelve todos los proveedores.

#### `GET /proveedores/:id`
Devuelve un proveedor individual.

---

### Ventas

#### `GET /ventas`
Devuelve el historial completo de ventas usando la vista `vista_ventas_completa`, ordenado por fecha descendente.

**Respuesta 200:**
```json
[
  {
    "venta_id": 10,
    "fecha": "2026-05-10T15:30:00.000Z",
    "total": "1250.00",
    "cliente": "María García",
    "cliente_email": "maria@mail.com",
    "empleado": "Carlos López",
    "puesto": "Vendedor"
  }
]
```

---

#### `GET /ventas/:id`
Devuelve el detalle completo de una venta con sus productos.

**Respuesta 200:**
```json
{
  "venta_id": 10,
  "fecha": "2026-05-10T15:30:00.000Z",
  "total": "1250.00",
  "cliente": "María García",
  "empleado": "Carlos López",
  "detalle": [
    {
      "producto": "Mouse Logitech MX",
      "categoria": "Mouses",
      "cantidad": 2,
      "precio_unitario": "350.00",
      "subtotal": "700.00"
    }
  ]
}
```
**Errores:** `404` venta no encontrada

---

#### `POST /ventas`
Registra una venta completa dentro de una transacción con bloqueo `FOR UPDATE`. Si el stock es insuficiente para cualquier ítem, ejecuta `ROLLBACK`.

**Body:**
```json
{
  "cliente_id": 1,
  "empleado_id": 3,
  "items": [
    { "producto_id": 5, "cantidad": 2 },
    { "producto_id": 8, "cantidad": 1 }
  ]
}
```

**Respuesta 201 (COMMIT exitoso):**
```json
{
  "rollback": false,
  "venta_id": 11,
  "total": 1250.00,
  "mensaje": "Venta registrada correctamente"
}
```

**Respuesta 409 (ROLLBACK por stock insuficiente):**
```json
{
  "rollback": true,
  "error": "Stock insuficiente para \"Laptop Dell\". Disponible: 2, solicitado: 5"
}
```

**Errores:** `400` faltan campos · `404` producto no existe · `409` stock insuficiente

---

### Reportes

Todos los endpoints de reporte son de solo lectura y no requieren autenticación.

---

#### `GET /reportes/stock-bajo`
Productos cuyo stock es menor al promedio general (subconsulta).

**Respuesta 200:**
```json
[
  { "nombre": "Cable HDMI", "stock": 3, "precio": "45.00", "categoria": "Accesorios" }
]
```

---

#### `GET /reportes/mejores-clientes`
Clientes cuyo total de compras supera el promedio de todos los clientes (subconsulta + HAVING).

**Respuesta 200:**
```json
[
  { "cliente": "María García", "email": "maria@mail.com", "total_compras": "8500.00" }
]
```

---

#### `GET /reportes/rendimiento-empleados`
Empleados con total vendido mayor a Q5,000 (GROUP BY + HAVING).

**Respuesta 200:**
```json
[
  { "empleado": "Carlos López", "puesto": "Vendedor", "num_ventas": "12", "total_vendido": "18500.00" }
]
```

---

#### `GET /reportes/productos-mas-vendidos`
Ranking de productos por unidades vendidas e ingresos totales (CTE).

**Respuesta 200:**
```json
[
  { "producto": "Laptop Dell Inspiron", "categoria": "Laptops", "unidades_vendidas": "45", "ingresos_total": "202500.00" }
]
```

---

#### `GET /health`
Verificación de disponibilidad del servidor.

**Respuesta 200:**
```json
{ "status": "ok", "timestamp": "2026-05-15T20:00:00.000Z" }
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

## Variables de entorno

El backend lee las siguientes variables (configuradas en `docker-compose.yml`):

| Variable | Valor en desarrollo |
|---|---|
| `DATABASE_URL` | `postgres://proy2:secret@db:5432/tienda` |
| `JWT_SECRET` | `clave_super_secreta_cambiar_en_produccion` |
| `PORT` | `4000` |

---

## Cumplimiento del rubric SQL (CC3088)

> El siguiente bloque documenta los requisitos de CC3088 - Bases de Datos 1, cubiertos hasta el commit `bbe2769` (3 de mayo de 2026).

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

## Proyecto 3 — Seguridad, Roles, Stored Procedures y ORM

Esta rama (`proyecto-3`) extiende el Proyecto 2 con seguridad a nivel de base de datos.

### Levantar desde cero

```bash
docker compose down -v
docker compose up
```

Credenciales de la base de datos: **usuario** `proy3` / **contraseña** `secret`.

---

### Esquema de roles en el DBMS

Definidos en `db/04_roles.sql` mediante `CREATE ROLE` con permisos granulares (`GRANT` / `REVOKE`).

| Rol DBMS       | Rol aplicación | Tablas con acceso                                          | Operaciones permitidas                        |
|----------------|----------------|------------------------------------------------------------|-----------------------------------------------|
| `rol_admin`    | admin          | Todas                                                      | SELECT, INSERT, UPDATE, DELETE                |
| `rol_gerente`  | gerente        | Todas                                                      | SELECT en todo; INSERT/UPDATE en ventas       |
| `rol_vendedor` | vendedor/cajero| productos, clientes, categorías, proveedores, ventas       | SELECT; INSERT en ventas; UPDATE stock        |
| `rol_bodeguero`| bodeguero      | productos, categorías, proveedores                         | SELECT, INSERT, UPDATE; DELETE en productos   |
| `rol_cliente`  | cliente        | productos, categorías, ventas, detalle_venta               | Solo SELECT                                   |

---

### Usuarios de prueba (contraseña: `secret`)

| Username       | Rol          | Acceso en la UI                                    |
|----------------|--------------|----------------------------------------------------|
| `admin_p3`     | admin        | Todo: dashboard, ventas, reportes, inventario, clientes |
| `gerente_p3`   | gerente      | Dashboard, ventas, reportes, clientes              |
| `vendedor_p3`  | vendedor     | Dashboard, ventas                                  |
| `bodeguero_p3` | bodeguero    | Dashboard, inventario                              |
| `cliente_p3`   | cliente      | Catálogo de productos, carrito                     |

---

### Stored Procedures (`db/05_stored_procedures.sql`)

| Procedure / Function           | Tipo         | Descripción                                                    |
|--------------------------------|--------------|----------------------------------------------------------------|
| `sp_registrar_venta`           | PROCEDURE    | Crea una venta completa con transacción explícita y ROLLBACK   |
| `sp_actualizar_stock`          | FUNCTION     | Ajusta stock; parámetros IN/OUT + manejo de excepciones        |
| `sp_crear_producto`            | FUNCTION     | Crea producto con validaciones; retorna id o error             |
| `sp_actualizar_producto`       | FUNCTION     | Actualiza producto con validaciones                            |
| `sp_eliminar_producto`         | FUNCTION     | Elimina solo si no tiene ventas; lanza excepción si las tiene  |
| `sp_reporte_ventas_periodo`    | FUNCTION     | Reporte de ventas entre dos fechas (RETURNS TABLE)             |

Todos se invocan desde el backend (nunca desde scripts independientes).

---

### ORM — Sequelize

Configurado en `backend/sequelize.js`. Modelos en `backend/models/`.

| Ruta / Operación                     | Método ORM usado          |
|--------------------------------------|---------------------------|
| `GET /api/categorias`                | `Categoria.findAll()`     |
| `GET /api/categorias/:id`            | `Categoria.findByPk()`    |
| `POST /api/categorias`               | `Categoria.create()`      |
| `PUT /api/categorias/:id`            | `categoria.update()`      |
| `DELETE /api/categorias/:id`         | `categoria.destroy()`     |
| `GET /api/clientes`                  | `Cliente.findAll()`       |
| `POST /api/clientes`                 | `Cliente.create()`        |
| `PUT /api/clientes/:id`              | `cliente.update()`        |
| `GET /api/proveedores`               | `Proveedor.findAll()`     |
| `POST /api/proveedores`              | `Proveedor.create()`      |
| `GET /api/productos`                 | `Producto.findAll()` con `include` |
| `GET /api/productos/:id`             | `Producto.findByPk()` con `include` |

---

### Seguridad de inputs (protección contra SQL Injection)

Todas las rutas que aceptan datos del usuario usan `express-validator`:
- Sanitización (`trim`, `escape`) en todos los campos de texto
- Validación de tipos: enteros, floats, emails, fechas ISO 8601
- Longitudes máximas por campo
- Regex para teléfonos y usernames
- Sequelize y `pg` usan parámetros posicionales (`$1`, `$2`) — nunca interpolación de strings

---

### Estructura adicional (Proyecto 3)

```
db/
├── 04_roles.sql             # CREATE ROLE + GRANT/REVOKE para 5 roles
└── 05_stored_procedures.sql # 6 stored procedures y funciones

backend/
├── sequelize.js             # Configuración Sequelize
├── models/
│   ├── index.js             # Exporta modelos + asociaciones
│   ├── Categoria.js
│   ├── Cliente.js
│   ├── Empleado.js
│   ├── Producto.js
│   └── Proveedor.js
└── middleware/
    ├── auth.js              # Verificación JWT (sin cambios)
    └── authorize.js         # Autorización por rol: authorize('admin', 'gerente')
```
