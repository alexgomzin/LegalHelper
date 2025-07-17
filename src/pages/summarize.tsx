'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import DocumentUploader from '@/components/DocumentUploader'
import axios from 'axios'

export default function SummarizePage() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'summarizing' | 'complete' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [summary, setSummary] = useState('')
  
  // Clear any stale data on component mount
  useEffect(() => {
    if (uploadStatus === 'idle') {
      sessionStorage.removeItem('documentSummary');
    }
  }, [uploadStatus]);
  
  const handleUploadStart = () => {
    setUploadStatus('uploading')
    setUploadProgress(0)
    setErrorMessage('')
  }
  
  const handleUploadProgress = (percent: number) => {
    setUploadProgress(percent)
  }
  
  const handleUploadComplete = async () => {
    setUploadStatus('summarizing')
    setUploadProgress(100)
    
    const fileId = sessionStorage.getItem('fileId')
    if (!fileId) {
      setErrorMessage('No file ID found. Please upload your document again.')
      setUploadStatus('error')
      return
    }

    try {
      const response = await axios.post('/api/summarize', { fileId })
      
      if (response.data && response.data.summary) {
        setSummary(response.data.summary)
        sessionStorage.setItem('documentSummary', response.data.summary)
        setUploadStatus('complete')
      } else {
        throw new Error('Invalid summary response')
      }
    } catch (error: any) {
      console.error('Error getting summary:', error)
      setErrorMessage(`Summarization failed: ${error.message || 'Unknown error'}`)
      setUploadStatus('error')
    }
  }
  
  const handleError = (message: string) => {
    setUploadStatus('error')
    setErrorMessage(message)
  }
  
  const resetSummary = () => {
    setUploadStatus('idle')
    setUploadProgress(0)
    setErrorMessage('')
    setSummary('')
    sessionStorage.removeItem('fileId')
    sessionStorage.removeItem('documentSummary')
  }

  return (
    <>
      <Head>
        <title>Document Summary - LegalHelper</title>
        <meta name="description" content="AI-powered legal document summarization" />
      </Head>
      
      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-10">Document Summary</h1>
          
          {uploadStatus === 'idle' && (
            <div className="max-w-xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-5">Upload Legal Document</h2>
                <p className="text-gray-600 mb-6">
                  Upload your legal document in PDF format. Our AI will create a concise summary of the document content to help you quickly understand its purpose and key points.
                </p>
                
                <DocumentUploader
                  onUploadStart={handleUploadStart}
                  onUploadProgress={handleUploadProgress}
                  onUploadComplete={handleUploadComplete}
                  onError={handleError}
                />
              </div>
            </div>
          )}
          
          {(uploadStatus === 'uploading' || uploadStatus === 'summarizing') && (
            <div className="max-w-xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <h2 className="text-xl font-semibold mb-6">
                  {uploadStatus === 'uploading' ? 'Uploading Document...' : 'Summarizing Document...'}
                </h2>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                
                <p className="text-gray-600">
                  {uploadStatus === 'uploading' 
                    ? 'Your document is being uploaded. Please wait...' 
                    : 'Our AI is creating a summary of your document. This may take a moment...'}
                </p>
              </div>
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div className="max-w-xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={resetSummary}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {uploadStatus === 'complete' && summary && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Document Summary</h2>
                
                <div className="bg-gray-50 p-6 rounded-md border border-gray-200 mb-6">
                  <p className="text-gray-700">{summary}</p>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={resetSummary}
                    className="btn-secondary"
                  >
                    Summarize Another Document
                  </button>
                  
                  <Link href="/analyze" className="btn-primary">
                    Analyze This Document
                  </Link>
                </div>
              </div>
            </div>
          )}
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