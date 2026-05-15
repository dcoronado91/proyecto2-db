import { describe, it, expect } from 'vitest'

// ─── authReducer (copiado para tests aislados) ─────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':  return { ...state, ...action.payload }
    case 'LOGOUT': return { token: null, username: null, rol: null, cliente_id: null }
    default:       return state
  }
}

describe('authReducer', () => {
  it('LOGIN guarda token y username en el estado', () => {
    const estado = { token: null, username: null, rol: null, cliente_id: null }
    const payload = { token: 'abc123', username: 'juan', rol: 'vendedor', cliente_id: null }
    const nuevo = authReducer(estado, { type: 'LOGIN', payload })
    expect(nuevo.token).toBe('abc123')
    expect(nuevo.username).toBe('juan')
    expect(nuevo.rol).toBe('vendedor')
  })

  it('LOGOUT limpia todos los campos de sesión', () => {
    const estado = { token: 'abc123', username: 'juan', rol: 'vendedor', cliente_id: '5' }
    const nuevo = authReducer(estado, { type: 'LOGOUT' })
    expect(nuevo.token).toBeNull()
    expect(nuevo.username).toBeNull()
    expect(nuevo.rol).toBeNull()
  })

  it('acción desconocida devuelve el estado sin cambios', () => {
    const estado = { token: 'abc', username: 'x', rol: 'admin', cliente_id: null }
    const nuevo = authReducer(estado, { type: 'NOOP' })
    expect(nuevo).toEqual(estado)
  })
})

// ─── Filtro de productos ────────────────────────────────────────────────────
function filtrarProductos(productos, busqueda) {
  const q = busqueda.toLowerCase()
  return productos.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    p.categoria.toLowerCase().includes(q)
  )
}

describe('filtrarProductos', () => {
  const lista = [
    { id: 1, nombre: 'Laptop Dell Inspiron', categoria: 'Laptops' },
    { id: 2, nombre: 'Mouse Logitech MX',    categoria: 'Mouses'  },
    { id: 3, nombre: 'Monitor Samsung 27"',  categoria: 'Monitores' },
  ]

  it('filtra por nombre (case insensitive)', () => {
    const resultado = filtrarProductos(lista, 'dell')
    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe(1)
  })

  it('filtra por categoría', () => {
    const resultado = filtrarProductos(lista, 'monitores')
    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe(3)
  })

  it('devuelve toda la lista si busqueda está vacía', () => {
    const resultado = filtrarProductos(lista, '')
    expect(resultado).toHaveLength(3)
  })

  it('devuelve lista vacía si no hay coincidencias', () => {
    const resultado = filtrarProductos(lista, 'zzznada')
    expect(resultado).toHaveLength(0)
  })
})

// ─── Cálculo de totales de venta ────────────────────────────────────────────
function calcularTotal(items) {
  return items.reduce((acc, i) => acc + parseFloat(i.precio) * i.cantidad, 0)
}

describe('calcularTotal', () => {
  it('calcula correctamente con un item', () => {
    const items = [{ precio: '1200.00', cantidad: 3 }]
    expect(calcularTotal(items)).toBe(3600)
  })

  it('calcula correctamente con varios items', () => {
    const items = [
      { precio: '500.00', cantidad: 2 },
      { precio: '250.50', cantidad: 4 },
    ]
    expect(calcularTotal(items)).toBeCloseTo(2002, 1)
  })

  it('devuelve 0 con lista vacía', () => {
    expect(calcularTotal([])).toBe(0)
  })
})
