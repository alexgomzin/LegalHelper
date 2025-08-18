'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import DocumentUploader from '@/components/DocumentUploader'
import AnalysisResults from '@/components/AnalysisResults'
import ScannedPdfProcessor from '@/components/ScannedPdfProcessor'
import CreditStatus from '@/components/CreditStatus'
import AnalysisProgressIndicator from '@/components/AnalysisProgressIndicator'
import { useTranslation } from '@/contexts/LanguageContext'
import { processPDF } from '@/utils/pdfProcessing'
import { updateDocumentStatus, storeAnalysisResults, addDocument } from '@/utils/documentUtils'
import { storeDocumentAnalysis, updateDocumentStatus as updateSupabaseDocumentStatus } from '@/utils/supabaseDocumentUtils'
import { updateDocumentStatus as updateLocalDocumentStatus, storeAnalysisResults as storeLocalAnalysisResults } from '@/utils/documentUtils'
import { clearCreditStatusCache } from '@/components/CreditStatus'

declare global {
  interface Window {
    Paddle?: any;
  }
}

export default function AnalyzePage() {
  const { t } = useTranslation()
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [needsClientProcessing, setNeedsClientProcessing] = useState(false)
  const [mockAnalysisEnabled, setMockAnalysisEnabled] = useState(false)
  const [hasCredits, setHasCredits] = useState<boolean | null>(null)
  const [creditCheckComplete, setCreditCheckComplete] = useState(false)
  const [forceRefreshCredits, setForceRefreshCredits] = useState(0)
  const [creditStatusKey, setCreditStatusKey] = useState(0) // Key for forcing CreditStatus re-render
  // Removed showPaymentModal - using simple warning instead

  // Listen for credit status updates
  useEffect(() => {
    const handleCreditUpdate = (event: CustomEvent) => {
      if (user && event.detail.userId === user.id) {
        setForceRefreshCredits(prev => prev + 1); // Trigger refresh
      }
    };

    window.addEventListener('creditStatusUpdate', handleCreditUpdate as EventListener);
    return () => window.removeEventListener('creditStatusUpdate', handleCreditUpdate as EventListener);
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/analyze')
    }
  }, [isAuthenticated, isLoading, router])

  // Clear session storage when the component mounts
  useEffect(() => {
    // Clear analysis state on page load
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      // Only clear if we're directly on the analyze page (not when viewing results)
      if (currentPath === '/analyze' && uploadStatus === 'idle' && !analysisResults) {
        console.log('Clearing session storage for a fresh analysis');
        sessionStorage.removeItem('analysisResults');
        sessionStorage.removeItem('fileId');
      }
    }
  }, []);

  // Check if there's an existing analysis in session storage
  useEffect(() => {
    const storedResults = sessionStorage.getItem('analysisResults')
    if (storedResults && uploadStatus === 'idle') {
      try {
        const parsedResults = JSON.parse(storedResults)
        setAnalysisResults(parsedResults)
        setUploadStatus('complete')
      } catch (error) {
        console.error('Error parsing stored analysis results:', error)
        sessionStorage.removeItem('analysisResults')
      }
    }
  }, [uploadStatus])

  // Check if mock analysis is enabled
  useEffect(() => {
    // Check if we're using mock analysis (client-side detection)
    const checkMockStatus = async () => {
      try {
        const response = await fetch('/api/diagnostics');
        if (response.ok) {
          const data = await response.json();
          setMockAnalysisEnabled(data.mockAnalysis);
        }
      } catch (err) {
        // Safe error logging
        console.error('Error checking mock status:', 
          err instanceof Error ? err.message : 'Unknown error');
      }
    };
    
    checkMockStatus();
  }, []);

  // Check user's credit status
  useEffect(() => {
    const checkCredits = async () => {
      if (!user) return;
      
      // Check cache first to avoid API spam
      const cacheKey = `creditCheck_${user.id}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheExpiry = 5000; // Reduced to 5 seconds
      
      // Skip cache if forceRefreshCredits was triggered
      if (cachedData && forceRefreshCredits === 0) {
        const { hasCredits: cachedHasCredits, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < cacheExpiry) {
          setHasCredits(cachedHasCredits);
          setCreditCheckComplete(true);
          return;
        }
      }
      
      try {
        const response = await fetch(`/api/payment/check-credits?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setHasCredits(data.has_credits);
          
          // Cache the result
          localStorage.setItem(cacheKey, JSON.stringify({
            hasCredits: data.has_credits,
            timestamp: Date.now()
          }));
        } else {
          console.error('Failed to check credit status');
          // Default to allowing analysis if we can't check credits
          setHasCredits(true);
        }
      } catch (error) {
        console.error('Error checking credit status:', error);
        // Default to allowing analysis if we can't check credits
        setHasCredits(true);
      } finally {
        setCreditCheckComplete(true);
      }
    };

    if (user) {
      // Add small delay to prevent race conditions with other components
      const timeoutId = setTimeout(checkCredits, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [user, forceRefreshCredits]); // Added forceRefreshCredits dependency

  const handleUploadStart = async () => {
    // Double-check credit status before starting upload
    if (user) {
      try {
        const response = await fetch(`/api/payment/check-credits?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (!data.has_credits) {
            setErrorMessage('You don\'t have any credits remaining. Please purchase credits to analyze documents.');
            // Removed modal - error message displayed instead
            return;
          }
          setHasCredits(data.has_credits);
        } else if (response.status === 404) {
          // User not found in profiles table - treat as no credits
          setErrorMessage('You don\'t have any credits remaining. Please purchase credits to analyze documents.');
          // Removed modal - error message displayed instead
          return;
        } else {
          // Other errors - actual connection/server issues
          setErrorMessage('Unable to verify your credit status. Please try again.');
          return;
        }
      } catch (error) {
        console.error('Error checking credit status:', error);
        setErrorMessage('Unable to verify your credit status. Please check your connection.');
        return;
      }
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    setErrorMessage('')
    setAnalysisResults(null)
    sessionStorage.removeItem('analysisResults')
  }

  const handleUploadProgress = (percent: number) => {
    setUploadProgress(percent)
  }

  const handleUploadComplete = async () => {
    setIsUploading(false)
    setUploadProgress(100)
    
    // Double-check credit status before analyzing
    if (user && hasCredits === false) {
      try {
        const response = await fetch(`/api/payment/check-credits?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (!data.has_credits) {
            setErrorMessage('You don\'t have any credits remaining. Please purchase credits to analyze documents.');
            // Removed modal - error message displayed instead
            return;
          }
          setHasCredits(data.has_credits);
        } else if (response.status === 404) {
          // User not found in profiles table - treat as no credits
          setErrorMessage('You don\'t have any credits remaining. Please purchase credits to analyze documents.');
          // Removed modal - error message displayed instead
          return;
        } else {
          // Other errors - actual connection/server issues
          setErrorMessage('Unable to verify your credit status. Please try again.');
          return;
        }
      } catch (error) {
        console.error('Error checking credit status:', error);
        setErrorMessage('Unable to verify your credit status. Please check your connection.');
        return;
      }
    }

    setIsAnalyzing(true)
    
    // Check if we have a file ID from the upload
    const fileId = sessionStorage.getItem('fileId')
    
    if (!fileId) {
      console.error('No fileId found in session storage')
      setIsAnalyzing(false)
      setErrorMessage('Missing document ID. Please try uploading again.')
      return
    }
    
    // Check if we have the document name
    const documentName = localStorage.getItem('lastUploadedFileName') || `document-${fileId}.pdf`
    
    // Check if this document already has analysis results
    const analysisResults = sessionStorage.getItem('analysisResults')
    if (analysisResults && uploadStatus === 'idle') {
      try {
        console.log('Found existing analysis results, using cached version')
        const parsedResults = JSON.parse(analysisResults)
        setAnalysisResults(parsedResults)
        setUploadStatus('complete')
        setIsAnalyzing(false)
        return
      } catch (error) {
        console.error('Error parsing cached analysis results:', error)
        sessionStorage.removeItem('analysisResults')
      }
    }

    try {
      // Make the API call to analyze the document
      console.log(`Starting analysis for document: ${documentName}`)
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: fileId,
          user_id: user?.id,
          document_name: documentName
        }),
      })

      const result = await response.json()
      console.log('Analysis API response:', result)

      if (!response.ok) {
        if (result.error === 'No credits remaining') {
          setErrorMessage('You don\'t have any credits remaining. Please purchase credits to analyze documents.');
          // Removed modal - error message displayed instead
          return;
        }
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      if (result.success && result.analysis) {
        // Store results in session storage for future use
        sessionStorage.setItem('analysisResults', JSON.stringify(result.analysis))
        
        // Store in Supabase and localStorage for history
        await storeAndUpdateResults(fileId, documentName, result.analysis, 'Analyzed')
        
        // Clear credit status cache to refresh the display
        if (user) {
          clearCreditStatusCache(user.id)
          setCreditStatusKey(prev => prev + 1) // Force CreditStatus re-render
        }
        
        // Set the analysis results
        setAnalysisResults(result.analysis)
        setUploadStatus('complete')
        console.log('Analysis completed successfully and stored in database')
      } else {
        throw new Error('Invalid response format from analysis API')
      }
    } catch (error: any) {
      console.error('Error during analysis:', error)
      setErrorMessage(error.message || 'Failed to analyze document. Please try again.')
      setUploadStatus('error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Helper function to store results in both localStorage and Supabase
  const storeAndUpdateResults = async (fileId: string, documentName: string, analysis: any, status: 'Processing' | 'Analyzed' | 'Error') => {
    try {
      // Store in Supabase if user is authenticated
      if (user) {
        await storeDocumentAnalysis(user.id, fileId, documentName, analysis, status)
      }
      
      // Always update locally as fallback
      storeLocalAnalysisResults(fileId, analysis)
      updateLocalDocumentStatus(fileId, status)
      
      console.log(`Document ${fileId} status updated to ${status}`)
    } catch (error) {
      console.error('Error storing analysis results:', error)
      
      // Ensure we have local storage at minimum
      storeLocalAnalysisResults(fileId, analysis)
      updateLocalDocumentStatus(fileId, status)
    }
  }

  const handleError = (errorMessage: string) => {
    setErrorMessage(errorMessage)
    setUploadStatus('error')
    setIsUploading(false)
    setIsAnalyzing(false)
  }

  const handleUploadedFile = (file: File) => {
    setUploadedFile(file)
    
    // Store the filename for reference
    if (file) {
      try {
      localStorage.setItem('lastUploadedFileName', file.name)
      } catch (e) {
        console.warn('Could not save file name to localStorage:', e)
        // Optionally, notify the user or handle gracefully
      }
    }
  }

  const handleTextExtracted = async (text: string) => {
    setExtractedText(text)
    
    if (text && text.length > 0) {
      // Create a temporary ID for this document
      const tempId = 'scanned-' + Date.now().toString()
      const documentName = uploadedFile?.name || 'scanned-document.pdf'
      
      // Check credits FIRST before starting analysis UI
      if (user) {
        try {
          const useCreditsResponse = await fetch('/api/payment/use-credit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              user_id: user.id,
              document_id: tempId
            }),
          });
          
          if (!useCreditsResponse.ok) {
            const errorData = await useCreditsResponse.json();
            if (errorData.error === 'No credits remaining') {
              setErrorMessage('You don\'t have any credits remaining. Please purchase credits to analyze documents.');
              // Removed modal - error message displayed instead
              return;
            }
            // For ANY credit error, stop the analysis - don't allow free analysis
            console.error('Credit validation failed:', errorData.error);
            setErrorMessage('Unable to validate credits. Please try again or contact support.');
            return;
          }
        } catch (error) {
          console.error('Error using credit:', error);
          // Don't continue with analysis if credit check fails
          setErrorMessage('Unable to validate credits. Please check your connection and try again.');
          return;
        }
      }
      
      // Credits checked and approved - NOW start the analysis UI
      setIsAnalyzing(true)
      
      try {
        console.log('Starting analysis for scanned document with extracted text')
        
        const response = await fetch('/api/analyze-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            document_name: documentName,
            user_id: user?.id
          }),
        })

        const result = await response.json()
        console.log('Text analysis API response:', result)

        if (!response.ok) {
          throw new Error(result.error || `HTTP error! status: ${response.status}`)
        }

        if (result.success && result.analysis) {
          // Store results in session storage
          sessionStorage.setItem('analysisResults', JSON.stringify(result.analysis))
          
          // Store in Supabase and localStorage for history
          await storeAndUpdateResults(tempId, documentName, result.analysis, 'Analyzed')
          
          // Clear credit status cache to refresh the display
          if (user) {
            clearCreditStatusCache(user.id)
            setCreditStatusKey(prev => prev + 1) // Force CreditStatus re-render
          }
          
          // Set the analysis results
          setAnalysisResults(result.analysis)
          setUploadStatus('complete')
          console.log('Text analysis completed successfully and stored in database')
        } else {
          throw new Error('Invalid response format from text analysis API')
        }
      } catch (error: any) {  
        console.error('Error during text analysis:', error)
        setErrorMessage(error.message || 'Failed to analyze document text. Please try again.')
        setUploadStatus('error')
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const resetAnalysis = () => {
    setUploadStatus('idle')
    setUploadProgress(0)
    setErrorMessage('')
    setAnalysisResults(null)
    setIsUploading(false)
    setIsAnalyzing(false)
    setNeedsClientProcessing(false)
    setExtractedText(null)
    sessionStorage.removeItem('analysisResults')
    sessionStorage.removeItem('fileId')
  }

  // Function to handle pay-per-document purchase
  const handlePayPerDocument = () => {
    // Redirect to checkout with single document price
    const url = `/checkout?priceId=${process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT}&successUrl=${encodeURIComponent(window.location.href)}`
    window.location.href = url
    // Removed modal close - no modal anymore
  }

  // Show loading screen while checking authentication status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  // If not authenticated, don't render the content (will redirect in useEffect)
  if (!isAuthenticated) {
    return null
  }

  // Removed PaymentModal component - using simple warning instead

  return (
    <>
      <Head>
        <title>{t('analyze.title')} | LegalHelper</title>
      </Head>

      {/* Removed payment modal - using simple warning instead */}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('analyze.title')}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {t('analyze.description')}
          </p>
        </div>

        {isAuthenticated && creditCheckComplete && (
          <div className="mb-6">
            <CreditStatus key={creditStatusKey} />
            {hasCredits === false && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">No Analysis Credits Available</h3>
                    <p className="text-sm text-red-700 mt-1">
                      You don't have any credits remaining to analyze documents. Purchase credits to continue.
                    </p>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={handlePayPerDocument}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Buy Single Analysis ($1.50)
                      </button>
                      <Link
                        href="/pricing"
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        View All Plans
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress indicators moved to top for better visibility */}
        {isUploading && !needsClientProcessing && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">{t('analyze.uploadingDocument')}</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-500">{t('analyze.uploadingMessage')}</p>
          </div>
        )}
        
        {!needsClientProcessing && (
          <AnalysisProgressIndicator 
            isAnalyzing={isAnalyzing}
            duration={45000} // 45 seconds expected duration
          />
        )}

        {uploadStatus === 'idle' && (
          <div className="mt-10">
            <DocumentUploader
              onUploadStart={handleUploadStart}
              onUploadProgress={handleUploadProgress}
              onUploadComplete={handleUploadComplete}
              onError={handleError}
              onFileSelected={(file, startUpload) => {
                // Check credits before allowing file upload
                if (hasCredits === false) {
                  setErrorMessage('You don\'t have any credits remaining. Please purchase credits to analyze documents or visit our pricing page.');
                  return;
                }
                // Store file info first
                handleUploadedFile(file);
                // Then start the upload process
                startUpload();
              }}
              disabled={hasCredits === false}
            />
          </div>
        )}
        
        {/* Show analysis results when complete */}
        {uploadStatus === 'complete' && analysisResults && (
          <div className="mt-8">
            <AnalysisResults results={analysisResults} />
          </div>
        )}
        
        {needsClientProcessing && uploadedFile && (
          <>
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800">{t('analyze.scannedDocumentDetected')}</h3>
              <p className="text-sm text-yellow-700">
                {t('analyze.scannedDocumentDescription')}
              </p>
            </div>
            
            <ScannedPdfProcessor
              file={uploadedFile}
              onTextExtracted={handleTextExtracted}
              onError={setErrorMessage}
            />
          </>
        )}
        
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700">{errorMessage}</p>
            <button 
              onClick={resetAnalysis}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        )}
      </div>

      {/* Legal Links Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 hover:underline">
              {t('common.termsOfService')}
            </a>
            <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 hover:underline">
              {t('common.privacyPolicy')}
            </a>
            <a href="/refund-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 hover:underline">
              {t('common.refundPolicy')}
            </a>
            <a href="mailto:legalhelperai@protonmail.com" className="hover:text-gray-700 hover:underline flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              {t('common.contactEmail')}
            </a>
            <span>© {new Date().getFullYear()} LegalHelper. {t('common.allRightsReserved')}</span>
          </div>
        </div>
      </footer>
    </>
  )
}