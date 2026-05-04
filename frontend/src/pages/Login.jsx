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
      localStorage.setItem('token',    data.token)
      localStorage.setItem('username', data.username)
      localStorage.setItem('rol',      data.rol)
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
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}
      className="flex items-center justify-center relative overflow-hidden">

      {/* Grid de fondo */}
      <div className="absolute inset-0" style={{
        backgroundImage:
          'linear-gradient(var(--border) 1px, transparent 1px),' +
          'linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        opacity: 0.4,
      }} />

      {/* Glow central */}
      <div className="absolute" style={{
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(200,255,71,0.04) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div className="relative z-10 w-full max-w-sm px-6">

        {/* Logo */}
        <div className="mb-10 text-center">
          <p className="font-display font-bold text-6xl leading-none"
            style={{ color: 'var(--accent)', letterSpacing: '-2px' }}>
            TIENDA
          </p>
          <p className="font-display font-bold text-6xl leading-none"
            style={{ color: 'var(--text)', letterSpacing: '-2px' }}>
            TECH
          </p>
          <p className="font-data text-xs mt-4" style={{ color: 'var(--muted)', letterSpacing: '0.2em' }}>
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
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="font-data text-xs uppercase block mb-2"
                style={{ color: 'var(--muted)', letterSpacing: '0.15em' }}>
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
              <label className="font-data text-xs uppercase block mb-2"
                style={{ color: 'var(--muted)', letterSpacing: '0.15em' }}>
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
                background:   loading ? 'var(--border)' : 'var(--accent)',
                color:        '#0a0b0e',
                border:       'none',
                borderRadius: '2px',
                fontFamily:   'Syne, sans-serif',
                fontWeight:   800,
                fontSize:     '0.8rem',
                letterSpacing:'0.15em',
                width:        '100%',
                padding:      '14px',
                cursor:       loading ? 'not-allowed' : 'pointer',
                transition:   'opacity 0.2s',
                opacity:      loading ? 0.6 : 1,
              }}>
              {loading ? 'AUTENTICANDO...' : 'INGRESAR →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
