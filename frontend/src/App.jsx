import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar    from './components/Navbar'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Ventas    from './pages/Ventas'
import Reportes  from './pages/Reportes'

const PrivateRoute = ({ children }) =>
  localStorage.getItem('token') ? children : <Navigate to="/login" replace />

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
        <Route path="/login" element={<Login />} />
        <Route path="/productos" element={
          <PrivateRoute><Layout><Productos /></Layout></PrivateRoute>
        } />
        <Route path="/ventas" element={
          <PrivateRoute><Layout><Ventas /></Layout></PrivateRoute>
        } />
        <Route path="/reportes" element={
          <PrivateRoute><Layout><Reportes /></Layout></PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
