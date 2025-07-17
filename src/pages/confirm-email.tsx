'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Head from 'next/head'

export default function ConfirmEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the hash from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (!accessToken || !refreshToken || type !== 'signup') {
          setStatus('error')
          setMessage('Invalid confirmation link. Please try registering again.')
          return
        }

        // Set the session with the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          console.error('Error confirming email:', error)
          setStatus('error')
          setMessage('Failed to confirm email. Please try again or contact support.')
          return
        }

        if (data.user) {
          // Check if user profile exists, if not create it
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { error: createError } = await supabase.from('profiles').insert({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || '',
              credits_remaining: 1, // Give 1 free credit
              subscription_tier: 'free',
              subscription_status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

            if (createError) {
              console.error('Error creating profile:', createError)
            }
          }

          setStatus('success')
          setMessage('Email confirmed successfully! You can now log in.')
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push('/login?confirmed=true')
          }, 3000)
        }
      } catch (error) {
        console.error('Error during email confirmation:', error)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      handleEmailConfirmation()
    }
  }, [router])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )
      case 'success':
        return (
          <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'error':
        return (
          <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Confirming Your Email...'
      case 'success':
        return 'Email Confirmed!'
      case 'error':
        return 'Confirmation Failed'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
    }
  }

  return (
    <>
      <Head>
        <title>Confirm Email - Legal Helper</title>
        <meta name="description" content="Confirm your email address for Legal Helper" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              {getStatusIcon()}
            </div>
            
            <h2 className={`text-3xl font-extrabold ${getStatusColor()}`}>
              {getStatusTitle()}
            </h2>
            
            <p className="mt-4 text-sm text-gray-600">
              {message}
            </p>
            
            {status === 'success' && (
              <div className="mt-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    🎉 Welcome to Legal Helper! You've received 1 free document analysis credit.
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  You will be redirected to the login page in a few seconds...
                </p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mt-6 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    If you continue to have issues, please contact our support team.
                  </p>
                </div>
                <div className="space-y-2">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Registering Again
                  </Link>
                  <Link
                    href="/login"
                    className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 