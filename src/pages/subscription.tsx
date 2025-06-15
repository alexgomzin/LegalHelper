'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { PaddleProvider } from '@/components/PaddleProvider';
import { usePaddle } from '@/components/PaddleProvider';
import { useTranslation } from '@/contexts/LanguageContext';

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isLoaded, openCheckout } = usePaddle();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<'free' | 'credits' | 'subscription'>('free');
  const [creditsRemaining, setCreditsRemaining] = useState(0);

  // Fetch user's current plan
  useEffect(() => {
    if (!user) return;

    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch(`/api/payment/check-credits?user_id=${user.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setCreditsRemaining(data.credits_remaining || 0);
          
          if (data.subscription_tier === 'subscription') {
            setCurrentPlan('subscription');
          } else if (data.credits_remaining > 0) {
            setCurrentPlan('credits');
          } else {
            setCurrentPlan('free');
          }
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/subscription');
    }
  }, [isAuthenticated, isLoading, router]);

  // Handle purchase functions
  const handlePayAsYouGo = () => {
    if (!user) return;
    window.location.href = '/checkout?plan=payg';
  };

  const handlePurchasePackage = (packType: '5' | '15' | '30') => {
    if (!user) return;
    const productId = packType === '5' ? 'PRODUCT_ID_5_PACK' : packType === '15' ? 'PRODUCT_ID_15_PACK' : 'PRODUCT_ID_30_PACK';
    window.location.href = `/checkout?plan=pack${packType}&product=${productId}`;
  };

  const handleSubscribe = () => {
    if (!user) return;
    window.location.href = '/checkout?plan=subscription&product=PRODUCT_ID_50_PACK_SUBSCRIPTION';
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render the content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PaddleProvider>
      <Head>
        <title>{t('common.subscriptionPage.title')} | LegalHelper</title>
      </Head>
      
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('common.subscriptionPage.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('common.subscriptionPage.subtitle')}
            </p>
          </div>

          {/* Current Status */}
          {user && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('common.subscriptionPage.currentPlanTitle')}</h2>
              <div className="flex items-center justify-between">
                <div>
                  {currentPlan === 'subscription' ? (
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="font-medium text-purple-700">{t('common.subscriptionPage.subscriptionActive')}</span>
                    </div>
                  ) : currentPlan === 'credits' ? (
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="font-medium text-blue-700">{creditsRemaining} {t('common.subscriptionPage.creditsRemaining')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-gray-500 rounded-full mr-2"></div>
                      <span className="font-medium text-gray-700">{t('common.subscriptionPage.freePlan')}</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {currentPlan === 'subscription' ? `50 ${t('common.subscriptionPage.analysesPerMonth')}` : 
                   currentPlan === 'credits' ? `${creditsRemaining} ${t('common.subscriptionPage.analysesAvailable')}` : 
                   `1 ${t('common.subscriptionPage.freeAnalysisUsed')}`}
                </div>
              </div>
            </div>
          )}
          
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('common.subscriptionPage.freeTrialTitle')}</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">$0</div>
                  <p className="text-sm text-gray-500">{t('common.subscriptionPage.oneTimeOnly')}</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    1 {t('common.subscriptionPage.freeDocumentAnalysis')}
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('common.subscriptionPage.riskIdentification')}
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('common.subscriptionPage.documentSummarization')}
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('common.subscriptionPage.emailSupport')}
                  </li>
                </ul>
                
                <button 
                  disabled={currentPlan === 'free'}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                >
                  {currentPlan === 'free' ? t('common.subscriptionPage.currentPlan') : t('common.subscriptionPage.alreadyUsed')}
                </button>
              </div>
            </div>

            {/* Pay-as-you-go */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('common.subscriptionPage.payAsYouGoTitle')}</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">$1.50</div>
                  <p className="text-sm text-gray-500">{t('common.subscriptionPage.perAnalysis')}</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('common.subscriptionPage.payOnlyWhenNeed')}
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('common.subscriptionPage.noSubscriptionRequired')}
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('common.subscriptionPage.perfectOccasionalUse')}
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('common.subscriptionPage.allAnalysisFeatures')}
                  </li>
                </ul>
                
                <button 
                  onClick={handlePayAsYouGo}
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {t('common.subscriptionPage.payAmount')}
                </button>
              </div>
            </div>

            {/* Packages */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-blue-500 overflow-hidden relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {t('common.subscriptionPage.mostPopular')}
                </span>
              </div>
              <div className="p-6 pt-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('common.subscriptionPage.analysisPackagesTitle')}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">$5.50+</div>
                  <p className="text-sm text-gray-500">{t('common.subscriptionPage.oneTimePurchase')}</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="text-sm text-gray-600 text-center">
                    {t('common.subscriptionPage.choosePackageNeed')}
                  </div>
                  
                  {/* Package Options */}
                  <div className="space-y-3">
                    {/* Starter Pack */}
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm text-gray-900">{t('common.subscriptionPage.starterPack')}</div>
                          <div className="text-xs text-gray-500">5 {t('common.subscriptionPage.analysesEach')}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">$5.50</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Professional Pack */}
                    <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm text-gray-900">{t('common.subscriptionPage.professionalPack')}</div>
                          <div className="text-xs text-blue-600">15 {t('common.subscriptionPage.save11Percent')}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">$12.00</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Business Pack */}
                    <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm text-gray-900">{t('common.subscriptionPage.businessPack')}</div>
                          <div className="text-xs text-green-600">30 {t('common.subscriptionPage.save17Percent')}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">$22.50</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    {t('common.subscriptionPage.creditsNeverExpire')}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={() => handlePurchasePackage('5')}
                    className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('common.subscriptionPage.buyStarterPack')}
                  </button>
                  <button 
                    onClick={() => handlePurchasePackage('15')}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('common.subscriptionPage.buyProfessionalPack')}
                  </button>
                  <button 
                    onClick={() => handlePurchasePackage('30')}
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('common.subscriptionPage.buyBusinessPack')}
                  </button>
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('common.subscriptionPage.subscriptionTitle')}</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-2">$30</div>
                  <p className="text-sm text-gray-500">{t('common.subscriptionPage.perMonth')}</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    50 {t('common.subscriptionPage.analysesPerMonth50')}
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('common.subscriptionPage.onlyPerAnalysis')}
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('common.subscriptionPage.bestForHighVolume')}
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('common.subscriptionPage.cancelAnytime')}
                  </li>
                </ul>
                
                {currentPlan === 'subscription' ? (
                  <button 
                    disabled
                    className="w-full py-2 px-4 bg-purple-100 text-purple-600 rounded-lg text-sm font-medium cursor-not-allowed"
                  >
                    {t('common.subscriptionPage.currentPlan')}
                  </button>
                ) : (
                  <button 
                    onClick={handleSubscribe}
                    className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('common.subscriptionPage.subscribe')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              {t('common.subscriptionPage.allPricesUSD')}
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <span>{t('common.subscriptionPage.noHiddenFees')}</span>
              <span>{t('common.subscriptionPage.cancelAnytime')}</span>
              <span>{t('common.subscriptionPage.support24_7')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Links Footer */}
      <footer className="py-8 border-t border-gray-200 bg-white">
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
    </PaddleProvider>
  );
} 