import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import type { Admin } from '../lib/types'

interface AuthState {
  admin: Admin | null
  loading: boolean
  login: (email: string, password: string) => Promise<Admin>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  setAdmin: (admin: Admin) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<{ admin: Admin }>('/auth/me')
      setAdmin(res.data.admin)
    } catch {
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ admin: Admin }>('/auth/login', { email, password })
    setAdmin(res.data.admin)
    return res.data.admin
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setAdmin(null)
    }
  }, [])

  const value = useMemo(() => ({ admin, loading, login, logout, refresh, setAdmin }), [admin, loading, login, logout, refresh])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
