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
  const [showPaymentModal, setShowPaymentModal] = useState(false)

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
      
      try {
        const response = await fetch(`/api/payment/check-credits?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setHasCredits(data.has_credits);
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
      checkCredits();
    }
  }, [user]);

  const handleUploadStart = async () => {
    // Always check credits in real-time before upload starts
    if (user) {
      try {
        const response = await fetch(`/api/payment/check-credits?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (!data.has_credits) {
            setErrorMessage('You don\'t have any credits remaining. Please purchase credits to analyze documents.');
            setShowPaymentModal(true);
            return;
          }
          setHasCredits(data.has_credits);
        } else if (response.status === 404) {
          // User not found in profiles table - treat as no credits
          setErrorMessage('You don\'t have any credits remaining. Please purchase credits to analyze documents.');
          setShowPaymentModal(true);
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
            setShowPaymentModal(true);
            return;
          }
          setHasCredits(data.has_credits);
        } else if (response.status === 404) {
          // User not found in profiles table - treat as no credits
          setErrorMessage('You don\'t have any credits remaining. Please purchase credits to analyze documents.');
          setShowPaymentModal(true);
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
    
    if (analysisResults) {
      console.log('Analysis results found in session storage')
      
      try {
        // Parse results to make sure they're valid
        const parsedResults = JSON.parse(analysisResults)
        
        // Update document status and store results both locally and in Supabase
        await storeAndUpdateResults(fileId, documentName, parsedResults, 'Analyzed')
        
        // Add a delay to show "Analysis complete" status before redirecting
        setTimeout(() => {
          setIsAnalyzing(false)
          router.push(`/documents/${fileId}`)
        }, 2000)
        
        return
      } catch (error: any) {
        console.error('Error parsing analysis results:', error)
        // Continue with analysis if parsing fails
      }
    }
    
    // If we don't have analysis results, request them from the server
    if (!needsClientProcessing) {
      try {
        // Check credits FIRST before starting any analysis UI or processing
        if (user) {
          try {
            const useCreditsResponse = await fetch('/api/payment/use-credit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                user_id: user.id,
                document_id: fileId
              }),
            });
            
            if (!useCreditsResponse.ok) {
              const errorData = await useCreditsResponse.json();
              if (errorData.error === 'No credits remaining') {
                setIsAnalyzing(false);
                setErrorMessage('You don\'t have any credits remaining. Please purchase credits to analyze documents.');
                setShowPaymentModal(true);
                return;
              }
              // For ANY credit error, stop the analysis - don't allow free analysis
              console.error('Credit validation failed:', errorData.error);
              setIsAnalyzing(false);
              setErrorMessage('Unable to validate credits. Please try again or contact support.');
              return;
            }
          } catch (error) {
            console.error('Error using credit:', error);
            // Don't continue with analysis if credit check fails
            setIsAnalyzing(false);
            setErrorMessage('Unable to validate credits. Please check your connection and try again.');
            return;
          }
        }
        
        console.log('Requesting document analysis from server...')
        
        // Now update status to Processing (AFTER credit check passes)
        if (user) {
          await updateSupabaseDocumentStatus(user.id, fileId, 'Processing')
        }
        updateLocalDocumentStatus(fileId, 'Processing')
        
        // If we reach here, we need to make an API call to analyze the document
        const response = await fetch('/api/analyze-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileId }),
        })
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.analysis) {
          console.log('Analysis completed successfully')
          
          // Store the analysis results both locally and in Supabase
          await storeAndUpdateResults(fileId, documentName, data.analysis, 'Analyzed')
          
          // Double-check that the analysis was stored properly
          setTimeout(() => {
            const storedAnalysis = localStorage.getItem(`analysis-${fileId}`)
            if (!storedAnalysis) {
              console.warn('Analysis results not properly stored in localStorage, retrying...')
              storeLocalAnalysisResults(fileId, data.analysis)
            }
          }, 500)
          
          // Redirect to the document details page
          setTimeout(() => {
            setIsAnalyzing(false)
            router.push(`/documents/${fileId}`)
          }, 1500)
        } else {
          throw new Error(data.error || 'Unknown error during analysis')
        }
      } catch (error) {
        console.error('Error during document analysis:', error);
        setIsAnalyzing(false);
        setErrorMessage(`Failed to analyze document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Even if analysis fails, keep the document with "Error" status
        await storeAndUpdateResults(fileId, documentName, { error: 'Analysis failed' }, 'Error')
      }
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
    setIsUploading(false)
    setErrorMessage(errorMessage)
    
    // Check if error indicates scanned document
    if (errorMessage.includes('minimal text') || 
        errorMessage.includes('scanned') || 
        errorMessage.includes('No text could be extracted')) {
      // Document might be scanned, let's try client-side processing
      setNeedsClientProcessing(true)
    }
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
              setShowPaymentModal(true);
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
        // Add document to localStorage with Processing status
        addDocument(tempId, documentName, 'Processing')
        
        // Update status in Supabase as well if user is authenticated
        if (user) {
          await updateSupabaseDocumentStatus(user.id, tempId, 'Processing')
        }
        
        // Submit the extracted text to the server for analysis
        const response = await fetch('/api/analyze-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            fileName: documentName
          }),
        })
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          // Store the document ID in session storage
          sessionStorage.setItem('fileId', tempId)
          
          // Store analysis results both locally and in Supabase
          await storeAndUpdateResults(tempId, documentName, data.analysis, 'Analyzed')
          
          // Redirect to results
          setTimeout(() => {
            setIsAnalyzing(false)
            router.push(`/documents/${tempId}`)
          }, 1500)
        } else {
          throw new Error(data.error || 'Error analyzing document')
        }
      } catch (err: any) {
        console.error('Error analyzing extracted text:', err)
        setIsAnalyzing(false)
        setErrorMessage(`Error analyzing document: ${err.message || 'Unknown error'}`)
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
  const handlePayPerDocument = async () => {
    // Use the Paddle provider instead of direct initialization
    const openCheckout = () => {
    if (!user) return;
    
      // @ts-ignore - Paddle is loaded via PaddleProvider
      if (window.Paddle) {
    window.Paddle.Checkout.open({
          product: process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT || 'PAY_PER_DOCUMENT',
      email: user.email,
      successCallback: (data: any) => {
        // Handle successful purchase
        console.log('Purchase successful', data);
        // Call API to record the purchase
        fetch('/api/payment/pay-per-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            checkout_id: data.checkout.id,
            user_id: user.id,
          }),
        }).then(() => {
          // Refresh credit status
          setHasCredits(true);
          setShowPaymentModal(false);
        });
      }
    });
      } else {
        console.error('Paddle is not loaded yet');
        setErrorMessage('Payment system is loading, please try again in a moment.');
      }
    };

    // Try to open checkout directly if Paddle is already loaded
    if (window.Paddle) {
      openCheckout();
    } else {
      // Wait a bit for Paddle to load
      setTimeout(() => {
        if (window.Paddle) {
          openCheckout();
        } else {
          setErrorMessage('Payment system failed to load. Please refresh the page and try again.');
        }
      }, 2000);
    }
  };

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

  // Payment modal for when user has no credits
  const PaymentModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{t('common.needCreditsTitle')}</h2>
        <p className="mb-6">
          {t('common.needCreditsMessage')}
        </p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={handlePayPerDocument}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {t('common.payForAnalysis')}
          </button>
          <Link href="/pricing" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-center hover:bg-gray-300">
            {t('common.viewPricingPlans')}
          </Link>
          <button 
            onClick={() => setShowPaymentModal(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{t('analyze.title')} | LegalHelper</title>
      </Head>

      {showPaymentModal && <PaymentModal />}

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
            <CreditStatus 
              onNoCredits={() => setShowPaymentModal(true)}
            />
          </div>
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
                  setShowPaymentModal(true);
                  return;
                }
                // Store file info first
                handleUploadedFile(file);
                // Then start the upload process
                startUpload();
              }}
              disabled={showPaymentModal}
            />
          </div>
        )}

        {isUploading && !needsClientProcessing && (
          <div className="my-8">
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