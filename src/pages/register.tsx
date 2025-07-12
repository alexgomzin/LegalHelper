'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { validateEmailForRegistration } from '@/utils/emailValidation'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidatingEmail, setIsValidatingEmail] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  // Validate email in real-time when user types
  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value
    setEmail(emailValue)
    setEmailError('')

    // Only validate if email looks complete
    if (emailValue.includes('@') && emailValue.includes('.')) {
      setIsValidatingEmail(true)
      
      // Client-side validation first
      const clientValidation = validateEmailForRegistration(emailValue)
      if (!clientValidation.isValid) {
        setEmailError(clientValidation.error || 'Invalid email')
        setIsValidatingEmail(false)
        return
      }

      // Server-side validation for additional security
      try {
        const response = await fetch('/api/validate-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailValue })
        })
        
        const data = await response.json()
        if (!data.isValid) {
          setEmailError(data.error || 'Invalid email address')
        }
      } catch (error) {
        // If server validation fails, rely on client-side validation
        console.warn('Server email validation failed, using client-side only')
      } finally {
        setIsValidatingEmail(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate form inputs
    if (!name || !email || !password) {
      setError('All fields are required')
      return
    }
    
    // Check if there's already an email error
    if (emailError) {
      setError(emailError)
      return
    }
    
    // Validate email for temporary/disposable addresses (final check)
    const emailValidation = validateEmailForRegistration(email)
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email address')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsSubmitting(true)

    try {
      await signUp(email, password, name)
      // Redirect to login page with a success flag
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Create Account - Legal Helper</title>
        <meta name="description" content="Sign up for LegalHelper to access document analysis tools and risk assessment features" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            {/* Card container */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              {/* Top banner */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-800 px-6 py-8 text-white">
                <h1 className="text-3xl font-bold text-center">Create Your Account</h1>
                <p className="text-blue-100 text-center mt-2">Join LegalHelper for intelligent document analysis</p>
              </div>
              
              {/* Form section */}
              <div className="px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="John Smith"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={handleEmailChange}
                        className={`appearance-none block w-full px-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none transition duration-150 ${
                          emailError 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="your@email.com"
                      />
                      {isValidatingEmail && (
                        <p className="mt-1 text-xs text-blue-600 flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Validating email...
                        </p>
                      )}
                      {emailError && (
                        <p className="mt-1 text-xs text-red-600">
                          {emailError}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="••••••••"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Must be at least 6 characters long
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 p-4 border-l-4 border-red-500">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the <Link href="/terms" className="text-blue-600 hover:text-blue-500 transition">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:text-blue-500 transition">Privacy Policy</Link>
                    </label>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting || emailError !== '' || isValidatingEmail}
                      className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium ${
                        isSubmitting || emailError !== '' || isValidatingEmail 
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
            
            {/* Benefits section */}
            <div className="mt-10 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Why Join LegalHelper?</h2>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">AI-Powered Analysis</span> - Get instant insights on contracts and legal documents
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">Secure Document Handling</span> - Your documents remain private and protected
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">Save Time and Reduce Risk</span> - Identify potential issues before they become problems
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Links Footer */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 hover:underline">
                  Terms of Service
                </a>
                <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 hover:underline">
                  Privacy Policy
                </a>
                <a href="/refund-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 hover:underline">
                  Refund Policy
                </a>
                <a href="mailto:legalhelperai@protonmail.com" className="hover:text-gray-700 hover:underline flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  Contact: legalhelperai@protonmail.com
                </a>
                <span>© {new Date().getFullYear()} LegalHelper. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 