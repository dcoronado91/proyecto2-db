import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

const inputStyle = {
  background:   'var(--bg)',
  border:       '1px solid var(--border)',
  color:        'var(--text)',
  borderRadius: '2px',
  fontFamily:   'DM Mono, monospace',
  fontSize:     '0.875rem',
  outline:      'none',
  width:        '100%',
  padding:      '12px 16px',
  transition:   'border-color 0.2s',
}

const labelStyle = {
  display:       'block',
  fontFamily:    'DM Mono, monospace',
  fontSize:      '0.65rem',
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  color:         'var(--muted)',
  marginBottom:  '8px',
}

export default function Register() {
  const [form,    setForm]    = useState({ username: '', password: '', nombre: '', email: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [ok,      setOk]      = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', { ...form, rol: 'cliente' })
      setOk(true)
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background:     'var(--bg)',
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      position:       'relative',
      overflow:       'hidden',
    }}>

      {/* Grid de fondo */}
      <div style={{
        position:        'absolute',
        inset:           0,
        backgroundImage:
          'linear-gradient(var(--border) 1px, transparent 1px),' +
          'linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize:  '48px 48px',
        opacity:         0.4,
        pointerEvents:   'none',
      }} />

      {/* Glow */}
      <div style={{
        position:      'absolute',
        width:         '500px',
        height:        '500px',
        background:    'radial-gradient(circle, rgba(200,255,71,0.04) 0%, transparent 70%)',
        top:           '50%',
        left:          '50%',
        transform:     'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '380px', padding: '0 24px' }}>

        {/* Logo */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '3.5rem', lineHeight: 1, color: 'var(--accent)', letterSpacing: '-2px', margin: 0 }}>
            TIENDA
          </p>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '3.5rem', lineHeight: 1, color: 'var(--text)', letterSpacing: '-2px', margin: 0 }}>
            TECH
          </p>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', marginTop: '12px', color: 'var(--muted)', letterSpacing: '0.2em' }}>
            CREAR CUENTA DE CLIENTE
          </p>
        </div>

        {/* Formulario */}
        <div style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: '2px',
          padding:      '32px',
        }}>
          {ok ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--success)', marginBottom: '8px' }}>
                ✓ Cuenta creada
              </p>
              <p style={{ fontFamily: 'DM Mono', fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>
                Redirigiendo al login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <div>
                <label style={labelStyle}>Correo electrónico</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <div>
                <label style={labelStyle}>Usuario</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <div>
                <label style={labelStyle}>Contraseña</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {error && (
                <div style={{
                  background:   'rgba(255,77,109,0.08)',
                  border:       '1px solid rgba(255,77,109,0.25)',
                  borderRadius: '2px',
                  color:        'var(--danger)',
                  padding:      '10px 14px',
                  fontFamily:   'DM Mono, monospace',
                  fontSize:     '0.75rem',
                }}>
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background:    loading ? 'var(--border)' : 'var(--accent)',
                  color:         '#0a0b0e',
                  border:        'none',
                  borderRadius:  '2px',
                  fontFamily:    'Syne, sans-serif',
                  fontWeight:    800,
                  fontSize:      '0.8rem',
                  letterSpacing: '0.15em',
                  width:         '100%',
                  padding:       '14px',
                  cursor:        loading ? 'not-allowed' : 'pointer',
                  transition:    'opacity 0.2s',
                  opacity:       loading ? 0.6 : 1,
                }}>
                {loading ? 'REGISTRANDO...' : 'CREAR CUENTA →'}
              </button>
            </form>
          )}
        </div>

        {/* Link al login */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--muted)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Iniciar sesión
          </Link>
        </p>

      </div>
    </div>
  )
}
