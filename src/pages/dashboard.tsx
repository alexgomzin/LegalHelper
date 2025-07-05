'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Head from 'next/head'
import Link from 'next/link'
import { formatDate } from '@/utils/formatDate'
import { useTranslation } from '@/contexts/LanguageContext'
import { getAllUserDocuments } from '@/utils/supabaseDocumentUtils'

// Define type for document records
interface DocumentRecord {
  id: string;
  name: string;
  date: string;
  status: string;
}

// Dashboard component
export default function Dashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { t } = useTranslation()
  
  // State for recent documents with proper typing
  const [recentDocuments, setRecentDocuments] = useState<DocumentRecord[]>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    // Load recent documents from Supabase if user is authenticated
    if (user) {
      loadRecentDocuments(user.id)
    }
  }, [isAuthenticated, isLoading, router, user])

  // Load recent documents from Supabase with localStorage as fallback
  const loadRecentDocuments = async (userId: string) => {
    setIsLoadingDocuments(true)
    try {
      const userDocuments = await getAllUserDocuments(userId)
      
      if (userDocuments && userDocuments.length > 0) {
        // Only display the 3 most recent documents
        setRecentDocuments(userDocuments.slice(0, 3))
      } else {
        // If no documents found in Supabase, try localStorage as fallback
        try {
          const storedDocs = localStorage.getItem('analyzedDocuments')
          if (storedDocs) {
            const parsedDocs = JSON.parse(storedDocs)
            setRecentDocuments(parsedDocs.slice(0, 3))
          } else {
            setRecentDocuments([])
          }
        } catch (localError) {
          console.error('Error loading documents from localStorage:', localError)
          setRecentDocuments([])
        }
      }
    } catch (error) {
      console.error('Error loading documents from Supabase:', error)
      
      // Try to get documents from localStorage as fallback
      try {
        const storedDocs = localStorage.getItem('analyzedDocuments')
        if (storedDocs) {
          const parsedDocs = JSON.parse(storedDocs)
          setRecentDocuments(parsedDocs.slice(0, 3))
        } else {
          setRecentDocuments([])
        }
      } catch (localError) {
        console.error('Error loading documents from localStorage:', localError)
        setRecentDocuments([])
      }
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  if (isLoading || isLoadingDocuments) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{t('dashboard.title')} - LegalHelper</title>
        <meta name="description" content="View your document analysis history and start new analyses" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <main className="py-10">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Welcome section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('dashboard.welcome')}, {user?.name || 'User'}!
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {t('dashboard.welcomeDesc')}
                </p>
              </div>
            </div>
            
            {/* Quick actions */}
            <div className="bg-white shadow sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">{t('dashboard.quickActions')}</h2>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Link
                    href="/analyze"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="rounded-full bg-blue-100 w-10 h-10 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="font-medium text-blue-800">{t('dashboard.analyzeDocument')}</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="rounded-full bg-green-100 w-10 h-10 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="font-medium text-green-800">{t('dashboard.editProfile')}</span>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Recent documents */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">{t('dashboard.recentDocuments')}</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {t('dashboard.recentDocumentsDesc')}
                </p>
              </div>
              <div className="border-t border-gray-200">
                <div className="bg-gray-50 px-4 py-3 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500 truncate">
                      {t('dashboard.documentName')}
                    </div>
                    <div className="flex-1 hidden sm:block"></div>
                    <div className="text-sm font-medium text-gray-500 truncate">
                      {t('dashboard.date')}
                    </div>
                    <div className="ml-6 text-sm font-medium text-gray-500 truncate">
                      {t('dashboard.status')}
                    </div>
                    <div className="ml-6 text-sm font-medium text-gray-500 truncate">
                      {t('dashboard.actions')}
                    </div>
                  </div>
                </div>
                <ul className="divide-y divide-gray-200">
                  {recentDocuments.length > 0 ? (
                    recentDocuments.map((doc) => (
                      <li key={doc.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-blue-600 truncate">
                            {doc.name}
                          </div>
                          <div className="flex-1 hidden sm:block"></div>
                          <div className="text-sm text-gray-500">
                            {formatDate(new Date(doc.date))}
                          </div>
                          <div className="ml-6">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              doc.status === 'Analyzed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                          <div className="ml-6">
                            <Link
                              href={`/documents/${doc.id}`}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              {t('dashboard.view')}
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                      {t('dashboard.noDocuments')}
                    </li>
                  )}
                </ul>
              </div>
              <div className="px-4 py-4 sm:px-6 text-right">
                <Link
                  href="/documents"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  {t('dashboard.viewAllDocuments')} →
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Legal Links Footer */}
        <footer className="py-8 border-t border-gray-200">
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
      </div>
    </>
  )
} 