'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import Link from 'next/link'
import Head from 'next/head'
import { useState, useRef } from 'react'
import { trackGetStartedClick } from '@/utils/gtag'
import DocumentUploader from '@/components/DocumentUploader'
import { useRouter } from 'next/router'

export default function Home() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleUploadStart = () => {
    setIsUploading(true)
    setUploadProgress(0)
  }

  const handleUploadProgress = (percent: number) => {
    setUploadProgress(percent)
  }

  const handleUploadComplete = () => {
    setIsUploading(false)
    // Redirect to analyze page or show results
  }

  const handleUploadError = (error: string) => {
    setIsUploading(false)
    console.error('Upload error:', error)
  }

  return (
    <>
      <Head>
        <title>LegalHelper - AI Contract Analysis</title>
        <meta name="description" content="Don't pay a lawyer. Upload your contract and AI will find the weak points for free. Get instant legal document analysis." />
      </Head>
      
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section with Bright Headline */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                {t('home.title')}
              </span>
            </h1>
          </div>

          {/* Preview Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                📋 {t('home.previewTitle')}
              </h2>
            </div>
            
            {/* Analysis Preview Mockup */}
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="text-lg font-bold text-gray-800">Contract Analysis Report</div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Risk Overview</div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-sm">High Risk: 3 issues found</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-sm">Medium Risk: 5 issues found</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm">Low Risk: 8 issues found</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Critical Issues</div>
                  <div className="space-y-3">
                    <div className="border-l-4 border-red-500 pl-3 py-1">
                      <div className="text-sm font-medium text-gray-800">Termination Clause</div>
                      <div className="text-xs text-gray-600">One-sided termination rights</div>
                    </div>
                    <div className="border-l-4 border-red-500 pl-3 py-1">
                      <div className="text-sm font-medium text-gray-800">Liability Cap</div>
                      <div className="text-xs text-gray-600">Unlimited liability exposure</div>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-3 py-1">
                      <div className="text-sm font-medium text-gray-800">Payment Terms</div>
                      <div className="text-xs text-gray-600">90-day payment terms</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Form Section */}
          <div className="mb-16">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  📤 {t('home.uploadPrompt')}
                </h2>
              </div>
              
              <div className="mb-6">
                <DocumentUploader
                  onUploadStart={handleUploadStart}
                  onUploadProgress={handleUploadProgress}  
                  onUploadComplete={handleUploadComplete}
                  onError={handleUploadError}
                  disabled={isUploading}
                />
              </div>
              
              <div className="text-center">
                <Link 
                  href="/analyze" 
                  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-lg rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:scale-105"
                  onClick={trackGetStartedClick}
                >
                  {t('home.reportButton')}
                </Link>
              </div>
            </div>
          </div>

          {/* AI Explanation Section */}
          <div className="mb-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🧠 {t('home.aiExplanationTitle')}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <div className="text-4xl mb-3">⚠️</div>
                  <div className="font-semibold text-gray-800">
                    {t('home.aiExplanation1')}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <div className="text-4xl mb-3">⚖️</div>
                  <div className="font-semibold text-gray-800">
                    {t('home.aiExplanation2')}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <div className="text-4xl mb-3">📋</div>
                  <div className="font-semibold text-gray-800">
                    {t('home.aiExplanation3')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Free Analysis Highlight */}
          <div className="mb-16">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                ✅ {t('home.freeAnalysisTitle')}
              </h2>
              <p className="text-green-100 text-lg">
                No credit card required • Instant results • Complete analysis
              </p>
            </div>
          </div>

          {/* Trust Block */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🧲 {t('home.trustBlockTitle')}
              </h2>
            </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
                <div className="text-gray-600 text-sm">Contracts Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-gray-600 text-sm">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">$2.3M</div>
                <div className="text-gray-600 text-sm">Risk Avoided</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">&lt; 5min</div>
                <div className="text-gray-600 text-sm">Average Analysis</div>
              </div>
            </div>

            {/* Fake Reviews */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic mb-3">
                  {t('home.fakeReview1')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic mb-3">
                  {t('home.fakeReview2')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Links Footer */}
      <footer className="py-8 border-t border-gray-200 bg-gray-50">
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