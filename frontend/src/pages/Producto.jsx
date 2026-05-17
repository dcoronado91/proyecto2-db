import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { getImagen } from '../data/imagenes'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { ROLES_STAFF } from '../constants/roles'

export default function Producto() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { auth } = useAuth()
  const { agregar, count } = useCart()
  const esStaff  = ROLES_STAFF.includes(auth.rol)

  const [producto,     setProducto]     = useState(null)
  const [masProductos, setMasProductos] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [imgError,     setImgError]     = useState(false)
  const [cantidad,     setCantidad]     = useState(1)
  const [agregado,     setAgregado]     = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    setImgError(false)
    setCantidad(1)
    setAgregado(false)
    Promise.all([
      api.get(`/productos/${id}`),
      api.get('/productos'),
    ]).then(([prod, todos]) => {
      setProducto(prod.data)
      setMasProductos(
        todos.data.filter(p => p.categoria_id === prod.data.categoria_id && p.id !== parseInt(id))
      )
    })
    .catch(() => setError('Producto no encontrado'))
    .finally(() => setLoading(false))
  }, [id])

  const handleAgregar = () => {
    agregar({ producto_id: parseInt(id), nombre: producto.nombre, precio: producto.precio, cantidad })
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  if (loading) return (
    <div style={{ padding: '40px 32px' }}>
      <p className="font-data text-sm" style={{ color: 'var(--muted)' }}>Cargando...</p>
    </div>
  )

  if (error || !producto) return (
    <div style={{ padding: '40px 32px' }}>
      <p className="font-data text-sm" style={{ color: 'var(--danger)' }}>⚠ {error}</p>
    </div>
  )

  const stockColor = producto.stock < 8
    ? 'var(--danger)' : producto.stock < 20
    ? 'var(--warning)' : 'var(--success)'

  return (
    <div style={{ padding: '40px 32px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <button
          onClick={() => navigate('/productos')}
          style={{ background: 'none', border: 'none', fontFamily: 'DM Mono', fontSize: '0.72rem', color: 'var(--muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        >
          ← Productos
        </button>
        <span style={{ color: 'var(--border)', fontFamily: 'DM Mono', fontSize: '0.72rem' }}>›</span>
        <span style={{ fontFamily: 'DM Mono', fontSize: '0.72rem', color: 'var(--accent)' }}>
          {producto.nombre}
        </span>
      </div>

      {/* Layout principal */}
      <div className="r-grid-2col">

        {/* Imagen */}
        <div style={{
          borderRadius: '2px', overflow: 'hidden',
          border: '1px solid var(--border)', background: 'var(--surface-2)', aspectRatio: '4/3',
        }}>
          {imgError || !getImagen(parseInt(id)) ? (
            <div style={{ width: '100%', height: '100%', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.12em' }}>
                {producto.categoria?.toUpperCase()}
              </span>
            </div>
          ) : (
            <img
              src={getImagen(parseInt(id))} alt={producto.nombre}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <span style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'var(--accent)', border: '1px solid rgba(200,255,71,0.3)',
            borderRadius: '2px', padding: '3px 10px', alignSelf: 'flex-start',
          }}>
            {producto.categoria}
          </span>

          <h1 className="font-display font-bold" style={{ fontSize: '1.75rem', color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
            {producto.nombre}
          </h1>

          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.82rem', color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
            {producto.descripcion}
          </p>

          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'var(--muted)', margin: 0 }}>
            Proveedor: <span style={{ color: 'var(--text)' }}>{producto.proveedor}</span>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: '1.8rem', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
              Q{parseFloat(producto.precio).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </span>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: stockColor, border: `1px solid ${stockColor}`, borderRadius: '2px', padding: '4px 10px' }}>
              {producto.stock > 0 ? `${producto.stock} en stock` : 'Agotado'}
            </span>
          </div>

          {/* Acciones */}
          {producto.stock > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {esStaff ? (
                <button
                  onClick={() => navigate('/ventas')}
                  style={{
                    background: 'var(--accent)', color: '#0a0b0e', border: 'none', borderRadius: '2px',
                    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.8rem',
                    letterSpacing: '0.15em', padding: '14px', cursor: 'pointer',
                  }}
                >
                  REGISTRAR VENTA →
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Cantidad */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase' }}>
                      Cantidad
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                      <button
                        onClick={() => setCantidad(c => Math.max(1, c - 1))}
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', width: '32px', height: '32px', cursor: 'pointer', fontFamily: 'DM Mono', borderRadius: '2px 0 0 2px' }}
                      >−</button>
                      <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: 'none', borderRight: 'none', padding: '0 16px', height: '32px', display: 'flex', alignItems: 'center', fontFamily: 'DM Mono', fontSize: '0.9rem', color: 'var(--text)', minWidth: '48px', justifyContent: 'center' }}>
                        {cantidad}
                      </span>
                      <button
                        onClick={() => setCantidad(c => Math.min(producto.stock, c + 1))}
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', width: '32px', height: '32px', cursor: 'pointer', fontFamily: 'DM Mono', borderRadius: '0 2px 2px 0' }}
                      >+</button>
                    </div>
                    <span style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700 }}>
                      = Q{(parseFloat(producto.precio) * cantidad).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    onClick={handleAgregar}
                    disabled={agregado}
                    style={{
                      background: agregado ? 'rgba(6,214,160,0.15)' : 'var(--accent)',
                      color: agregado ? 'var(--success)' : '#0a0b0e',
                      border: agregado ? '1px solid rgba(6,214,160,0.4)' : 'none',
                      borderRadius: '2px', fontFamily: 'Syne, sans-serif', fontWeight: 800,
                      fontSize: '0.8rem', letterSpacing: '0.15em', padding: '14px',
                      cursor: agregado ? 'default' : 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {agregado ? '✓ AGREGADO AL CARRITO' : 'AGREGAR AL CARRITO →'}
                  </button>

                  {count > 0 && (
                    <Link to="/carrito" style={{
                      display: 'block', textAlign: 'center', padding: '10px',
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      color: 'var(--accent)', textDecoration: 'none',
                      fontFamily: 'DM Mono', fontSize: '0.72rem', letterSpacing: '0.1em',
                      borderRadius: '2px',
                    }}>
                      Ver carrito ({count} {count === 1 ? 'producto' : 'productos'})
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Más productos de la misma categoría */}
      {!esStaff && masProductos.length > 0 && (
        <div style={{ marginTop: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '20px' }}>
            <h3 className="font-display font-bold" style={{ fontSize: '1.25rem', color: 'var(--text)', margin: 0 }}>
              También te puede interesar
            </h3>
            <span style={{ fontFamily: 'DM Mono', fontSize: '0.62rem', letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              {producto.categoria}
            </span>
          </div>
          <div className="r-scroll-productos">
            {masProductos.map(p => (
              <MasProductoCard key={p.id} p={p} agregar={agregar} navigate={navigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MasProductoCard({ p, agregar, navigate }) {
  const [imgErr, setImgErr] = useState(false)
  const [added,  setAdded]  = useState(false)

  const handleAdd = (e) => {
    e.stopPropagation()
    agregar({ producto_id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div
      onClick={() => navigate(`/producto/${p.id}`)}
      style={{
        flex: '0 0 200px', border: '1px solid var(--border)', borderRadius: '2px',
        background: 'var(--surface)', cursor: 'pointer', overflow: 'hidden',
        transition: 'border-color 0.15s', scrollSnapAlign: 'start',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ aspectRatio: '4/3', background: 'var(--surface-2)', overflow: 'hidden' }}>
        {!imgErr && getImagen(p.id) ? (
          <img
            src={getImagen(p.id)} alt={p.nombre}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'DM Mono', fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
              {p.categoria?.toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: '12px' }}>
        <p style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: '0.78rem', color: 'var(--text)', margin: '0 0 4px', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {p.nombre}
        </p>
        <p style={{ fontFamily: 'DM Mono', fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700, margin: '0 0 10px' }}>
          Q{parseFloat(p.precio).toFixed(2)}
        </p>
        <button
          onClick={handleAdd}
          disabled={added || p.stock === 0}
          style={{
            width: '100%', padding: '7px',
            background: added ? 'rgba(6,214,160,0.15)' : p.stock === 0 ? 'var(--border)' : 'var(--accent-dim)',
            border: added ? '1px solid rgba(6,214,160,0.4)' : `1px solid ${p.stock === 0 ? 'transparent' : 'rgba(200,255,71,0.3)'}`,
            color: added ? 'var(--success)' : p.stock === 0 ? 'var(--muted)' : 'var(--accent)',
            borderRadius: '2px', fontFamily: 'DM Mono', fontSize: '0.65rem',
            letterSpacing: '0.1em', cursor: added || p.stock === 0 ? 'default' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {added ? '✓ Agregado' : p.stock === 0 ? 'Agotado' : '+ Agregar'}
        </button>
      </div>
    </div>
  )
}
