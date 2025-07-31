'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, User } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { validateEmailForRegistration } from '@/utils/emailValidation'

// Set to false to enable real Supabase authentication
const useMockAuth = false

interface AuthContextProps {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: { name?: string, avatar_url?: string }) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  navigateTo: (path: string) => void
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Navigate function using App Router
  const navigateTo = (path: string) => {
    router.push(path)
  }

  useEffect(() => {
    // Get the current session
    const initializeAuth = async () => {
      setIsLoading(true)
      try {
        // If using mock auth, check localStorage instead
        if (useMockAuth) {
          // Only access localStorage on client side
          if (typeof window !== 'undefined') {
            const mockUser = localStorage.getItem('mock_user')
            if (mockUser) {
              const userData = JSON.parse(mockUser)
              setUser(userData)
            }
          }
          setIsLoading(false)
          return
        }

        // Regular Supabase auth flow
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error

        if (session) {
          setSession(session)
          
          // Get user profile
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profileError) {
            console.error('Error fetching user profile:', profileError)
          }

          // Set user with profile data if available, otherwise just use session user
          setUser(data || {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            avatar_url: session.user.user_metadata?.avatar_url
          })
        }
      } catch (error) {
        console.error('Error during authentication initialization:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Initialize authentication
    initializeAuth()

    // For mock auth, no need to subscribe to auth changes
    if (useMockAuth) return

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '',
          avatar_url: session.user.user_metadata?.avatar_url
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    // Cleanup subscription
    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // Validate email for temporary/disposable addresses
      const emailValidation = validateEmailForRegistration(email)
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Invalid email address')
      }

      if (useMockAuth) {
        // Mock sign up
        const mockUser = {
          id: `mock-${Date.now()}`,
          email,
          name,
          created_at: new Date().toISOString()
        }
        // Store in localStorage but don't log in yet
        if (typeof window !== 'undefined') {
          localStorage.setItem('mock_user_registered', JSON.stringify(mockUser))
        }
        setIsLoading(false)
        return
      }

      // Regular Supabase sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          },
          emailRedirectTo: `${window.location.origin}/confirm-email`
        }
      })

      if (error) throw error

      if (data.user) {
        // Create a profile record
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          name
        })
      }
    } catch (error: any) {
      console.error('Error signing up:', error)
      throw new Error(error.message || 'An error occurred during sign up')
    } finally {
      setIsLoading(false)
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      if (useMockAuth) {
        // Mock sign in
        // Check registration or use a dummy user for testing
        let registeredUser = null
        if (typeof window !== 'undefined') {
          registeredUser = localStorage.getItem('mock_user_registered')
        }
        
        const mockUser = registeredUser 
          ? JSON.parse(registeredUser)
          : {
              id: `mock-${Date.now()}`,
              email,
              name: email.split('@')[0],
              created_at: new Date().toISOString()
            }
        
        // Store user in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('mock_user', JSON.stringify(mockUser))
        }
        setUser(mockUser)
        setIsLoading(false)
        return
      }

      // Regular Supabase sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // After successful sign-in, refresh the user profile
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('Error fetching user profile:', profileError)
        } else if (profile) {
          setUser(profile)
        }
      }
    } catch (error: any) {
      console.error('Error signing in:', error)
      throw new Error(error.message || 'Invalid login credentials')
    } finally {
      setIsLoading(false)
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      if (useMockAuth) {
        // Mock Google sign in
        const mockUser = {
          id: `google-mock-${Date.now()}`,
          email: 'user@gmail.com',
          name: 'John Doe',
          avatar_url: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          created_at: new Date().toISOString()
        }
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('mock_user', JSON.stringify(mockUser))
        }
        setUser(mockUser)
        setIsLoading(false)
        return
      }

      // Regular Supabase Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error

      // Note: The actual user data will be available after redirect
      // The onAuthStateChange listener will handle setting the user state
    } catch (error: any) {
      console.error('Error signing in with Google:', error)
      throw new Error(error.message || 'Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    setIsLoading(true)
    try {
      if (useMockAuth) {
        // Mock sign out
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mock_user')
        }
        setUser(null)
        setSession(null)
        setIsLoading(false)
        return
      }

      // Regular Supabase sign out
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSession(null)
    } catch (error: any) {
      console.error('Error signing out:', error)
      throw new Error(error.message || 'An error occurred during sign out')
    } finally {
      setIsLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (data: { name?: string, avatar_url?: string }) => {
    if (!user) throw new Error('User must be logged in to update profile')
    
    setIsLoading(true)
    try {
      if (useMockAuth) {
        // Mock profile update
        const mockUser = {
          ...user,
          ...data,
          updated_at: new Date().toISOString()
        }
        localStorage.setItem('mock_user', JSON.stringify(mockUser))
        setUser(mockUser)
        setIsLoading(false)
        return
      }

      // Regular Supabase profile update
      const { error: updateError } = await supabase.auth.updateUser({
        data
      })
      
      if (updateError) throw updateError
      
      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
      
      if (profileError) throw profileError
      
      // Update local user state
      setUser({
        ...user,
        ...data
      })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      throw new Error(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Update password
  const updatePassword = async (password: string) => {
    setIsLoading(true)
    try {
      if (useMockAuth) {
        // Mock password update (just pretend it worked)
        setIsLoading(false)
        return
      }

      // Regular Supabase password update
      const { error } = await supabase.auth.updateUser({
        password
      })
      
      if (error) throw error
    } catch (error: any) {
      console.error('Error updating password:', error)
      throw new Error(error.message || 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      isLoading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile,
      updatePassword,
      navigateTo
    }}>
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