'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Head from 'next/head'

export default function Logout() {
  const { signOut, navigateTo } = useAuth()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut()
      } finally {
        // Redirect to home page after logout, regardless of outcome
        navigateTo('/')
      }
    }

    performLogout()
  }, [signOut, navigateTo])

  return (
    <>
      <Head>
        <title>Logging out - Legal Helper</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="animate-pulse">
            <svg className="mx-auto h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Logging you out...
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please wait while we securely log you out of your account
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 