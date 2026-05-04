import { NavLink, Link, useNavigate } from 'react-router-dom'

const LINKS_TODOS  = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/productos', label: 'Productos' },
]
const LINKS_STAFF  = [
  { to: '/ventas',   label: 'Ventas'   },
  { to: '/reportes', label: 'Reportes' },
]
const ROLES_STAFF = ['admin', 'gerente', 'vendedor', 'cajero']

export default function Navbar() {
  const navigate  = useNavigate()
  const username  = localStorage.getItem('username') || 'usuario'
  const rol       = localStorage.getItem('rol') || ''
  const links     = ROLES_STAFF.includes(rol)
    ? [...LINKS_TODOS, ...LINKS_STAFF]
    : LINKS_TODOS

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <nav style={{
      background:    'var(--surface)',
      borderBottom:  '1px solid var(--border)',
      height:        '56px',
      display:       'flex',
      alignItems:    'center',
      justifyContent:'space-between',
      padding:       '0 32px',
      position:      'sticky',
      top:           0,
      zIndex:        100,
    }}>

      {/* Logo */}
      <Link to="/productos" style={{ textDecoration: 'none' }}>
        <span className="font-display font-bold text-lg" style={{ letterSpacing: '-0.5px' }}>
          <span style={{ color: 'var(--accent)' }}>TIENDA</span>
          <span style={{ color: 'var(--text)' }}> TECH</span>
        </span>
      </Link>

      {/* Navegación */}
      <div style={{ display: 'flex', height: '100%' }}>
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display:       'flex',
            alignItems:    'center',
            padding:       '0 20px',
            fontFamily:    'DM Sans, sans-serif',
            fontWeight:    500,
            fontSize:      '0.875rem',
            textDecoration:'none',
            color:          isActive ? 'var(--accent)' : 'var(--muted)',
            borderBottom:   isActive ? '2px solid var(--accent)' : '2px solid transparent',
            transition:     'all 0.15s',
          })}>
            {label}
          </NavLink>
        ))}
      </div>

      {/* Usuario */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>
          {username}
        </span>
        <button onClick={logout} style={{
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
