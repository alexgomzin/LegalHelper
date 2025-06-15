'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Head from 'next/head'
import Link from 'next/link'
import AnalysisResults from '@/components/AnalysisResults'
import { getDocumentAnalysis } from '@/utils/supabaseDocumentUtils'

export default function DocumentDetail() {
  const router = useRouter()
  const { id } = router.query
  const { user, isAuthenticated, isLoading } = useAuth()
  const [documentTitle, setDocumentTitle] = useState<string>('')
  const [documentDate, setDocumentDate] = useState<string>('')
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    // Only load document if we have an ID and the user is loaded
    if (id && user) {
      loadDocument(user.id, id as string)
    }
  }, [id, isAuthenticated, isLoading, router, user])

  const loadDocument = async (userId: string, documentId: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log(`Loading document with ID: ${documentId}`)
      
      // Try to get document info from localStorage first (for faster UI)
      const documentsStr = localStorage.getItem('analyzedDocuments')
      
      if (documentsStr) {
        const documents = JSON.parse(documentsStr)
        const document = documents.find((doc: any) => doc.id === documentId)
        
        if (document) {
          setDocumentTitle(document.name)
          setDocumentDate(document.date)
        } else {
          console.warn(`Document with ID ${documentId} not found in local list`)
        }
      }
      
      // Get analysis from Supabase with localStorage fallback
      const analysis = await getDocumentAnalysis(userId, documentId)
      
      if (analysis) {
        console.log(`Analysis found for document ${documentId}`)
        setAnalysisResults(analysis)
        
        // If we didn't find document info in localStorage, try to extract from analysis
        if (!documentTitle && analysis._docId) {
          // We might have metadata in the analysis
          setDocumentTitle(analysis._docName || 'Document Analysis')
          setDocumentDate(analysis._timestamp || new Date().toISOString())
        }
      } else {
        console.error(`Analysis results not found for document ${documentId}`)
        setError('Analysis results not found for this document. You may need to re-analyze it.')
      }
      
    } catch (error) {
      console.error('Error loading document:', error)
      setError('Failed to load document. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{documentTitle || 'Document Analysis'} - Legal Helper</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <main className="py-10">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Document header */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {documentTitle || 'Document Analysis'}
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Analyzed on {new Date(documentDate).toLocaleDateString()} {documentDate ? new Date(documentDate).toLocaleTimeString() : ''}
                  </p>
                </div>
                <Link
                  href="/documents"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Documents
                </Link>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Analysis results */}
            {analysisResults && (
              <AnalysisResults results={analysisResults} />
            )}
          </div>
        </main>
      </div>
    </>
  )
} 