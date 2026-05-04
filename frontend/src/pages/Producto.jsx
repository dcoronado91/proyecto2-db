import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { getImagen } from '../data/imagenes'

const ROLES_STAFF = ['admin', 'gerente', 'vendedor', 'cajero']

export default function Producto() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const rol       = localStorage.getItem('rol') || ''
  const esStaff   = ROLES_STAFF.includes(rol)

  const [producto,  setProducto]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [imgError,  setImgError]  = useState(false)

  // Estado compra (solo clientes)
  const [cantidad,   setCantidad]   = useState(1)
  const [comprando,  setComprando]  = useState(false)
  const [resultado,  setResultado]  = useState(null)

  useEffect(() => {
    api.get(`/productos/${id}`)
      .then(({ data }) => setProducto(data))
      .catch(() => setError('Producto no encontrado'))
      .finally(() => setLoading(false))
  }, [id])

  const handleComprar = async () => {
    setComprando(true)
    setResultado(null)
    try {
      const { data } = await api.post('/ventas', {
        cliente_id:  1,
        empleado_id: 1,
        items: [{ producto_id: parseInt(id), cantidad }],
      })
      setResultado({ ok: true, venta_id: data.venta_id, total: data.total })
      setProducto(prev => ({ ...prev, stock: prev.stock - cantidad }))
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al procesar'
      setResultado({ ok: false, error: msg })
    } finally {
      setComprando(false)
    }
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
    <div style={{ padding: '40px 32px', maxWidth: '960px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <button
          onClick={() => navigate('/productos')}
          style={{ background: 'none', border: 'none', fontFamily: 'DM Mono', fontSize: '0.72rem', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}
        >
          Productos
        </button>
        <span style={{ color: 'var(--border)', fontFamily: 'DM Mono', fontSize: '0.72rem' }}>›</span>
        <span style={{ fontFamily: 'DM Mono', fontSize: '0.72rem', color: 'var(--accent)' }}>
          {producto.nombre}
        </span>
      </div>

      {/* Layout principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>

        {/* Imagen */}
        <div style={{
          borderRadius: '2px',
          overflow:     'hidden',
          border:       '1px solid var(--border)',
          background:   'var(--surface-2)',
          aspectRatio:  '4/3',
        }}>
          {imgError || !getImagen(parseInt(id)) ? (
            <div style={{
              width: '100%', height: '100%', minHeight: '320px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface-2)',
            }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.12em' }}>
                {producto.categoria?.toUpperCase()}
              </span>
            </div>
          ) : (
            <img
              src={getImagen(parseInt(id))}
              alt={producto.nombre}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Categoría */}
          <span style={{
            fontFamily:    'DM Mono, monospace',
            fontSize:      '0.65rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         'var(--accent)',
            border:        '1px solid rgba(200,255,71,0.3)',
            borderRadius:  '2px',
            padding:       '3px 10px',
            alignSelf:     'flex-start',
          }}>
            {producto.categoria}
          </span>

          {/* Nombre */}
          <h1 className="font-display font-bold" style={{ fontSize: '1.75rem', color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
            {producto.nombre}
          </h1>

          {/* Descripción */}
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.82rem', color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
            {producto.descripcion}
          </p>

          {/* Proveedor */}
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'var(--muted)', margin: 0 }}>
            Proveedor: <span style={{ color: 'var(--text)' }}>{producto.proveedor}</span>
          </p>

          {/* Precio + Stock */}
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
                    background:    'var(--accent)',
                    color:         '#0a0b0e',
                    border:        'none',
                    borderRadius:  '2px',
                    fontFamily:    'Syne, sans-serif',
                    fontWeight:    800,
                    fontSize:      '0.8rem',
                    letterSpacing: '0.15em',
                    padding:       '14px',
                    cursor:        'pointer',
                  }}
                >
                  REGISTRAR VENTA →
                </button>
              ) : (
                <>
                  {/* Panel de compra para clientes */}
                  {!resultado ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                        onClick={handleComprar}
                        disabled={comprando}
                        style={{
                          background:    comprando ? 'var(--border)' : 'var(--accent)',
                          color:         '#0a0b0e',
                          border:        'none',
                          borderRadius:  '2px',
                          fontFamily:    'Syne, sans-serif',
                          fontWeight:    800,
                          fontSize:      '0.8rem',
                          letterSpacing: '0.15em',
                          padding:       '14px',
                          cursor:        comprando ? 'not-allowed' : 'pointer',
                          opacity:       comprando ? 0.6 : 1,
                        }}
                      >
                        {comprando ? 'PROCESANDO...' : 'COMPRAR AHORA →'}
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      padding:      '16px 20px',
                      borderRadius: '2px',
                      border:       `1px solid ${resultado.ok ? 'rgba(6,214,160,0.35)' : 'rgba(255,77,109,0.35)'}`,
                      background:   resultado.ok ? 'rgba(6,214,160,0.05)' : 'rgba(255,77,109,0.05)',
                    }}>
                      {resultado.ok ? (
                        <>
                          <p style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--success)', margin: '0 0 6px' }}>
                            ✓ Compra registrada — Orden #{resultado.venta_id}
                          </p>
                          <p style={{ fontFamily: 'DM Mono', fontSize: '0.8rem', color: 'var(--success)', margin: 0 }}>
                            Total: Q{parseFloat(resultado.total).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                          </p>
                        </>
                      ) : (
                        <>
                          <p style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--danger)', margin: '0 0 6px' }}>
                            ⚠ No se pudo completar
                          </p>
                          <p style={{ fontFamily: 'DM Mono', fontSize: '0.8rem', color: 'var(--danger)', margin: 0 }}>
                            {resultado.error}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
