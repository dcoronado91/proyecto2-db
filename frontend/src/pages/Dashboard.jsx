import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background:   'var(--surface)',
      border:       '1px solid var(--border)',
      borderRadius: '2px',
      padding:      '24px 28px',
      display:      'flex',
      flexDirection:'column',
      gap:          '8px',
    }}>
      <span style={{
        fontFamily:    'DM Mono, monospace',
        fontSize:      '0.62rem',
        letterSpacing: '0.18em',
        color:         'var(--muted)',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily:         'DM Mono, monospace',
        fontWeight:         700,
        fontSize:           '2rem',
        color:              accent || 'var(--text)',
        lineHeight:         1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--muted)' }}>
          {sub}
        </span>
      )}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'usuario'

  const [ventas,    setVentas]    = useState([])
  const [productos, setProductos] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/ventas'),
      api.get('/productos'),
    ]).then(([v, p]) => {
      setVentas(v.data)
      setProductos(p.data)
    }).finally(() => setLoading(false))
  }, [])

  const totalIngresos = ventas.reduce((acc, v) => acc + parseFloat(v.total), 0)
  const stockCritico  = productos.filter(p => p.stock < 8).length
  const stockBajo     = productos.filter(p => p.stock >= 8 && p.stock < 20).length

  const ventasRecientes = ventas.slice(0, 5)

  return (
    <div style={{ padding: '40px 32px' }}>

      {/* Encabezado */}
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', margin: '0 0 8px' }}>
          Bienvenido, {username}
        </p>
        <h2 className="font-display font-bold" style={{ fontSize: '2.2rem', color: 'var(--text)', margin: 0 }}>
          Panel General
        </h2>
      </div>

      {/* Stats */}
      {loading ? (
        <p className="font-data text-sm" style={{ color: 'var(--muted)' }}>Cargando...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
            <StatCard
              label="Total Ventas"
              value={ventas.length}
              sub="transacciones registradas"
              accent="var(--accent)"
            />
            <StatCard
              label="Ingresos Totales"
              value={`Q${totalIngresos.toLocaleString('es-GT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              sub="suma de todas las ventas"
              accent="var(--accent)"
            />
            <StatCard
              label="Productos"
              value={productos.length}
              sub={`${stockCritico} críticos · ${stockBajo} bajos`}
              accent={stockCritico > 0 ? 'var(--danger)' : 'var(--text)'}
            />
            <StatCard
              label="Ticket Promedio"
              value={ventas.length ? `Q${(totalIngresos / ventas.length).toLocaleString('es-GT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'Q0'}
              sub="por venta"
            />
          </div>

          {/* Dos columnas: ventas recientes + accesos rápidos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'start' }}>

            {/* Ventas recientes */}
            <div>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', margin: '0 0 14px' }}>
                Últimas ventas
              </p>
              <div style={{ border: '1px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                      {['#', 'Cliente', 'Empleado', 'Fecha', 'Total'].map(h => (
                        <th key={h} style={{
                          padding:       '9px 14px',
                          fontFamily:    'DM Mono',
                          fontSize:      '0.6rem',
                          letterSpacing: '0.12em',
                          color:         'var(--muted)',
                          textTransform: 'uppercase',
                          fontWeight:    500,
                          textAlign:     h === 'Total' ? 'right' : 'left',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ventasRecientes.map((v, i) => (
                      <tr key={v.venta_id} style={{
                        background:   i % 2 === 0 ? 'var(--surface)' : 'var(--bg)',
                        borderBottom: '1px solid var(--border)',
                      }}>
                        <td style={{ padding: '9px 14px', fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted)' }}>{v.venta_id}</td>
                        <td style={{ padding: '9px 14px', color: 'var(--text)', fontWeight: 500 }}>{v.cliente}</td>
                        <td style={{ padding: '9px 14px', fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted)' }}>{v.empleado}</td>
                        <td style={{ padding: '9px 14px', fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted)' }}>
                          {new Date(v.fecha).toLocaleDateString('es-GT')}
                        </td>
                        <td style={{ padding: '9px 14px', textAlign: 'right', fontFamily: 'DM Mono', color: 'var(--accent)', fontWeight: 600 }}>
                          Q{parseFloat(v.total).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ventasRecientes.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '0.8rem' }}>
                    Sin ventas registradas aún
                  </div>
                )}
              </div>
            </div>

            {/* Accesos rápidos */}
            <div style={{ minWidth: '200px' }}>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', margin: '0 0 14px' }}>
                Accesos rápidos
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Nueva Venta',  path: '/ventas',    color: 'var(--accent)' },
                  { label: 'Productos',    path: '/productos', color: 'var(--text)'   },
                  { label: 'Reportes',     path: '/reportes',  color: 'var(--text)'   },
                ].map(({ label, path, color }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    style={{
                      background:    'var(--surface)',
                      border:        '1px solid var(--border)',
                      color,
                      borderRadius:  '2px',
                      fontFamily:    'DM Mono, monospace',
                      fontSize:      '0.75rem',
                      letterSpacing: '0.1em',
                      padding:       '12px 20px',
                      cursor:        'pointer',
                      textAlign:     'left',
                      transition:    'border-color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    {label} →
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
