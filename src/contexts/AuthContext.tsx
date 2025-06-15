'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextProps {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would call an API endpoint to validate the token
        // and return the user data if valid
        const token = localStorage.getItem('token')
        
        if (token) {
          // For demo purposes, we'll simulate a call to a user endpoint
          // In a real app, this would be a real API call
          // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          // const response = await axios.get('/api/user')
          // setUser(response.data.user)
          
          // Mock user data
          const userData = JSON.parse(localStorage.getItem('user') || '{}')
          if (userData.id) {
            setUser(userData)
          }
        }
      } catch (error) {
        console.error('Authentication check failed', error)
        // Clear potentially invalid tokens
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be a real API call to your backend
      // const response = await axios.post('/api/login', { email, password })
      // const { token, user } = response.data
      
      // For demo, mock successful login with any non-empty email/password
      if (!email || !password) {
        throw new Error('Email and password are required')
      }
      
      // Mock successful login response
      const mockUser = {
        id: '123',
        name: email.split('@')[0],
        email
      }
      
      // Mock token
      const mockToken = `mock_token_${Date.now()}`
      
      // Store token and user data in localStorage
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      // Set user in state
      setUser(mockUser)
      
      // In a real app, set the auth header for subsequent requests
      // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } catch (error: any) {
      console.error('Login failed', error)
      throw new Error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be a real API call to your backend
      // const response = await axios.post('/api/register', { name, email, password })
      
      // For demo, mock successful registration
      if (!name || !email || !password) {
        throw new Error('Name, email and password are required')
      }
      
      // In a real app, you might want to login the user automatically after registration
      // or redirect them to the login page
    } catch (error: any) {
      console.error('Registration failed', error)
      throw new Error(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // In a real app, you might want to call an API endpoint to invalidate the token
      // await axios.post('/api/logout')
      
      // Clear auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Clear user from state
      setUser(null)
      
      // In a real app, clear the auth header
      // delete axios.defaults.headers.common['Authorization']
    } catch (error) {
      console.error('Logout failed', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 