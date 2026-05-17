import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const labelStyle = {
  display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
  letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px',
}

export default function Carrito() {
  const { items, quitar, actualizarCantidad, limpiar, total, count } = useCart()
  const { auth } = useAuth()
  const navigate   = useNavigate()
  const clienteId  = parseInt(auth.cliente_id || '0')

  const [empleados,  setEmpleados]  = useState([])
  const [empleadoId, setEmpleadoId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resultado,  setResultado]  = useState(null)

  const [totalCompra, setTotalCompra] = useState(0)

  useEffect(() => {
    api.get('/empleados').then(({ data }) => setEmpleados(data))
  }, [])

  // Limpiar carrito cuando la compra es exitosa
  useEffect(() => {
    if (resultado && !resultado.rollback) {
      limpiar()
    }
  }, [resultado])

  const handleCheckout = async () => {
    if (!clienteId) {
      setResultado({ rollback: true, error: 'Tu cuenta no está vinculada a un cliente. Regístrate con rol "cliente".' })
      return
    }
    if (!empleadoId) {
      setResultado({ rollback: true, error: 'Selecciona el vendedor que te está atendiendo.' })
      return
    }
    // Guardar total y snapshot de items antes de cualquier cambio de estado
    setTotalCompra(items.reduce((acc, i) => acc + parseFloat(i.precio) * i.cantidad, 0))
    const itemsSnapshot = items.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad }))

    setSubmitting(true)
    setResultado(null)
    try {
      const { data } = await api.post('/ventas', {
        cliente_id:  clienteId,
        empleado_id: parseInt(empleadoId),
        items:       itemsSnapshot,
      })
      // Si el backend no devuelve venta_id (pg serialization edge case),
      // obtenerlo del historial como fallback
      let ventaId = data.venta_id
      if (!ventaId) {
        try {
          const { data: historial } = await api.get('/ventas')
          ventaId = historial[0]?.venta_id
        } catch { /* ignorar */ }
      }
      setResultado({ rollback: false, ...data, venta_id: ventaId })
    } catch (err) {
      const errData = err.response?.data || {}
      setResultado({
        rollback: true,
        error: errData.error || `Error ${err.response?.status ?? 'de conexión'}`,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (resultado && !resultado.rollback) {
    const totalMostrar = resultado.total || totalCompra || 0
    return (
      <div style={{ padding: '80px 32px', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          padding: '40px 32px', borderRadius: '2px',
          border: '1px solid rgba(6,214,160,0.35)',
          background: 'rgba(6,214,160,0.05)',
        }}>
          <p style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--success)', margin: '0 0 12px' }}>
            ✓ Venta #{resultado.venta_id} registrada
          </p>
          <p style={{ fontFamily: 'DM Mono', fontSize: '1.2rem', color: 'var(--success)', fontWeight: 700, margin: '0 0 28px' }}>
            Total: Q{parseFloat(totalMostrar).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </p>
          <Link to="/productos" style={{
            display: 'inline-block', background: 'var(--accent)', color: '#0a0b0e',
            textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '0.8rem', letterSpacing: '0.15em', padding: '13px 28px', borderRadius: '2px',
          }}>
            SEGUIR COMPRANDO →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 32px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Cabecera con botón de regreso */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/productos')}
          style={{ background: 'none', border: 'none', fontFamily: 'DM Mono', fontSize: '0.72rem', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        >
          ← Seguir comprando
        </button>
        <h2 className="font-display font-bold" style={{ fontSize: '2rem', color: 'var(--text)', margin: 0 }}>
          Mi Carrito
        </h2>
        {count > 0 && (
          <span className="font-data" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
            {count} {count === 1 ? 'producto' : 'productos'}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <p style={{ fontFamily: 'DM Mono', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '24px' }}>
            Tu carrito está vacío
          </p>
          <Link to="/productos" style={{
            display: 'inline-block', background: 'var(--surface-2)', color: 'var(--accent)',
            textDecoration: 'none', border: '1px solid var(--border)', fontFamily: 'DM Mono',
            fontSize: '0.75rem', letterSpacing: '0.1em', padding: '10px 20px', borderRadius: '2px',
          }}>
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="r-grid-carrito">

          {/* Items */}
          <div style={{ border: '1px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  {['Producto', 'Precio', 'Cant.', 'Subtotal', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', fontFamily: 'DM Mono', fontSize: '0.6rem',
                      letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase',
                      fontWeight: 500, textAlign: ['Precio', 'Cant.', 'Subtotal'].includes(h) ? 'right' : 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.producto_id} style={{
                    background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <td style={{ padding: '12px 14px', color: 'var(--text)', fontWeight: 500 }}>
                      {item.nombre}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--muted)' }}>
                      Q{parseFloat(item.precio).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1px' }}>
                        <button
                          onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', width: '28px', height: '28px', cursor: 'pointer', fontFamily: 'DM Mono', borderRadius: '2px 0 0 2px', fontSize: '1rem' }}
                        >−</button>
                        <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: 'none', borderRight: 'none', padding: '0 10px', height: '28px', display: 'flex', alignItems: 'center', fontFamily: 'DM Mono', fontSize: '0.82rem', color: 'var(--text)', minWidth: '36px', justifyContent: 'center' }}>
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', width: '28px', height: '28px', cursor: 'pointer', fontFamily: 'DM Mono', borderRadius: '0 2px 2px 0', fontSize: '1rem' }}
                        >+</button>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'DM Mono', color: 'var(--accent)', fontWeight: 700 }}>
                      Q{(parseFloat(item.precio) * item.cantidad).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        onClick={() => quitar(item.producto_id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem', padding: '4px 8px' }}
                      >✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Panel checkout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Resumen */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '2px', padding: '20px', background: 'var(--surface)' }}>
              <p style={{ ...labelStyle, marginBottom: '16px' }}>Resumen de orden</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {items.map(item => (
                  <div key={item.producto_id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Mono', fontSize: '0.72rem', color: 'var(--muted)' }}>
                    <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.nombre} ×{item.cantidad}
                    </span>
                    <span>Q{(parseFloat(item.precio) * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  Total
                </span>
                <span style={{ fontFamily: 'DM Mono', fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>
                  Q{total.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Vendedor */}
            <div>
              <label style={labelStyle}>Vendedor que te atiende</label>
              <select
                value={empleadoId}
                onChange={e => { setEmpleadoId(e.target.value); setResultado(null) }}
                style={{
                  background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)',
                  borderRadius: '2px', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem',
                  padding: '10px 14px', outline: 'none', width: '100%', cursor: 'pointer',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              >
                <option value="">— seleccionar —</option>
                {empleados.map(e => (
                  <option key={e.id} value={e.id}>{e.nombre} · {e.puesto}</option>
                ))}
              </select>
            </div>

            {/* Error rollback */}
            {resultado?.rollback && (
              <div style={{
                padding: '14px 16px', borderRadius: '2px',
                border: '1px solid rgba(255,77,109,0.35)',
                background: 'rgba(255,77,109,0.05)',
              }}>
                <p style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--danger)', margin: '0 0 6px' }}>
                  ⚠ ROLLBACK EJECUTADO
                </p>
                <p style={{ fontFamily: 'DM Mono', fontSize: '0.8rem', color: 'var(--danger)', margin: 0 }}>
                  {resultado.error}
                </p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={submitting}
              style={{
                background: submitting ? 'var(--border)' : 'var(--accent)',
                color: '#0a0b0e', border: 'none', borderRadius: '2px',
                fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.8rem',
                letterSpacing: '0.15em', padding: '16px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1, transition: 'opacity 0.2s',
              }}
            >
              {submitting ? 'PROCESANDO...' : 'CONFIRMAR COMPRA →'}
            </button>

            <button
              onClick={limpiar}
              style={{
                background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
                borderRadius: '2px', fontFamily: 'DM Mono', fontSize: '0.7rem',
                letterSpacing: '0.1em', padding: '10px', cursor: 'pointer',
              }}
            >
              Vaciar carrito
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
