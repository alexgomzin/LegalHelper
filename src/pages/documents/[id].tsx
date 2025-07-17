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
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [documentTitle, setDocumentTitle] = useState<string>('')
  const [documentDate, setDocumentDate] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Load document when component mounts and user is authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (user && id && typeof id === 'string') {
      loadDocument(user.id, id)
    }
  }, [user, id, isAuthenticated, isLoading, router])

  const loadDocument = async (userId: string, documentId: string, showRetryMessage: boolean = false) => {
    setLoading(true)
    setError(null)

    if (showRetryMessage) {
      console.log(`Retrying to load document (attempt ${retryCount + 1})...`)
    }

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
        setError(null)
        setRetryCount(0)
        
        // If we didn't find document info in localStorage, try to extract from analysis
        if (!documentTitle && analysis._docId) {
          // We might have metadata in the analysis
          setDocumentTitle(analysis._docName || `Document ${documentId}`)
          setDocumentDate(analysis._timestamp || new Date().toISOString())
        }
      } else {
        console.error(`Analysis results not found for document ${documentId}`)
        setError('Analysis results not found for this document. The document may have been deleted or there may be a connection issue.')
      }
      
    } catch (error) {
      console.error('Error loading document:', error)
      setError('Failed to load document. This might be due to a network issue.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (user && id && typeof id === 'string') {
      setRetryCount(prev => prev + 1)
      loadDocument(user.id, id, true)
    }
  }

  const handleDownload = () => {
    if (analysisResults && id) {
      try {
        // Create a JSON string from the results
        const jsonString = JSON.stringify(analysisResults, null, 2)
        
        // Create a blob and download link
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        // Create a temporary anchor element to trigger the download
        const a = document.createElement('a')
        a.href = url
        a.download = `document-analysis-${id}.json`
        a.click()
        
        // Clean up
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading document:', error)
        alert('Failed to download. Please try again.')
      }
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoading ? 'Authenticating...' : 'Loading document analysis...'}
          </p>
        </div>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {documentTitle || 'Document Analysis'}
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {documentDate ? `Analyzed on ${new Date(documentDate).toLocaleDateString()}` : 'Legal document analysis'}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Link
                    href="/documents"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    ← Back to Documents
                  </Link>
                  {analysisResults && (
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                    >
                      Download Analysis
                    </button>
                  )}
                </div>
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
                    <div className="mt-2 flex space-x-3">
                      <button
                        onClick={handleRetry}
                        className="text-sm text-red-700 underline hover:text-red-600"
                      >
                        Try again
                      </button>
                      <Link
                        href="/documents"
                        className="text-sm text-red-700 underline hover:text-red-600"
                      >
                        Back to documents
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Analysis results */}
            {analysisResults && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Analysis Results
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Detailed analysis of potential risks and recommendations
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <AnalysisResults results={analysisResults} />
                </div>
              </div>
            )}

            {/* Empty state when no analysis results and no error */}
            {!analysisResults && !error && !loading && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No analysis found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This document may not have been analyzed yet or the analysis may have been deleted.
                  </p>
                  <div className="mt-6 flex justify-center space-x-3">
                    <Link
                      href="/documents"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Back to Documents
                    </Link>
                    <Link
                      href="/analyze"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Analyze New Document
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
} 