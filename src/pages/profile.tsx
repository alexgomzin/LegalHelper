'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useTranslation } from '@/contexts/LanguageContext'
import Head from 'next/head'

export default function Profile() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, updateProfile, updatePassword } = useAuth()
  const { t } = useTranslation()
  
  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (user) {
      // Populate form with user data
      setName(user.name || '')
      setEmail(user.email || '')
    }
  }, [isAuthenticated, isLoading, router, user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ text: '', type: '' })
    setIsSubmitting(true)
    
    try {
      await updateProfile({ name })
      setMessage({ 
        text: t('profile.profileUpdated'), 
        type: 'success' 
      })
    } catch (error: any) {
      setMessage({ 
        text: error.message || t('profile.failedToUpdate'), 
        type: 'error' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ text: '', type: '' })
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setMessage({ 
        text: t('profile.passwordsDoNotMatch'), 
        type: 'error' 
      })
      return
    }
    
    if (newPassword.length < 6) {
      setMessage({ 
        text: t('profile.passwordTooShort'), 
        type: 'error' 
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await updatePassword(newPassword)
      setMessage({ 
        text: t('profile.passwordUpdated'), 
        type: 'success' 
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setMessage({ 
        text: error.message || t('profile.failedToUpdate'), 
        type: 'error' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{t('profile.title')}</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {t('profile.yourProfile')}
              </h1>
            </div>
          </div>
          
          {message.text && (
            <div className={`mb-4 rounded-md p-4 ${
              message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t('profile.personalInformation')}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {t('profile.updatePersonalDetails')}
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      {t('profile.fullName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      {t('profile.emailAddress')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-100"
                      required
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">{t('profile.emailCannotBeChanged')}</p>
                  </div>
                  
                  <div className="col-span-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {isSubmitting ? t('profile.saving') : t('profile.saveChanges')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t('profile.changePassword')}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {t('profile.updatePassword')}
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handlePasswordUpdate}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                      {t('profile.currentPassword')}
                    </label>
                    <input
                      type="password"
                      name="current-password"
                      id="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                      {t('profile.newPassword')}
                    </label>
                    <input
                      type="password"
                      name="new-password"
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                      {t('profile.confirmNewPassword')}
                    </label>
                    <input
                      type="password"
                      name="confirm-password"
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="col-span-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {isSubmitting ? t('profile.updating') : t('profile.updatePasswordBtn')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Links Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="container mx-auto px-6">
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
      </footer>
    </>
  )
} 