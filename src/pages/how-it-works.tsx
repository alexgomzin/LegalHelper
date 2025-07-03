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
      
      <div className="-mx-4 -my-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
              How LegalHelper Works
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Understand how our AI-powered platform analyzes your legal documents to identify risks and provide actionable insights in minutes.
            </p>
          </div>
        </div>

        {/* Steps Section */}
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-2">Simple Process</h2>
              <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Three Easy Steps to Analyze Your Documents
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white">
                    <span className="text-lg font-bold">1</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Your Document</h3>
                <p className="text-gray-600 leading-relaxed">
                  Simply upload your legal document in PDF, Word, or text format. Our system supports various file types and sizes up to 10MB.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white">
                    <span className="text-lg font-bold">2</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our advanced AI engine analyzes your document, identifying potential risks, clauses of concern, and key legal issues within minutes.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-6">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-600 text-white">
                    <span className="text-lg font-bold">3</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Detailed Results</h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive a comprehensive report with identified risks, suggestions for improvement, and actionable insights to protect your interests.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-2">What We Analyze</h2>
              <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Comprehensive Document Analysis
              </p>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Our AI examines every aspect of your legal document to provide thorough insights and recommendations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-red-100 text-red-600 mr-4">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Risk Identification</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Identifies potential legal risks, unfavorable clauses, and terms that could disadvantage you in the agreement.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 text-blue-600 mr-4">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Clause Analysis</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Examines individual clauses for clarity, enforceability, and potential issues that may arise during execution.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 text-green-600 mr-4">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Compliance Check</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Verifies compliance with common legal standards and highlights areas that may require legal review.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 text-purple-600 mr-4">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Smart Recommendations</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Provides actionable recommendations for improving the document and protecting your legal interests.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
                Why Choose LegalHelper?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our AI-powered platform offers numerous advantages over traditional document review methods.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Fast & Efficient</h3>
                <p className="text-gray-600">
                  Get comprehensive analysis in minutes, not hours or days.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure & Private</h3>
                <p className="text-gray-600">
                  Your documents are processed securely and never stored permanently.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-6">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Cost-Effective</h3>
                <p className="text-gray-600">
                  Affordable alternative to expensive legal consultations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Ready to Analyze Your Document?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust LegalHelper for their document analysis needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAnalyzeClick}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200"
              >
                Start Analysis Now
              </button>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-blue-200 text-base font-medium rounded-lg text-white hover:bg-blue-600 transition-colors duration-200"
              >
                View Pricing
              </Link>
            </div>
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