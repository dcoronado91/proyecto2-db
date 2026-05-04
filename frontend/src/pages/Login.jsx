import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Login() {
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('token',      data.token)
      localStorage.setItem('username',  data.username)
      localStorage.setItem('rol',       data.rol)
      localStorage.setItem('cliente_id', data.cliente_id ?? '')
      navigate('/productos')
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div style={{
      background:      'var(--bg)',
      minHeight:       '100vh',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      position:        'relative',
      overflow:        'hidden',
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

      {/* Glow central */}
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
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <p style={{
            fontFamily:   'Syne, sans-serif',
            fontWeight:   800,
            fontSize:     '3.5rem',
            lineHeight:   1,
            color:        'var(--accent)',
            letterSpacing:'-2px',
            margin:       0,
          }}>
            TIENDA
          </p>
          <p style={{
            fontFamily:   'Syne, sans-serif',
            fontWeight:   800,
            fontSize:     '3.5rem',
            lineHeight:   1,
            color:        'var(--text)',
            letterSpacing:'-2px',
            margin:       0,
          }}>
            TECH
          </p>
          <p style={{
            fontFamily:   'DM Mono, monospace',
            fontSize:     '0.7rem',
            marginTop:    '16px',
            color:        'var(--muted)',
            letterSpacing:'0.2em',
          }}>
            SISTEMA DE GESTIÓN — v1.0
          </p>
        </div>

        {/* Formulario */}
        <div style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: '2px',
          padding:      '32px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div>
              <label style={{
                display:       'block',
                fontFamily:    'DM Mono, monospace',
                fontSize:      '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color:         'var(--muted)',
                marginBottom:  '8px',
              }}>
                Usuario
              </label>
              <input
                type="text"
                required
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                style={inputStyle}
                onFocus={e  => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e   => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{
                display:       'block',
                fontFamily:    'DM Mono, monospace',
                fontSize:      '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color:         'var(--muted)',
                marginBottom:  '8px',
              }}>
                Contraseña
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={inputStyle}
                onFocus={e  => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e   => e.target.style.borderColor = 'var(--border)'}
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
              {loading ? 'AUTENTICANDO...' : 'INGRESAR →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
