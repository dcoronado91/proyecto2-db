import { useEffect, useState } from 'react'
import api from '../api/axios'

const thStyle = {
  padding:       '10px 16px',
  fontFamily:    'DM Mono, monospace',
  fontSize:      '0.62rem',
  letterSpacing: '0.12em',
  color:         'var(--muted)',
  textTransform: 'uppercase',
  fontWeight:    500,
  textAlign:     'left',
}

const tdStyle = {
  padding:    '10px 16px',
  fontFamily: 'DM Mono, monospace',
  fontSize:   '0.78rem',
  color:      'var(--muted)',
}

function ReportePanel({ titulo, tag, children, loading }) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <h3 className="font-display font-bold" style={{ fontSize: '1.35rem', color: 'var(--text)', margin: 0 }}>
          {titulo}
        </h3>
        <span style={{
          fontFamily:    'DM Mono, monospace',
          fontSize:      '0.6rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color:         'var(--accent)',
          border:        '1px solid rgba(200,255,71,0.3)',
          borderRadius:  '2px',
          padding:       '3px 8px',
        }}>
          {tag}
        </span>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        {loading
          ? <div style={{ padding: '24px 16px', fontFamily: 'DM Mono', fontSize: '0.8rem', color: 'var(--muted)' }}>Cargando...</div>
          : children
        }
      </div>
    </div>
  )
}

export default function Reportes() {
  const [stockBajo,     setStockBajo]     = useState([])
  const [mejoresClientes, setMejoresClientes] = useState([])
  const [rendimiento,   setRendimiento]   = useState([])
  const [masVendidos,   setMasVendidos]   = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reportes/stock-bajo'),
      api.get('/reportes/mejores-clientes'),
      api.get('/reportes/rendimiento-empleados'),
      api.get('/reportes/productos-mas-vendidos'),
    ]).then(([sb, mc, re, pmv]) => {
      setStockBajo(sb.data)
      setMejoresClientes(mc.data)
      setRendimiento(re.data)
      setMasVendidos(pmv.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '40px 32px', maxWidth: '960px' }}>

      <h2 className="font-display font-bold" style={{ fontSize: '2rem', color: 'var(--text)', margin: '0 0 40px' }}>
        Reportes
      </h2>

      {/* 1. Stock bajo — SUBQUERY */}
      <ReportePanel titulo="Stock Bajo" tag="Subconsulta" loading={loading}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle}>Producto</th>
              <th style={thStyle}>Categoría</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Stock</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Precio</th>
            </tr>
          </thead>
          <tbody>
            {stockBajo.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 500 }}>{r.nombre}</td>
                <td style={tdStyle}>{r.categoria}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: r.stock < 8 ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>
                  {r.stock}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--accent)' }}>
                  Q{parseFloat(r.precio).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stockBajo.length === 0 && !loading && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '0.8rem' }}>
            Sin resultados
          </div>
        )}
      </ReportePanel>

      {/* 2. Mejores clientes — SUBQUERY */}
      <ReportePanel titulo="Mejores Clientes" tag="Subconsulta" loading={loading}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Email</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total Compras</th>
            </tr>
          </thead>
          <tbody>
            {mejoresClientes.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 500 }}>{r.cliente}</td>
                <td style={tdStyle}>{r.email}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>
                  Q{parseFloat(r.total_compras).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {mejoresClientes.length === 0 && !loading && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '0.8rem' }}>
            Sin resultados — se necesitan más ventas registradas
          </div>
        )}
      </ReportePanel>

      {/* 3. Rendimiento empleados — GROUP BY + HAVING */}
      <ReportePanel titulo="Rendimiento de Empleados" tag="GROUP BY · HAVING" loading={loading}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle}>Empleado</th>
              <th style={thStyle}>Puesto</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Ventas</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total Vendido</th>
            </tr>
          </thead>
          <tbody>
            {rendimiento.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 500 }}>{r.empleado}</td>
                <td style={tdStyle}>{r.puesto}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{r.num_ventas}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>
                  Q{parseFloat(r.total_vendido).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rendimiento.length === 0 && !loading && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '0.8rem' }}>
            Sin empleados con ventas &gt; Q5,000.00
          </div>
        )}
      </ReportePanel>

      {/* 4. Productos más vendidos — CTE */}
      <ReportePanel titulo="Productos Más Vendidos" tag="CTE" loading={loading}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle}>Producto</th>
              <th style={thStyle}>Categoría</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Unidades</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {masVendidos.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 500 }}>{r.producto}</td>
                <td style={tdStyle}>{r.categoria}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{r.unidades_vendidas}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>
                  Q{parseFloat(r.ingresos_total).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {masVendidos.length === 0 && !loading && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '0.8rem' }}>
            Sin ventas registradas aún
          </div>
        )}
      </ReportePanel>

    </div>
  )
}
