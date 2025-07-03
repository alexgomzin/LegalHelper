'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Head from 'next/head'
import Link from 'next/link'
import { getAllUserDocuments, getDocumentAnalysis, deleteDocumentAnalysis } from '@/utils/supabaseDocumentUtils'

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
  const loadUserDocuments = async (userId: string) => {
    setIsLoadingDocuments(true)
    try {
      const userDocuments = await getAllUserDocuments(userId)
      
      if (userDocuments && userDocuments.length > 0) {
        setDocuments(userDocuments)
      } else {
        // If no documents found, show mock data for new users
        setDocuments([
          { id: 'example-1', name: 'Example Lease Agreement.pdf', date: new Date().toISOString(), status: 'Analyzed' },
          { id: 'example-2', name: 'Example Employment Contract.pdf', date: new Date().toISOString(), status: 'Analyzed' },
        ])
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      
      // Try to get documents from localStorage as fallback
      try {
        const storedDocs = localStorage.getItem('analyzedDocuments')
        if (storedDocs) {
          setDocuments(JSON.parse(storedDocs))
        } else {
          setDocuments([])
        }
      } catch (localError) {
        console.error('Error loading documents from localStorage:', localError)
        setDocuments([])
      }
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  const handleDownload = async (documentId: string, format: 'pdf' | 'json') => {
    if (!user) return;
    
    try {
      // Get analysis from Supabase or localStorage
      const analysis = await getDocumentAnalysis(user.id, documentId)
      
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
            
            {/* Documents table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                  {documents.length > 0 ? (
                    documents.map((doc) => (
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
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Download JSON
                            </button>
                            <button
                              onClick={() => handleDownload(doc.id, 'pdf')}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Download PDF
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
                    ))
                  ) : (
                    <li className="px-4 py-8 sm:px-6 text-center">
                      <p className="text-gray-500">No documents found. Upload a document to begin analysis.</p>
                      <Link 
                        href="/analyze"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Analyze New Document
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
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