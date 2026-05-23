import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import {
  ROLES_STAFF,
  ROLES_DASHBOARD,
  ROLES_VENTAS,
  ROLES_REPORTES,
  ROLES_INVENTARIO,
  ROLES_CLIENTES,
} from '../constants/roles'

// Cada link se muestra solo si el rol del usuario está en `roles`
const NAV_LINKS = [
  { to: '/productos',       label: 'Productos',  roles: null },          // todos
  { to: '/dashboard',       label: 'Dashboard',  roles: ROLES_DASHBOARD },
  { to: '/ventas',          label: 'Ventas',     roles: ROLES_VENTAS },
  { to: '/reportes',        label: 'Reportes',   roles: ROLES_REPORTES },
  { to: '/admin/productos', label: 'Inventario', roles: ROLES_INVENTARIO },
  { to: '/admin/clientes',  label: 'Clientes',   roles: ROLES_CLIENTES },
]

export default function Navbar() {
  const navigate         = useNavigate()
  const { auth, logout } = useAuth()
  const { count }        = useCart()
  const esCliente        = auth.token && !ROLES_STAFF.includes(auth.rol)

  const links = NAV_LINKS.filter(({ roles }) =>
    !roles || (auth.rol && roles.includes(auth.rol))
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{
      background:     'var(--surface)',
      borderBottom:   '1px solid var(--border)',
      height:         '56px',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        '0 32px',
      position:       'sticky',
      top:            0,
      zIndex:         100,
    }}>

      {/* Logo */}
      <Link to="/productos" style={{ textDecoration: 'none' }}>
        <span className="font-display font-bold text-lg" style={{ letterSpacing: '-0.5px' }}>
          <span style={{ color: 'var(--accent)' }}>TIENDA</span>
          <span style={{ color: 'var(--text)' }}> TECH</span>
        </span>
      </Link>

      {/* Navegación */}
      <div className="r-nav-links" style={{ display: 'flex', height: '100%' }}>
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display:        'flex',
            alignItems:     'center',
            padding:        '0 20px',
            fontFamily:     'DM Sans, sans-serif',
            fontWeight:     500,
            fontSize:       '0.875rem',
            textDecoration: 'none',
            color:           isActive ? 'var(--accent)' : 'var(--muted)',
            borderBottom:    isActive ? '2px solid var(--accent)' : '2px solid transparent',
            transition:      'all 0.15s',
          })}>
            {label}
          </NavLink>
        ))}
      </div>

      {/* Usuario + carrito */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* Badge de rol */}
        {auth.rol && (
          <span style={{
            fontFamily:    'DM Mono, monospace',
            fontSize:      '0.6rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color:         'var(--muted)',
            border:        '1px solid var(--border)',
            borderRadius:  '2px',
            padding:       '2px 6px',
          }}>
            {auth.rol}
          </span>
        )}

        {/* Carrito (solo clientes) */}
        {esCliente && (
          <Link to="/carrito" style={{
            position:       'relative',
            display:        'flex',
            alignItems:     'center',
            color:          count > 0 ? 'var(--accent)' : 'var(--muted)',
            textDecoration: 'none',
            transition:     'color 0.15s',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {count > 0 && (
              <span style={{
                position:    'absolute', top: '-7px', right: '-8px',
                background:  'var(--accent)', color: '#0a0b0e',
                borderRadius:'50%', width: '16px', height: '16px',
                display:     'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily:  'DM Mono', fontSize: '0.6rem', fontWeight: 700,
              }}>
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
        )}

        <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>
          {auth.username}
        </span>

        <button onClick={handleLogout} style={{
          background:    'transparent',
          border:        '1px solid var(--border)',
          color:         'var(--muted)',
          borderRadius:  '2px',
          fontFamily:    'DM Mono, monospace',
          fontSize:      '0.7rem',
          letterSpacing: '0.12em',
          padding:       '6px 12px',
          cursor:        'pointer',
          transition:    'all 0.15s',
          textTransform: 'uppercase',
        }}
          onMouseEnter={e => {
            e.target.style.borderColor = 'var(--danger)'
            e.target.style.color       = 'var(--danger)'
          }}
          onMouseLeave={e => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.color       = 'var(--muted)'
          }}>
          Salir
        </button>
      </div>
    </nav>
  )
}
