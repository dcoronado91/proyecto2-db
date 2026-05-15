import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar    from './components/Navbar'
import Login     from './pages/Login'
import Register  from './pages/Register'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Ventas    from './pages/Ventas'
import Reportes  from './pages/Reportes'
import Producto       from './pages/Producto'
import AdminProductos  from './pages/AdminProductos'
import AdminClientes   from './pages/AdminClientes'
import { useAuth } from './context/AuthContext'
import { ROLES_STAFF } from './constants/roles'

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


const PrivateRoute = ({ children }) => {
  const { auth } = useAuth()
  return auth.token ? children : <Navigate to="/login" replace />
}

const StaffRoute = ({ children }) => {
  const { auth } = useAuth()
  if (!auth.token) return <Navigate to="/login" replace />
  if (!ROLES_STAFF.includes(auth.rol)) return <Navigate to="/sin-acceso" replace />
  return children
}

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
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/productos" element={
          <PrivateRoute><Layout><Productos /></Layout></PrivateRoute>
        } />
        <Route path="/ventas" element={
          <StaffRoute><Layout><Ventas /></Layout></StaffRoute>
        } />
        <Route path="/reportes" element={
          <StaffRoute><Layout><Reportes /></Layout></StaffRoute>
        } />
        <Route path="/dashboard" element={
          <StaffRoute><Layout><Dashboard /></Layout></StaffRoute>
        } />
        <Route path="/producto/:id" element={
          <PrivateRoute><Layout><Producto /></Layout></PrivateRoute>
        } />
        <Route path="/admin/productos" element={
          <StaffRoute><Layout><AdminProductos /></Layout></StaffRoute>
        } />
        <Route path="/admin/clientes" element={
          <StaffRoute><Layout><AdminClientes /></Layout></StaffRoute>
        } />
        <Route path="/sin-acceso" element={
          <PrivateRoute><Layout><SinAcceso /></Layout></PrivateRoute>
        } />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
