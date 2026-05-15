import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'

const FORM_VACIO = { nombre: '', telefono: '', email: '', direccion: '' }

const labelStyle = {
  display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
  letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px',
}
const inputStyle = {
  background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)',
  borderRadius: '2px', fontFamily: 'DM Mono, monospace', fontSize: '0.82rem',
  padding: '9px 12px', outline: 'none', width: '100%',
}

export default function AdminClientes() {
  const [clientes,   setClientes]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [form,       setForm]       = useState(FORM_VACIO)
  const [editId,     setEditId]     = useState(null)
  const [errores,    setErrores]    = useState({})
  const [feedback,   setFeedback]   = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const cargarClientes = useCallback(() =>
    api.get('/clientes').then(({ data }) => setClientes(data)), [])

  useEffect(() => {
    api.get('/clientes')
      .then(({ data }) => setClientes(data))
      .finally(() => setLoading(false))
  }, [])

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Email inválido'
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
        nombre:    form.nombre.trim(),
        telefono:  form.telefono.trim() || null,
        email:     form.email.trim()    || null,
        direccion: form.direccion.trim() || null,
      }
      if (editId) {
        await api.put(`/clientes/${editId}`, payload)
        setFeedback({ ok: true, msg: 'Cliente actualizado' })
      } else {
        await api.post('/clientes', payload)
        setFeedback({ ok: true, msg: 'Cliente creado' })
      }
      setForm(FORM_VACIO)
      setEditId(null)
      cargarClientes()
    } catch (err) {
      setFeedback({ ok: false, msg: err.response?.data?.error || 'Error al guardar' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditar = (c) => {
    setForm({
      nombre:    c.nombre    || '',
      telefono:  c.telefono  || '',
      email:     c.email     || '',
      direccion: c.direccion || '',
    })
    setEditId(c.id)
    setErrores({})
    setFeedback(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar a "${nombre}"?`)) return
    try {
      await api.delete(`/clientes/${id}`)
      setFeedback({ ok: true, msg: 'Cliente eliminado' })
      cargarClientes()
      if (editId === id) { setForm(FORM_VACIO); setEditId(null) }
    } catch (err) {
      setFeedback({ ok: false, msg: err.response?.data?.error || 'Error al eliminar' })
    }
  }

  const handleCancelar = () => { setForm(FORM_VACIO); setEditId(null); setErrores({}); setFeedback(null) }

  const campo = (key, label, type = 'text') => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        style={{ ...inputStyle, borderColor: errores[key] ? 'var(--danger)' : 'var(--border)' }}
        onFocus={e => e.target.style.borderColor = errores[key] ? 'var(--danger)' : 'var(--accent)'}
        onBlur={e  => e.target.style.borderColor = errores[key] ? 'var(--danger)' : 'var(--border)'}
      />
      {errores[key] && <p style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', color: 'var(--danger)', margin: '4px 0 0' }}>{errores[key]}</p>}
    </div>
  )

  if (loading) return <div style={{ padding: '40px 32px' }}><p style={{ fontFamily: 'DM Mono', fontSize: '0.8rem', color: 'var(--muted)' }}>Cargando...</p></div>

  return (
    <div style={{ padding: '40px 32px' }}>
      <h2 className="font-display font-bold" style={{ fontSize: '2rem', color: 'var(--text)', margin: '0 0 32px' }}>
        {editId ? 'Editar Cliente' : 'Nuevo Cliente'}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '48px', alignItems: 'start' }}>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {campo('nombre',    'Nombre completo')}
          {campo('email',     'Correo electrónico', 'email')}
          {campo('telefono',  'Teléfono')}
          {campo('direccion', 'Dirección')}

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
              Clientes registrados
            </p>
            <span style={{ fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--accent)' }}>{clientes.length}</span>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  {['Nombre', 'Email', 'Teléfono', ''].map(h => (
                    <th key={h} style={{
                      padding: '9px 14px', fontFamily: 'DM Mono', fontSize: '0.6rem',
                      letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase',
                      fontWeight: 500, textAlign: 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientes.map((c, i) => (
                  <tr key={c.id} style={{
                    background: editId === c.id ? 'rgba(200,255,71,0.04)' : i % 2 === 0 ? 'var(--surface)' : 'var(--bg)',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: editId === c.id ? '2px solid var(--accent)' : '2px solid transparent',
                  }}>
                    <td style={{ padding: '9px 14px', color: 'var(--text)', fontWeight: 500 }}>{c.nombre}</td>
                    <td style={{ padding: '9px 14px', fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted)' }}>{c.email || '—'}</td>
                    <td style={{ padding: '9px 14px', fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--muted)' }}>{c.telefono || '—'}</td>
                    <td style={{ padding: '9px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => handleEditar(c)} style={{
                        background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
                        borderRadius: '2px', fontFamily: 'DM Mono', fontSize: '0.65rem', padding: '4px 10px',
                        cursor: 'pointer', marginRight: '6px',
                      }}>Editar</button>
                      <button onClick={() => handleEliminar(c.id, c.nombre)} style={{
                        background: 'none', border: '1px solid rgba(255,77,109,0.3)', color: 'var(--danger)',
                        borderRadius: '2px', fontFamily: 'DM Mono', fontSize: '0.65rem', padding: '4px 10px',
                        cursor: 'pointer',
                      }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
