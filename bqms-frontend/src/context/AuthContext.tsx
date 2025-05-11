import React, { useCallback, useState, createContext, useContext } from 'react'
import type { User, RefreshTokenResponse } from '../utils/validation'
import { api, endpoints, setAuthToken, setRefreshToken } from '../utils/api'

interface AuthContextType {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  isAuthenticated: boolean
  refreshAccessToken: () => Promise<string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null)
  const setAuth = useCallback((user: User, token: string, refresh: string) => {
    setUser(user)
    setAccessToken(token)
    setRefreshTokenState(refresh)
    setAuthToken(token)
  }, [])
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) throw new Error('No refresh token available')
    try {
      setRefreshToken(refreshToken)
      const response = await api.post<RefreshTokenResponse>(endpoints.refresh)
      const { access_token } = response.data
      setAccessToken(access_token)
      setAuthToken(access_token)
      return access_token
    } catch (error) {
      logout()
      throw error
    }
  }, [refreshToken])
  const logout = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    setRefreshTokenState(null)
    setAuthToken(null)
  }, [])
  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        setAuth,
        logout,
        isAuthenticated: !!user,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
