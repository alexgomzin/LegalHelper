'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useTranslation } from '@/contexts/LanguageContext'

interface PricingTier {
  name: string;
  id: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  mostPopular: boolean;
}

export default function Pricing() {
  const [mounted, setMounted] = useState(false)
  const { user, isLoading } = useAuth()
  const { t } = useTranslation()
  
  // Set mounted state for client-side rendering
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const pricingTiers: PricingTier[] = [
    {
      name: t('common.subscriptionPage.freeTrialTitle'),
      id: 'free',
      price: '$0',
      description: t('common.subscriptionPage.freeDocumentAnalysis'),
      features: [
        `1 ${t('common.subscriptionPage.freeDocumentAnalysis')}`,
        t('common.subscriptionPage.oneTimeOnly'),
        t('common.subscriptionPage.riskIdentification'),
        t('common.subscriptionPage.documentSummarization'),
        t('common.subscriptionPage.emailSupport')
      ],
      cta: t('common.signup'),
      mostPopular: false
    },
    {
      name: t('common.subscriptionPage.payAsYouGoTitle'),
      id: 'payg',
      price: '$1.50',
      description: t('common.subscriptionPage.perAnalysis'),
      features: [
        `$1.50 ${t('common.subscriptionPage.perAnalysis')}`,
        t('common.subscriptionPage.noSubscriptionRequired'),
        t('common.subscriptionPage.payOnlyWhenNeed'),
        t('common.subscriptionPage.allAnalysisFeatures'),
        t('common.subscriptionPage.perfectOccasionalUse')
      ],
      cta: t('common.subscriptionPage.payAmount'),
      mostPopular: false
    },
    {
      name: t('common.subscriptionPage.analysisPackagesTitle'),
      id: 'packages',
      price: 'From $5.50',
      description: t('common.subscriptionPage.oneTimePurchase'),
      features: [
        `5 ${t('common.subscriptionPage.analysesEach')}`,
        `15 ${t('common.subscriptionPage.save11Percent')}`,
        t('common.subscriptionPage.oneTimePurchase'),
        t('common.subscriptionPage.creditsNeverExpire'),
        t('common.subscriptionPage.allAnalysisFeatures')
      ],
      cta: t('common.subscriptionPage.buyStarterPack'),
      mostPopular: false
    },
    {
      name: t('common.subscriptionPage.subscriptionTitle'),
      id: 'subscription',
      price: '$30.00',
      description: `50 ${t('common.subscriptionPage.analysesPerMonth')} – $30.00`,
      features: [
        `50 ${t('common.subscriptionPage.analysesPerMonth')} – $30.00`,
        t('common.subscriptionPage.onlyPerAnalysis'),
        t('common.subscriptionPage.perMonth'),
        t('common.subscriptionPage.cancelAnytime'),
        t('common.subscriptionPage.bestForHighVolume')
      ],
      cta: t('common.subscriptionPage.subscribe'),
      mostPopular: true
    }
  ]
  
  const handlePurchase = (tierId: string, productId?: string) => {
    // Only run on client-side
    if (!mounted) return
    
    // Don't proceed if still loading authentication
    if (isLoading) {
      console.log('Authentication still loading...')
      return
    }
    
    if (!user) {
      // Redirect to login if not authenticated
      if (typeof window !== 'undefined') {
        window.location.href = `/login?redirect=pricing&plan=${tierId}`
      }
      return
    }

    if (tierId === 'free') {
      // Redirect to dashboard for free plan
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard'
      }
      return
    }

    // Redirect to checkout page with plan and product parameters
    let checkoutUrl = `/checkout?plan=${tierId}`
    
    if (productId) {
      checkoutUrl += `&product=${productId}`
    }
    
    // Use window.location for client-side navigation
    if (typeof window !== 'undefined') {
      window.location.href = checkoutUrl
    }
  }
  
  return (
    <>
      <Head>
        <title>{t('common.pricing')} | LegalHelper</title>
      </Head>
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-5xl">
              {t('common.subscriptionPage.title')}
            </h1>
            <p className="mt-5 text-xl text-gray-500">
              {t('common.subscriptionPage.subtitle')}
            </p>
            <p className="mt-3 text-lg text-gray-600 font-medium">
              {t('common.subscriptionPage.choosePackageNeed')}
            </p>
          </div>
          
          <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`${
                  tier.mostPopular
                    ? 'border-2 border-blue-500 shadow-md lg:-mt-2 lg:-mb-2'
                    : 'border border-gray-200'
                } relative flex flex-col rounded-lg bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500`}
              >
                {tier.mostPopular && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 transform">
                    <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                      {t('common.subscriptionPage.mostPopular')}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
                  <p className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                  </p>
                  <p className="mt-6 text-gray-500">{tier.description}</p>
                  
                  <ul role="list" className="mt-6 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex">
                        <svg
                          className="h-5 w-5 flex-shrink-0 text-green-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2 text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Purchase buttons with proper auth handling */}
                {tier.id === 'payg' ? (
                  <button
                    onClick={() => handlePurchase('payg')}
                    disabled={isLoading}
                    className={`mt-8 block w-full rounded-md border border-transparent py-3 px-6 text-center font-medium text-white ${
                      isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                                      >
                      {isLoading ? t('common.subscriptionPage.loading') : t('common.subscriptionPage.payAmount')}
                    </button>
                  ) : tier.id === 'packages' ? (
                    <div className="mt-8 space-y-2">
                      <button
                        onClick={() => handlePurchase('pack5')}
                        disabled={isLoading}
                        className={`block w-full rounded-md border border-transparent py-3 px-6 text-center font-medium text-white ${
                          isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isLoading ? t('common.subscriptionPage.loading') : t('common.subscriptionPage.buyStarterPack')}
                      </button>
                      <button
                        onClick={() => handlePurchase('pack15')}
                        disabled={isLoading}
                        className={`block w-full rounded-md border border-transparent py-3 px-6 text-center font-medium text-white ${
                          isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isLoading ? t('common.subscriptionPage.loading') : t('common.subscriptionPage.buyProfessionalPack')}
                      </button>
                      <button
                        onClick={() => handlePurchase('pack30')}
                        disabled={isLoading}
                        className={`block w-full rounded-md border border-transparent py-3 px-6 text-center font-medium text-white ${
                          isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isLoading ? t('common.subscriptionPage.loading') : t('common.subscriptionPage.buyBusinessPack')}
                      </button>
                    </div>
                  ) : tier.id === 'subscription' ? (
                    <button
                      onClick={() => handlePurchase('subscription')}
                      disabled={isLoading}
                      className={`mt-8 block w-full rounded-md border border-transparent py-3 px-6 text-center font-medium text-white ${
                        isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {isLoading ? t('common.subscriptionPage.loading') : t('common.subscriptionPage.subscribe')}
                    </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(tier.id)}
                    disabled={isLoading}
                    className={`mt-8 block w-full rounded-md border border-transparent py-3 px-6 text-center font-medium text-white ${
                      isLoading 
                        ? 'bg-gray-400 cursor-not-allowed'
                        : tier.id === 'free' 
                          ? 'bg-gray-600 hover:bg-gray-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'Loading...' : tier.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-base text-gray-500">
              {t('common.subscriptionPage.allPricesUSD')}
            </p>
          </div>
        </div>
      </div>

      {/* Legal Links Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 hover:underline">
              {t('common.subscriptionPage.termsOfService')}
            </a>
            <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 hover:underline">
              {t('common.subscriptionPage.privacyPolicy')}
            </a>
            <a href="/refund-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 hover:underline">
              {t('common.subscriptionPage.refundPolicy')}
            </a>
            <a href="mailto:legalhelperai@protonmail.com" className="hover:text-gray-700 hover:underline flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              {t('common.subscriptionPage.contactEmail')}
            </a>
            <span>© {new Date().getFullYear()} {t('common.subscriptionPage.allRightsReserved')}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

// This prevents static generation and makes the page server-side rendered
export async function getServerSideProps() {
  return {
    props: {}
  }
} 