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
        <title>{t('howItWorks.heroTitle')} - LegalHelper</title>
        <meta name="description" content={t('howItWorks.heroDescription')} />
      </Head>
      
      <div className="-mx-4 -my-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
              {t('howItWorks.heroTitle')}
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              {t('howItWorks.heroDescription')}
            </p>
          </div>
        </div>

        {/* Steps Section */}
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-2">{t('howItWorks.simpleProcess')}</h2>
              <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {t('howItWorks.threeEasySteps')}
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('howItWorks.step1Title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('howItWorks.step1Description')}
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white">
                    <span className="text-lg font-bold">2</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('howItWorks.step2Title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('howItWorks.step2Description')}
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-6">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-600 text-white">
                    <span className="text-lg font-bold">3</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('howItWorks.step3Title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('howItWorks.step3Description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-2">{t('howItWorks.whatWeAnalyze')}</h2>
              <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {t('howItWorks.comprehensiveAnalysis')}
              </p>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                {t('howItWorks.analysisDescription')}
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
                  <h3 className="text-xl font-semibold text-gray-900">{t('howItWorks.riskIdentification')}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {t('howItWorks.riskIdentificationDesc')}
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 text-blue-600 mr-4">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{t('howItWorks.clauseAnalysis')}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {t('howItWorks.clauseAnalysisDesc')}
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 text-green-600 mr-4">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{t('howItWorks.complianceCheck')}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {t('howItWorks.complianceCheckDesc')}
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 text-purple-600 mr-4">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{t('howItWorks.smartRecommendations')}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {t('howItWorks.smartRecommendationsDesc')}
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
                {t('howItWorks.whyChoose')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('howItWorks.whyChooseDesc')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('howItWorks.fastEfficient')}</h3>
                <p className="text-gray-600">
                  {t('howItWorks.fastEfficientDesc')}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('howItWorks.securePrivate')}</h3>
                <p className="text-gray-600">
                  {t('howItWorks.securePrivateDesc')}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-6">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('howItWorks.costEffective')}</h3>
                <p className="text-gray-600">
                  {t('howItWorks.costEffectiveDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              {t('howItWorks.readyToAnalyzeTitle')}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t('howItWorks.readyToAnalyzeDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAnalyzeClick}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200"
              >
                {t('howItWorks.startAnalysisNow')}
              </button>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-blue-200 text-base font-medium rounded-lg text-white hover:bg-blue-600 transition-colors duration-200"
              >
                {t('howItWorks.viewPricing')}
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