'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Head from 'next/head'
import Link from 'next/link'
import { getAllUserDocuments, getUserDocumentAnalysis, deleteDocumentAnalysis } from '@/utils/supabaseDocumentUtils'

interface DocumentRecord {
  id: string;
  name: string;
  date: string;
  status: string;
}

export default function Documents() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Load documents from Supabase
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    // Load documents from Supabase
    if (user) {
      loadUserDocuments(user.id)
    }
  }, [isAuthenticated, isLoading, router, user])

  // Load documents from Supabase with localStorage as fallback
  const loadUserDocuments = async (userId: string, showRetryMessage: boolean = false) => {
    setIsLoadingDocuments(true)
    setError(null)
    
    if (showRetryMessage) {
      console.log(`Retrying to load documents (attempt ${retryCount + 1})...`)
    }
    
    try {
      const userDocuments = await getAllUserDocuments(userId)
      
      if (userDocuments && userDocuments.length > 0) {
        setDocuments(userDocuments)
        setError(null)
        setRetryCount(0)
      } else {
        // If no documents found, show empty state
        setDocuments([])
        setError(null)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      setError('Failed to load your documents. This might be due to a network issue.')
      
      // Don't use localStorage as fallback since it's not user-specific and creates security issues
      // Only rely on Supabase for document storage to ensure proper user isolation
      setDocuments([])
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  const handleRetry = () => {
    if (user) {
      setRetryCount(prev => prev + 1)
      loadUserDocuments(user.id, true)
    }
  }

  const handleDownload = async (documentId: string, format: 'pdf' | 'json') => {
    if (!user) return;
    
    try {
      // Get analysis from Supabase or localStorage
      const analysis = getUserDocumentAnalysis(documentId, user.id)
      
      if (analysis) {
        if (format === 'json') {
          // Create a JSON string from the results
          const jsonString = JSON.stringify(analysis, null, 2)
          
          // Create a blob and download link
          const blob = new Blob([jsonString], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          
          // Create a temporary anchor element to trigger the download
          const a = document.createElement('a')
          a.href = url
          a.download = `document-analysis-${documentId}.json`
          a.click()
          
          // Clean up
          URL.revokeObjectURL(url)
        } else {
          // PDF download (would require actual PDF generation, using alert for now)
          alert('PDF download functionality will be implemented soon')
        }
      } else {
        alert('Analysis results not found for this document')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Failed to download. Please try again.')
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!user) return;
    
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await deleteDocumentAnalysis(user.id, documentId)
        
        // Refresh the list
        loadUserDocuments(user.id)
      } catch (error) {
        console.error('Error deleting document:', error)
        alert('Failed to delete document. Please try again.')
      }
    }
  }

  if (isLoading || isLoadingDocuments) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoading ? 'Authenticating...' : 'Loading your documents...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Your Documents - Legal Helper</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <main className="py-10">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Documents header */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Your Documents</h1>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    All your analyzed legal documents
                  </p>
                </div>
                <Link
                  href="/analyze"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Analyze New Document
                </Link>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {error}
                    </p>
                    <button
                      onClick={handleRetry}
                      className="mt-2 text-sm text-yellow-700 underline hover:text-yellow-600"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Documents table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by analyzing your first legal document.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/analyze"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Analyze Document
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-t border-gray-200">
                    <div className="bg-gray-50 px-4 py-3 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-500 w-1/4 truncate">
                          Name
                        </div>
                        <div className="text-sm font-medium text-gray-500 w-1/6 truncate">
                          Date
                        </div>
                        <div className="text-sm font-medium text-gray-500 w-1/6 truncate">
                          Status
                        </div>
                        <div className="text-sm font-medium text-gray-500 w-1/3 truncate text-right">
                          Actions
                        </div>
                      </div>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <li key={doc.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-blue-600 w-1/4 truncate">
                              {doc.name}
                            </div>
                            <div className="text-sm text-gray-500 w-1/6 truncate">
                              {new Date(doc.date).toLocaleDateString()}
                            </div>
                            <div className="w-1/6">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                doc.status === 'Analyzed' ? 'bg-green-100 text-green-800' : 
                                doc.status === 'Error' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {doc.status}
                              </span>
                            </div>
                            <div className="flex justify-end space-x-3 w-1/3">
                              <Link
                                href={`/documents/${doc.id}`}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => handleDownload(doc.id, 'json')}
                                className="text-green-600 hover:text-green-900 text-sm font-medium"
                              >
                                Download
                              </button>
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
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