import { createContext, useContext, useReducer, useCallback } from 'react'

const AuthContext = createContext(null)

const initialState = {
  token:      localStorage.getItem('token')      || null,
  username:   localStorage.getItem('username')   || null,
  rol:        localStorage.getItem('rol')        || null,
  cliente_id: localStorage.getItem('cliente_id') || null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, ...action.payload }
    case 'LOGOUT':
      return { token: null, username: null, rol: null, cliente_id: null }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [auth, dispatch] = useReducer(authReducer, initialState)

  const login = useCallback((data) => {
    localStorage.setItem('token',      data.token)
    localStorage.setItem('username',   data.username)
    localStorage.setItem('rol',        data.rol)
    localStorage.setItem('cliente_id', data.cliente_id ?? '')
    dispatch({ type: 'LOGIN', payload: data })
  }, [])

  const logout = useCallback(() => {
    localStorage.clear()
    dispatch({ type: 'LOGOUT' })
  }, [])

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
