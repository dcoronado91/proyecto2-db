import { createContext, useContext, useReducer, useCallback } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existe = state.find(i => i.producto_id === action.payload.producto_id)
      if (existe) {
        return state.map(i =>
          i.producto_id === action.payload.producto_id
            ? { ...i, cantidad: i.cantidad + (action.payload.cantidad || 1) }
            : i
        )
      }
      return [...state, { ...action.payload, cantidad: action.payload.cantidad || 1 }]
    }
    case 'REMOVE':
      return state.filter(i => i.producto_id !== action.payload)
    case 'UPDATE_QTY':
      if (action.payload.cantidad < 1)
        return state.filter(i => i.producto_id !== action.payload.producto_id)
      return state.map(i =>
        i.producto_id === action.payload.producto_id
          ? { ...i, cantidad: action.payload.cantidad }
          : i
      )
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [])

  const agregar = useCallback((producto) => {
    dispatch({ type: 'ADD', payload: producto })
  }, [])

  const quitar = useCallback((producto_id) => {
    dispatch({ type: 'REMOVE', payload: producto_id })
  }, [])

  const actualizarCantidad = useCallback((producto_id, cantidad) => {
    dispatch({ type: 'UPDATE_QTY', payload: { producto_id, cantidad } })
  }, [])

  const limpiar = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const total = items.reduce((acc, i) => acc + parseFloat(i.precio) * i.cantidad, 0)
  const count = items.reduce((acc, i) => acc + i.cantidad, 0)

  return (
    <CartContext.Provider value={{ items, agregar, quitar, actualizarCantidad, limpiar, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext)
