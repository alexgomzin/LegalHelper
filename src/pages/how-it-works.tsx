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
      
      <div className="bg-white">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              How LegalHelper Works
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Understand how our AI-powered platform analyzes your legal documents to identify risks and provide insights.
            </p>
          </div>
        </div>

        {/* Steps Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Simple Process</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Three easy steps to analyze your documents
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <span className="text-xl font-bold">1</span>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Upload Your Document</p>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Simply upload your legal document in PDF, Word, or text format. Our system supports various file types and sizes up to 10MB.
                </dd>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <span className="text-xl font-bold">2</span>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">AI Analysis</p>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Our advanced AI engine analyzes your document, identifying potential risks, clauses of concern, and key legal issues within minutes.
                </dd>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <span className="text-xl font-bold">3</span>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Get Results</p>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Receive a comprehensive report with identified risks, suggestions for improvement, and actionable insights to protect your interests.
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">What We Analyze</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Comprehensive Document Analysis
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Risk Identification</p>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Identifies potential legal risks, unfavorable clauses, and terms that could disadvantage you in the agreement.
                  </dd>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Clause Analysis</p>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Examines individual clauses for clarity, enforceability, and potential issues that may arise during execution.
                  </dd>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Compliance Check</p>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Verifies compliance with common legal standards and highlights areas that may require legal review.
                  </dd>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Recommendations</p>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Provides actionable recommendations for improving the document and protecting your legal interests.
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to analyze your document?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-200">
              Get started with our AI-powered legal document analysis today.
            </p>
            <button
              onClick={handleAnalyzeClick}
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto"
            >
              Start Analysis
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Prevent static generation
export async function getServerSideProps() {
  return {
    props: {}
  }
} 