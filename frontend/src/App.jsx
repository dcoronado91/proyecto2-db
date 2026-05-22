import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar         from './components/Navbar'
import Login          from './pages/Login'
import Register       from './pages/Register'
import Dashboard      from './pages/Dashboard'
import Productos      from './pages/Productos'
import Ventas         from './pages/Ventas'
import Reportes       from './pages/Reportes'
import Producto       from './pages/Producto'
import AdminProductos from './pages/AdminProductos'
import AdminClientes  from './pages/AdminClientes'
import Carrito        from './pages/Carrito'
import { useAuth }    from './context/AuthContext'
import {
  ROLES_STAFF,
  ROLES_VENTAS,
  ROLES_REPORTES,
  ROLES_INVENTARIO,
  ROLES_CLIENTES,
} from './constants/roles'

const SinAcceso = () => (
  <div style={{ padding: '80px 32px', textAlign: 'center' }}>
    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--danger)', textTransform: 'uppercase', marginBottom: '16px' }}>
      403 — Sin autorización
    </p>
    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--text)', margin: '0 0 12px' }}>
      Acceso restringido
    </h2>
    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8rem', color: 'var(--muted)' }}>
      Tu rol no tiene permiso para ver esta sección.
    </p>
  </div>
)

// Ruta que solo exige sesión activa
const PrivateRoute = ({ children }) => {
  const { auth } = useAuth()
  return auth.token ? children : <Navigate to="/login" replace />
}

// Ruta con lista de roles permitidos
const RoleRoute = ({ children, roles }) => {
  const { auth } = useAuth()
  if (!auth.token) return <Navigate to="/login" replace />
  if (!roles.includes(auth.rol)) return <Navigate to="/sin-acceso" replace />
  return children
}

// Ruta exclusiva para clientes (redirige staff al dashboard)
const ClientRoute = ({ children }) => {
  const { auth } = useAuth()
  if (!auth.token) return <Navigate to="/login" replace />
  if (ROLES_STAFF.includes(auth.rol)) return <Navigate to="/dashboard" replace />
  return children
}

// Redirección inicial según rol
const HomeRedirect = () => {
  const { auth } = useAuth()
  if (!auth.token) return <Navigate to="/login" replace />
  return ROLES_STAFF.includes(auth.rol)
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/productos" replace />
}

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Públicas */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Catálogo: cualquier usuario autenticado */}
        <Route path="/productos" element={
          <PrivateRoute><Layout><Productos /></Layout></PrivateRoute>
        } />
        <Route path="/producto/:id" element={
          <PrivateRoute><Layout><Producto /></Layout></PrivateRoute>
        } />

        {/* Carrito: solo clientes */}
        <Route path="/carrito" element={
          <ClientRoute><Layout><Carrito /></Layout></ClientRoute>
        } />

        {/* Dashboard: todo el staff */}
        <Route path="/dashboard" element={
          <RoleRoute roles={ROLES_STAFF}><Layout><Dashboard /></Layout></RoleRoute>
        } />

        {/* Ventas: admin, gerente, vendedor, cajero */}
        <Route path="/ventas" element={
          <RoleRoute roles={ROLES_VENTAS}><Layout><Ventas /></Layout></RoleRoute>
        } />

        {/* Reportes: solo admin y gerente */}
        <Route path="/reportes" element={
          <RoleRoute roles={ROLES_REPORTES}><Layout><Reportes /></Layout></RoleRoute>
        } />

        {/* Inventario (admin productos): admin, gerente, bodeguero */}
        <Route path="/admin/productos" element={
          <RoleRoute roles={ROLES_INVENTARIO}><Layout><AdminProductos /></Layout></RoleRoute>
        } />

        {/* Gestión de clientes: admin y gerente */}
        <Route path="/admin/clientes" element={
          <RoleRoute roles={ROLES_CLIENTES}><Layout><AdminClientes /></Layout></RoleRoute>
        } />

        {/* Sin acceso */}
        <Route path="/sin-acceso" element={
          <PrivateRoute><Layout><SinAcceso /></Layout></PrivateRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<HomeRedirect />} />

      </Routes>
    </BrowserRouter>
  )
}
