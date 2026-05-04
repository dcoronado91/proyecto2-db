import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [busqueda,  setBusqueda]  = useState('')

  useEffect(() => {
    api.get('/productos')
      .then(({ data }) => setProductos(data))
      .catch(() => setError('No se pudo cargar los productos'))
      .finally(() => setLoading(false))
  }, [])

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  )

  const stockColor = (stock) => {
    if (stock < 8)  return 'var(--danger)'
    if (stock < 20) return 'var(--warning)'
    return 'var(--success)'
  }

  if (loading) return (
    <div className="p-8">
      <p className="font-data text-sm" style={{ color: 'var(--muted)' }}>
        Cargando productos<span style={{ animation: 'pulse 1s infinite' }}>...</span>
      </p>
    </div>
  )

  if (error) return (
    <div className="p-8">
      <p className="font-data text-sm" style={{ color: 'var(--danger)' }}>⚠ {error}</p>
    </div>
  )

  return (
    <div style={{ padding: '40px 32px' }}>

      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <h2 className="font-display font-bold" style={{ fontSize: '2rem', color: 'var(--text)', margin: 0 }}>
            Productos
          </h2>
          <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>
            {filtrados.length} / {productos.length} registros
          </span>
        </div>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar producto o categoría..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            background:   'var(--surface)',
            border:       '1px solid var(--border)',
            color:        'var(--text)',
            borderRadius: '2px',
            fontFamily:   'DM Mono, monospace',
            fontSize:     '0.8rem',
            padding:      '8px 14px',
            outline:      'none',
            width:        '260px',
            transition:   'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e  => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Tabla */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              {['Nombre', 'Categoría', 'Proveedor', 'Precio', 'Stock'].map(h => (
                <th key={h} style={{
                  padding:       '12px 20px',
                  textAlign:     h === 'Precio' || h === 'Stock' ? 'right' : 'left',
                  fontFamily:    'DM Mono, monospace',
                  fontSize:      '0.7rem',
                  letterSpacing: '0.15em',
                  color:         'var(--muted)',
                  fontWeight:    500,
                  textTransform: 'uppercase',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p, i) => (
              <tr key={p.id} style={{
                background:  i % 2 === 0 ? 'var(--surface)' : 'var(--bg)',
                borderBottom:'1px solid var(--border)',
                transition:  'background 0.1s',
                cursor:      'default',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--surface)' : 'var(--bg)'}
              >
                <td style={{ padding: '12px 20px', color: 'var(--text)', fontWeight: 500 }}>
                  {p.nombre}
                </td>
                <td style={{ padding: '12px 20px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {p.categoria}
                </td>
                <td style={{ padding: '12px 20px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {p.proveedor}
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: 'var(--accent)', fontWeight: 500 }}>
                  Q{parseFloat(p.precio).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 500, color: stockColor(p.stock) }}>
                  {p.stock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>
            No se encontraron resultados para "{busqueda}"
          </div>
        )}
      </div>
    </div>
  )
}
