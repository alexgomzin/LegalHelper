'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
import { useState, useRef } from 'react'
import { trackGetStartedClick } from '@/utils/gtag'

export default function Home() {
  const { t } = useTranslation()
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  return (
    <>
      <Head>
        <title>LegalHelper</title>
        <meta name="description" content="AI-powered legal document analysis - Upload your legal documents for risk analysis and summarization" />
      </Head>
      
    <div>
      {/* Hero Section with gradient background */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white rounded-full opacity-20"></div>
          <div className="absolute -left-20 top-1/2 w-64 h-64 bg-white rounded-full opacity-20"></div>
          <div className="absolute right-1/3 bottom-0 w-80 h-80 bg-white rounded-full opacity-20"></div>
        </div>
        <div className="container mx-auto py-20 px-6 relative z-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {t('home.title')}
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {t('home.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/analyze" className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-md shadow-lg hover:bg-blue-50 transition-colors" onClick={trackGetStartedClick}>
                  {t('home.getStarted')}
                </Link>
              </div>
              
              <div className="mt-12 flex items-center">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="ml-4 text-sm">{t('home.trustedBy')}</p>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="relative bg-white p-2 rounded-lg shadow-2xl transform hover:-translate-y-1 transition-transform duration-300">
                <div className="w-full max-w-lg bg-white rounded-md overflow-hidden">
                  <div className="h-8 bg-gray-100 flex items-center px-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-bold text-gray-800">{t('home.analysisResultsTitle')}</div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="mb-2 text-sm font-semibold text-gray-700">{t('home.riskOverview')}</div>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-20 h-4 bg-red-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 w-1/4"></div>
                        </div>
                        <span className="text-xs text-gray-600">{t('home.highRisksCount')}</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-20 h-4 bg-yellow-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 w-1/2"></div>
                        </div>
                        <span className="text-xs text-gray-600">{t('home.mediumRisksCount')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-4 bg-green-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 w-3/4"></div>
                        </div>
                        <span className="text-xs text-gray-600">{t('home.lowRisksCount')}</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="mb-3 text-sm font-semibold text-gray-700">{t('home.topConcerns')}</div>
                      
                      <div className="border-l-4 border-red-500 pl-3 py-2 mb-3">
                        <div className="text-sm font-medium text-gray-800">{t('home.terminationClause')}</div>
                        <div className="text-xs text-gray-600">{t('home.terminationIssue')}</div>
                      </div>
                      
                      <div className="border-l-4 border-red-500 pl-3 py-2 mb-3">
                        <div className="text-sm font-medium text-gray-800">{t('home.liabilityLimitation')}</div>
                        <div className="text-xs text-gray-600">{t('home.liabilityIssue')}</div>
                      </div>
                      
                      <div className="border-l-4 border-yellow-500 pl-3 py-2">
                        <div className="text-sm font-medium text-gray-800">{t('home.paymentTerms')}</div>
                        <div className="text-xs text-gray-600">{t('home.paymentIssue')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">{t('home.accuracyRate')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10x</div>
              <div className="text-gray-600">{t('home.fasterAnalysis')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5,000+</div>
              <div className="text-gray-600">{t('home.documentsAnalyzed')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">{t('home.alwaysAvailable')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('home.features')}</h2>
            <p className="text-xl text-gray-600">{t('home.featuresDescription')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-blue-100 text-blue-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('home.riskAnalysis')}</h3>
              <p className="text-gray-600">
                {t('home.riskAnalysisDesc')}
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-indigo-100 text-indigo-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('home.summarization')}</h3>
              <p className="text-gray-600">
                {t('home.summarizationDesc')}
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-purple-100 text-purple-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('home.secureProcessing')}</h3>
              <p className="text-gray-600">
                {t('home.secureProcessingDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('home.howItWorksTitle')}</h2>
            <p className="text-xl text-gray-600">{t('home.howItWorksDesc')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-2 bg-blue-600"></div>
              <div className="p-6">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('home.step1Title')}</h3>
                <p className="text-gray-600">
                  {t('home.step1Desc')}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-2 bg-indigo-600"></div>
              <div className="p-6">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('home.step2Title')}</h3>
                <p className="text-gray-600">
                  {t('home.step2Desc')}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-2 bg-purple-600"></div>
              <div className="p-6">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('home.step3Title')}</h3>
                <p className="text-gray-600">
                  {t('home.step3Desc')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/analyze" className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors" onClick={trackGetStartedClick}>
              {t('home.tryNow')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('home.ctaTitle')}</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            {t('home.ctaDesc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/analyze" className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-md shadow-lg hover:bg-blue-50 transition-colors" onClick={trackGetStartedClick}>
              {t('home.startFreeAnalysis')}
            </Link>
            <Link href="/how-it-works" className="px-8 py-4 bg-transparent border-2 border-white text-white font-medium rounded-md hover:bg-white/10 transition-colors">
              {t('common.howItWorks')}
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg p-2 max-w-3xl w-full mx-4">
            <div className="flex justify-end mb-2">
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="bg-gray-200 rounded-full p-2 hover:bg-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
              <div className="text-center p-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600">Demo Video Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
    </>
  )
} 