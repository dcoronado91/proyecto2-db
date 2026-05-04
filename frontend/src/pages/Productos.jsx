import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { getImagen } from '../data/imagenes'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [busqueda,  setBusqueda]  = useState('')
  const navigate = useNavigate()

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

  if (loading) return (
    <div style={{ padding: '40px 32px' }}>
      <p className="font-data text-sm" style={{ color: 'var(--muted)' }}>Cargando productos...</p>
    </div>
  )

  if (error) return (
    <div style={{ padding: '40px 32px' }}>
      <p className="font-data text-sm" style={{ color: 'var(--danger)' }}>⚠ {error}</p>
    </div>
  )

  return (
    <div style={{ padding: '40px 32px' }}>

      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <h2 className="font-display font-bold" style={{ fontSize: '2rem', color: 'var(--text)', margin: 0 }}>
            Productos
          </h2>
          <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>
            {filtrados.length} / {productos.length}
          </span>
        </div>
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
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e  => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Grid 5 columnas */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap:                 '16px',
      }}>
        {filtrados.map(p => (
          <ProductCard key={p.id} producto={p} onClick={() => navigate(`/producto/${p.id}`)} />
        ))}
      </div>

      {filtrados.length === 0 && (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '0.8rem' }}>
          Sin resultados para "{busqueda}"
        </div>
      )}
    </div>
  )
}

function ProductCard({ producto: p, onClick }) {
  const [imgError, setImgError] = useState(false)
  const stockColor = p.stock < 8 ? 'var(--danger)' : p.stock < 20 ? 'var(--warning)' : 'var(--success)'

  return (
    <div
      onClick={onClick}
      style={{
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: '2px',
        cursor:       'pointer',
        overflow:     'hidden',
        transition:   'border-color 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.transform   = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform   = 'translateY(0)'
      }}
    >
      {/* Imagen */}
      <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--surface-2)', position: 'relative' }}>
        {imgError || !getImagen(p.id) ? (
          <div style={{
            width: '100%', height: '100%', minHeight: '120px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'DM Mono', fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
              {p.categoria?.toUpperCase()}
            </span>
          </div>
        ) : (
          <img
            src={getImagen(p.id)}
            alt={p.nombre}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        <div style={{
          position:      'absolute',
          top:           '8px',
          right:         '8px',
          background:    'rgba(10,11,14,0.85)',
          border:        `1px solid ${stockColor}`,
          borderRadius:  '2px',
          padding:       '2px 7px',
          fontFamily:    'DM Mono, monospace',
          fontSize:      '0.6rem',
          color:         stockColor,
        }}>
          {p.stock} uds
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <p style={{
          fontFamily:      'DM Sans, sans-serif',
          fontWeight:      600,
          fontSize:        '0.82rem',
          color:           'var(--text)',
          margin:          '0 0 6px',
          lineHeight:      1.3,
          display:         '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow:        'hidden',
        }}>
          {p.nombre}
        </p>
        <p style={{
          fontFamily:         'DM Mono, monospace',
          fontSize:           '0.95rem',
          color:              'var(--accent)',
          fontWeight:         700,
          margin:             0,
          fontVariantNumeric: 'tabular-nums',
        }}>
          Q{parseFloat(p.precio).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  )
}
