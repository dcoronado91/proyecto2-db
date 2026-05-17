import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'

const FORM_VACIO = { nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '', proveedor_id: '' }

const labelStyle = {
  display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
  letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px',
}
const inputStyle = {
  background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)',
  borderRadius: '2px', fontFamily: 'DM Mono, monospace', fontSize: '0.82rem',
  padding: '9px 12px', outline: 'none', width: '100%',
}

export default function AdminProductos() {
  const [productos,   setProductos]   = useState([])
  const [categorias,  setCategorias]  = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [form,        setForm]        = useState(FORM_VACIO)
  const [editId,      setEditId]      = useState(null)
  const [errores,     setErrores]     = useState({})
  const [feedback,    setFeedback]    = useState(null)
  const [submitting,  setSubmitting]  = useState(false)

  const cargarProductos = useCallback(() =>
    api.get('/productos').then(({ data }) => setProductos(data)), [])

  useEffect(() => {
    Promise.all([
      api.get('/productos'),
      api.get('/categorias'),
      api.get('/proveedores'),
    ]).then(([p, c, pr]) => {
      setProductos(p.data)
      setCategorias(c.data)
      setProveedores(pr.data)
    }).finally(() => setLoading(false))
  }, [])

  const validar = () => {
    const e = {}
    if (!form.nombre.trim())       e.nombre      = 'Requerido'
    if (!form.precio || isNaN(parseFloat(form.precio)) || parseFloat(form.precio) <= 0)
                                   e.precio      = 'Debe ser mayor a 0'
    if (form.stock !== '' && (isNaN(parseInt(form.stock)) || parseInt(form.stock) < 0))
                                   e.stock       = 'Debe ser 0 o más'
    if (!form.categoria_id)        e.categoria_id  = 'Requerido'
    if (!form.proveedor_id)        e.proveedor_id  = 'Requerido'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return
    setSubmitting(true)
    setFeedback(null)
    try {
      const payload = {
        nombre:       form.nombre.trim(),
        descripcion:  form.descripcion.trim() || null,
        precio:       parseFloat(form.precio),
        stock:        parseInt(form.stock) || 0,
        categoria_id: parseInt(form.categoria_id),
        proveedor_id: parseInt(form.proveedor_id),
      }
      if (editId) {
        await api.put(`/productos/${editId}`, payload)
        setFeedback({ ok: true, msg: 'Producto actualizado' })
      } else {
        await api.post('/productos', payload)
        setFeedback({ ok: true, msg: 'Producto creado' })
      }
      setForm(FORM_VACIO)
      setEditId(null)
      cargarProductos()
    } catch (err) {
      setFeedback({ ok: false, msg: err.response?.data?.error || 'Error al guardar' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditar = (p) => {
    setForm({
      nombre:       p.nombre,
      descripcion:  p.descripcion || '',
      precio:       String(p.precio),
      stock:        String(p.stock),
      categoria_id: String(p.categoria_id),
      proveedor_id: String(p.proveedor_id),
    })
    setEditId(p.id)
    setErrores({})
    setFeedback(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return
    try {
      await api.delete(`/productos/${id}`)
      setFeedback({ ok: true, msg: 'Producto eliminado' })
      cargarProductos()
      if (editId === id) { setForm(FORM_VACIO); setEditId(null) }
    } catch (err) {
      setFeedback({ ok: false, msg: err.response?.data?.error || 'Error al eliminar' })
    }
  }

  const handleCancelar = () => { setForm(FORM_VACIO); setEditId(null); setErrores({}); setFeedback(null) }

  const campo = (key, label, type = 'text', extra = {}) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        style={{ ...inputStyle, borderColor: errores[key] ? 'var(--danger)' : 'var(--border)' }}
        onFocus={e => e.target.style.borderColor = errores[key] ? 'var(--danger)' : 'var(--accent)'}
        onBlur={e  => e.target.style.borderColor = errores[key] ? 'var(--danger)' : 'var(--border)'}
        {...extra}
      />
      {errores[key] && <p style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', color: 'var(--danger)', margin: '4px 0 0' }}>{errores[key]}</p>}
    </div>
  )

  if (loading) return <div style={{ padding: '40px 32px' }}><p style={{ fontFamily: 'DM Mono', fontSize: '0.8rem', color: 'var(--muted)' }}>Cargando...</p></div>

  return (
    <div style={{ padding: '40px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 className="font-display font-bold" style={{ fontSize: '2rem', color: 'var(--text)', margin: '0 0 32px' }}>
        {editId ? 'Editar Producto' : 'Nuevo Producto'}
      </h2>

      <div className="r-grid-admin">

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {campo('nombre', 'Nombre')}
          {campo('descripcion', 'Descripción')}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {campo('precio', 'Precio (Q)', 'number', { min: '0.01', step: '0.01' })}
            {campo('stock', 'Stock', 'number', { min: '0', step: '1' })}
          </div>

          <div>
            <label style={labelStyle}>Categoría</label>
            <select
              value={form.categoria_id}
              onChange={e => setForm({ ...form, categoria_id: e.target.value })}
              style={{ ...inputStyle, borderColor: errores.categoria_id ? 'var(--danger)' : 'var(--border)', cursor: 'pointer' }}
            >
              <option value="">— seleccionar —</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {errores.categoria_id && <p style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', color: 'var(--danger)', margin: '4px 0 0' }}>{errores.categoria_id}</p>}
          </div>

          <div>
            <label style={labelStyle}>Proveedor</label>
            <select
              value={form.proveedor_id}
              onChange={e => setForm({ ...form, proveedor_id: e.target.value })}
              style={{ ...inputStyle, borderColor: errores.proveedor_id ? 'var(--danger)' : 'var(--border)', cursor: 'pointer' }}
            >
              <option value="">— seleccionar —</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            {errores.proveedor_id && <p style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', color: 'var(--danger)', margin: '4px 0 0' }}>{errores.proveedor_id}</p>}
          </div>

          {feedback && (
            <div style={{
              padding: '10px 14px', borderRadius: '2px', fontFamily: 'DM Mono', fontSize: '0.75rem',
              background: feedback.ok ? 'rgba(6,214,160,0.06)' : 'rgba(255,77,109,0.06)',
              border: `1px solid ${feedback.ok ? 'rgba(6,214,160,0.3)' : 'rgba(255,77,109,0.3)'}`,
              color: feedback.ok ? 'var(--success)' : 'var(--danger)',
            }}>
              {feedback.ok ? '✓' : '⚠'} {feedback.msg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={submitting} style={{
              flex: 1, background: submitting ? 'var(--border)' : 'var(--accent)', color: '#0a0b0e',
              border: 'none', borderRadius: '2px', fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: '0.78rem', letterSpacing: '0.12em', padding: '12px', cursor: submitting ? 'not-allowed' : 'pointer',
            }}>
              {submitting ? 'GUARDANDO...' : editId ? 'ACTUALIZAR →' : 'CREAR →'}
            </button>
            {editId && (
              <button type="button" onClick={handleCancelar} style={{
                background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)',
                borderRadius: '2px', fontFamily: 'DM Mono', fontSize: '0.72rem', padding: '12px 16px', cursor: 'pointer',
              }}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Tabla */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
            <p style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase', margin: 0 }}>
              Productos registrados
            </p>
            <span style={{ fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--accent)' }}>{productos.length}</span>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  {['Nombre', 'Categoría', 'Precio', 'Stock', ''].map(h => (
                    <th key={h} style={{
                      padding: '9px 14px', fontFamily: 'DM Mono', fontSize: '0.6rem',
                      letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase',
                      fontWeight: 500, textAlign: ['Precio', 'Stock'].includes(h) ? 'right' : 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productos.map((p, i) => (
                  <tr key={p.id} style={{
                    background: editId === p.id ? 'rgba(200,255,71,0.04)' : i % 2 === 0 ? 'var(--surface)' : 'var(--bg)',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: editId === p.id ? '2px solid var(--accent)' : '2px solid transparent',
                  }}>
                    <td style={{ padding: '9px 14px', color: 'var(--text)', fontWeight: 500 }}>{p.nombre}</td>
                    <td style={{ padding: '9px 14px', fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted)' }}>{p.categoria}</td>
                    <td style={{ padding: '9px 14px', textAlign: 'right', fontFamily: 'DM Mono', color: 'var(--accent)' }}>
                      Q{parseFloat(p.precio).toFixed(2)}
                    </td>
                    <td style={{ padding: '9px 14px', textAlign: 'right', fontFamily: 'DM Mono', color: p.stock < 8 ? 'var(--danger)' : p.stock < 20 ? 'var(--warning)' : 'var(--success)' }}>
                      {p.stock}
                    </td>
                    <td style={{ padding: '9px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => handleEditar(p)} style={{
                        background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
                        borderRadius: '2px', fontFamily: 'DM Mono', fontSize: '0.65rem', padding: '4px 10px',
                        cursor: 'pointer', marginRight: '6px',
                      }}>Editar</button>
                      <button onClick={() => handleEliminar(p.id, p.nombre)} style={{
                        background: 'none', border: '1px solid rgba(255,77,109,0.3)', color: 'var(--danger)',
                        borderRadius: '2px', fontFamily: 'DM Mono', fontSize: '0.65rem', padding: '4px 10px',
                        cursor: 'pointer',
                      }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productos.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '0.8rem' }}>
                Sin productos registrados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
