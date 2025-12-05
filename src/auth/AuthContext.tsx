// Contexte d'authentification: stocke le token JWT, l'utilisateur et fournit login/logout
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

type Role = 'Admin' | 'Professor' | 'Student'

type User = {
  id: string
  name: string
  email: string
  role: Role
  avatarUrl?: string
}

type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'dm_auth_token'
const USER_KEY = 'dm_auth_user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const navigate = useNavigate()

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    // attach token to axios instance
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    navigate('/')
  }, [navigate])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    delete api.defaults.headers.common['Authorization']
    navigate('/login')
  }, [navigate])

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  }), [user, token, login, logout])

  useEffect(() => {
    // Restore token to axios on mount
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }, [])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useHasRole(roles: Role[]) {
  const { user } = useAuth()
  return !!user && roles.includes(user.role)
}

export type { Role, User }


