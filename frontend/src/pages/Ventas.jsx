import { useEffect, useState } from 'react'
import api from '../api/axios'

const selectStyle = {
  background:   'var(--surface)',
  border:       '1px solid var(--border)',
  color:        'var(--text)',
  borderRadius: '2px',
  fontFamily:   'DM Mono, monospace',
  fontSize:     '0.8rem',
  padding:      '10px 14px',
  outline:      'none',
  width:        '100%',
  cursor:       'pointer',
}

const labelStyle = {
  display:       'block',
  fontFamily:    'DM Mono, monospace',
  fontSize:      '0.65rem',
  letterSpacing: '0.15em',
  color:         'var(--muted)',
  textTransform: 'uppercase',
  marginBottom:  '8px',
}

export default function Ventas() {
  const [ventas,    setVentas]    = useState([])
  const [clientes,  setClientes]  = useState([])
  const [empleados, setEmpleados] = useState([])
  const [productos, setProductos] = useState([])
  const [loading,   setLoading]   = useState(true)

  const [form,       setForm]       = useState({ cliente_id: '', empleado_id: '' })
  const [items,      setItems]      = useState([])
  const [itemActual, setItemActual] = useState({ producto_id: '', cantidad: 1 })

  const [resultado,  setResultado]  = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const recargarVentas = () =>
    api.get('/ventas').then(({ data }) => setVentas(data))

  useEffect(() => {
    Promise.all([
      api.get('/ventas'),
      api.get('/clientes'),
      api.get('/empleados'),
      api.get('/productos'),
    ]).then(([v, c, e, p]) => {
      setVentas(v.data)
      setClientes(c.data)
      setEmpleados(e.data)
      setProductos(p.data)
    }).finally(() => setLoading(false))
  }, [])

  const agregarItem = () => {
    if (!itemActual.producto_id || parseInt(itemActual.cantidad) < 1) return
    const pid  = parseInt(itemActual.producto_id)
    const cant = parseInt(itemActual.cantidad)
    const prod = productos.find(p => p.id === pid)
    setItems(prev => {
      const existe = prev.find(i => i.producto_id === pid)
      if (existe) {
        return prev.map(i => i.producto_id === pid
          ? { ...i, cantidad: i.cantidad + cant }
          : i)
      }
      return [...prev, { producto_id: pid, cantidad: cant, nombre: prod.nombre, precio: prod.precio, stock: prod.stock }]
    })
    setItemActual({ producto_id: '', cantidad: 1 })
  }

  const quitarItem = (pid) => setItems(prev => prev.filter(i => i.producto_id !== pid))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.cliente_id || !form.empleado_id || !items.length) return
    setSubmitting(true)
    setResultado(null)
    try {
      const { data } = await api.post('/ventas', {
        cliente_id:  parseInt(form.cliente_id),
        empleado_id: parseInt(form.empleado_id),
        items: items.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      })
      setResultado({ rollback: false, ...data })
      setForm({ cliente_id: '', empleado_id: '' })
      setItems([])
      recargarVentas()
    } catch (err) {
      setResultado(err.response?.data || { rollback: true, error: 'Error de conexión' })
    } finally {
      setSubmitting(false)
    }
  }

  const totalEstimado = items.reduce((acc, i) => acc + parseFloat(i.precio) * i.cantidad, 0)

  if (loading) return (
    <div style={{ padding: '40px 32px' }}>
      <p className="font-data text-sm" style={{ color: 'var(--muted)' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ padding: '40px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>

      {/* ── Panel izquierdo: Formulario ── */}
      <div>
        <h2 className="font-display font-bold" style={{ fontSize: '2rem', color: 'var(--text)', margin: '0 0 28px' }}>
          Nueva Venta
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Cliente */}
          <div>
            <label style={labelStyle}>Cliente</label>
            <select value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })} required style={selectStyle}>
              <option value="">— seleccionar —</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {/* Empleado */}
          <div>
            <label style={labelStyle}>Empleado</label>
            <select value={form.empleado_id} onChange={e => setForm({ ...form, empleado_id: e.target.value })} required style={selectStyle}>
              <option value="">— seleccionar —</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre} · {e.puesto}</option>)}
            </select>
          </div>

          {/* Agregar producto */}
          <div>
            <label style={labelStyle}>Agregar Producto</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={itemActual.producto_id}
                onChange={e => setItemActual({ ...itemActual, producto_id: e.target.value })}
                style={{ ...selectStyle, flex: 1 }}
              >
                <option value="">— producto —</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}  (stock: {p.stock})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={itemActual.cantidad}
                onChange={e => setItemActual({ ...itemActual, cantidad: e.target.value })}
                style={{ ...selectStyle, width: '76px', textAlign: 'center' }}
              />
              <button
                type="button"
                onClick={agregarItem}
                style={{
                  background:    'var(--surface-2)',
                  border:        '1px solid var(--border)',
                  color:         'var(--accent)',
                  borderRadius:  '2px',
                  fontFamily:    'DM Mono',
                  fontSize:      '1.2rem',
                  width:         '44px',
                  flexShrink:    0,
                  cursor:        'pointer',
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Tabla de items */}
          {items.length > 0 && (
            <div style={{ border: '1px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                    {['Producto', 'Cant.', 'Precio', 'Subtotal', ''].map(h => (
                      <th key={h} style={{
                        padding:       '8px 12px',
                        fontFamily:    'DM Mono',
                        fontSize:      '0.62rem',
                        letterSpacing: '0.12em',
                        color:         'var(--muted)',
                        textTransform: 'uppercase',
                        fontWeight:    500,
                        textAlign:     ['Cant.', 'Precio', 'Subtotal'].includes(h) ? 'right' : 'left',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.producto_id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                      <td style={{ padding: '8px 12px', color: 'var(--text)', fontWeight: 500 }}>{item.nombre}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'DM Mono', color: 'var(--muted)' }}>{item.cantidad}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'DM Mono', color: 'var(--muted)' }}>
                        Q{parseFloat(item.precio).toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'DM Mono', color: 'var(--accent)', fontWeight: 500 }}>
                        Q{(parseFloat(item.precio) * item.cantidad).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => quitarItem(item.producto_id)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{
                padding:      '10px 12px',
                background:   'var(--surface-2)',
                borderTop:    '1px solid var(--border)',
                textAlign:    'right',
                fontFamily:   'DM Mono',
              }}>
                <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--muted)', marginRight: '12px', textTransform: 'uppercase' }}>
                  Total estimado
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: 700 }}>
                  Q{totalEstimado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Resultado de la transacción */}
          {resultado && (
            <div style={{
              padding:      '16px 20px',
              borderRadius: '2px',
              border:       `1px solid ${resultado.rollback ? 'rgba(255,77,109,0.35)' : 'rgba(6,214,160,0.35)'}`,
              background:   resultado.rollback ? 'rgba(255,77,109,0.05)' : 'rgba(6,214,160,0.05)',
            }}>
              {resultado.rollback ? (
                <>
                  <p style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--danger)', margin: '0 0 8px' }}>
                    ⚠ ROLLBACK EJECUTADO — Transacción revertida
                  </p>
                  <p style={{ fontFamily: 'DM Mono', fontSize: '0.82rem', color: 'var(--danger)', margin: 0 }}>
                    {resultado.error}
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--success)', margin: '0 0 8px' }}>
                    ✓ COMMIT — Venta #{resultado.venta_id} registrada
                  </p>
                  <p style={{ fontFamily: 'DM Mono', fontSize: '0.82rem', color: 'var(--success)', margin: 0 }}>
                    Total: Q{parseFloat(resultado.total).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </p>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !items.length}
            style={{
              background:    submitting || !items.length ? 'var(--border)' : 'var(--accent)',
              color:         '#0a0b0e',
              border:        'none',
              borderRadius:  '2px',
              fontFamily:    'Syne, sans-serif',
              fontWeight:    800,
              fontSize:      '0.8rem',
              letterSpacing: '0.15em',
              padding:       '14px',
              cursor:        submitting || !items.length ? 'not-allowed' : 'pointer',
              opacity:       submitting || !items.length ? 0.5 : 1,
              transition:    'opacity 0.2s',
            }}
          >
            {submitting ? 'PROCESANDO...' : 'REGISTRAR VENTA →'}
          </button>
        </form>
      </div>

      {/* ── Panel derecho: Historial ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '28px' }}>
          <h2 className="font-display font-bold" style={{ fontSize: '2rem', color: 'var(--text)', margin: 0 }}>
            Historial
          </h2>
          <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>
            {ventas.length} ventas
          </span>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                {['#', 'Fecha', 'Cliente', 'Empleado', 'Total'].map(h => (
                  <th key={h} style={{
                    padding:       '10px 14px',
                    fontFamily:    'DM Mono',
                    fontSize:      '0.62rem',
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
              {ventas.map((v, i) => (
                <tr key={v.venta_id} style={{
                  background:   i % 2 === 0 ? 'var(--surface)' : 'var(--bg)',
                  borderBottom: '1px solid var(--border)',
                  transition:   'background 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--surface)' : 'var(--bg)'}
                >
                  <td style={{ padding: '10px 14px', fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted)' }}>
                    {v.venta_id}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted)' }}>
                    {new Date(v.fecha).toLocaleDateString('es-GT')}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text)', fontWeight: 500 }}>
                    {v.cliente}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted)' }}>
                    {v.empleado}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'DM Mono', color: 'var(--accent)', fontWeight: 500 }}>
                    Q{parseFloat(v.total).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ventas.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '0.8rem' }}>
              Sin ventas registradas
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
