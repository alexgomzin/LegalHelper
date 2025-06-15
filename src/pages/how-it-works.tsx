'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'

export default function HowItWorks() {
  const { t } = useTranslation()
  const { isAuthenticated, navigateTo } = useAuth()
  const router = useRouter()

  const handleAnalyzeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAuthenticated) {
      router.push('/analyze')
    } else {
      router.push('/login?redirect=/analyze')
    }
  }

  return (
    <>
      <Head>
        <title>How It Works - LegalHelper</title>
        <meta name="description" content="Learn how LegalHelper uses AI to analyze legal documents and identify potential risks and issues." />
      </Head>

      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-white rounded-full opacity-20"></div>
            <div className="absolute -left-20 top-1/2 w-64 h-64 bg-white rounded-full opacity-20"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('howItWorks.title')}</h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                {t('howItWorks.description')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            {/* Process Steps */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">{t('howItWorks.process')}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-bold text-2xl mb-6 mx-auto">1</div>
                  <h3 className="text-xl font-semibold mb-4 text-center">{t('howItWorks.upload')}</h3>
                  <p className="text-gray-600 text-center">
                    {t('howItWorks.uploadDesc')}
                  </p>
                </div>
                
                {/* Step 2 */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-bold text-2xl mb-6 mx-auto">2</div>
                  <h3 className="text-xl font-semibold mb-4 text-center">{t('howItWorks.aiAnalysis')}</h3>
                  <p className="text-gray-600 text-center">
                    {t('howItWorks.aiAnalysisDesc')}
                  </p>
                </div>
                
                {/* Step 3 */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-bold text-2xl mb-6 mx-auto">3</div>
                  <h3 className="text-xl font-semibold mb-4 text-center">{t('howItWorks.reviewResults')}</h3>
                  <p className="text-gray-600 text-center">
                    {t('howItWorks.reviewResultsDesc')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Technology Section */}
            <div className="mb-20 bg-gray-50 rounded-2xl p-10">
              <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">{t('howItWorks.technology')}</h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="mb-10">
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                      </svg>
                      <h3 className="text-xl font-semibold text-gray-800">{t('howItWorks.advancedAI')}</h3>
                    </div>
                    <p className="text-gray-600 ml-11">
                      {t('howItWorks.advancedAIDesc1')}
                    </p>
                    <p className="text-gray-600 ml-11 mt-3">
                      {t('howItWorks.advancedAIDesc2')}
                    </p>
                  </div>
                
                  <div>
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <h3 className="text-xl font-semibold text-gray-800">{t('howItWorks.legalExpertise')}</h3>
                    </div>
                    <p className="text-gray-600 ml-11">
                      {t('howItWorks.legalExpertiseDesc1')}
                    </p>
                    <p className="text-gray-600 ml-11 mt-3">
                      {t('howItWorks.legalExpertiseDesc2')}
                    </p>
                  </div>
                </div>
                
                <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-90"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-white">
                      <div className="mb-6 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-white opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold mb-3 text-center">{t('howItWorks.mlPowered')}</h4>
                      <p className="text-center text-blue-100">
                        {t('howItWorks.mlPoweredDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Risk Classification */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">{t('howItWorks.riskClassification')}</h2>
              <p className="text-lg text-gray-600 mb-10 text-center max-w-3xl mx-auto">
                {t('howItWorks.riskClassificationDesc')}
              </p>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6 bg-white shadow-lg rounded-xl border-t-4 border-red-500 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-red-700">{t('howItWorks.highRisk')}</h3>
                  </div>
                  <p className="text-gray-600">
                    {t('howItWorks.highRiskDesc')}
                  </p>
                </div>
                
                <div className="p-6 bg-white shadow-lg rounded-xl border-t-4 border-yellow-500 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-yellow-700">{t('howItWorks.mediumRisk')}</h3>
                  </div>
                  <p className="text-gray-600">
                    {t('howItWorks.mediumRiskDesc')}
                  </p>
                </div>
                
                <div className="p-6 bg-white shadow-lg rounded-xl border-t-4 border-green-500 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-green-700">{t('howItWorks.lowRisk')}</h3>
                  </div>
                  <p className="text-gray-600">
                    {t('howItWorks.lowRiskDesc')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-800 rounded-2xl p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-6">{t('howItWorks.readyToAnalyze')}</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                {t('howItWorks.joinThousands')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={handleAnalyzeClick}
                  className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-md shadow-lg hover:bg-blue-50 transition-colors"
                >
                  {isAuthenticated ? t('howItWorks.tryItNow') : t('howItWorks.loginToAnalyze')}
                </button>
                {!isAuthenticated && (
                  <Link href="/register" className="px-8 py-4 bg-transparent border-2 border-white text-white font-medium rounded-md hover:bg-white/10 transition-colors">
                    {t('howItWorks.createFreeAccount')}
                  </Link>
                )}
              </div>
            </div>
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
      </div>
    </>
  )
} 