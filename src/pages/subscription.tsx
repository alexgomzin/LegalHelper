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

  const handleCreditsPackage = (packageSize: 5 | 15 | 30) => {
    if (!user) return;
    window.location.href = `/checkout?plan=pack${packageSize}`;
  };

  const handleSubscription = () => {
    if (!user) return;
    window.location.href = '/checkout?plan=subscription';
  };

  // Don't render if not loaded or not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <>
      <Head>
        <title>{t('subscription.title')} - LegalHelper</title>
      </Head>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('subscription.manageSubscription')}
        </h1>

        {/* Current Plan Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('subscription.currentPlan')}
          </h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium text-blue-600">
                {currentPlan === 'subscription' && t('subscription.subscriptionPlan')}
                {currentPlan === 'credits' && `${t('subscription.creditsPlan')} (${creditsRemaining} ${t('subscription.creditsRemaining')})`}
                {currentPlan === 'free' && t('subscription.freePlan')}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {currentPlan === 'subscription' && t('subscription.subscriptionDescription')}
                {currentPlan === 'credits' && t('subscription.creditsDescription')}
                {currentPlan === 'free' && t('subscription.freeDescription')}
              </p>
            </div>
            {currentPlan === 'free' && (
              <button
                onClick={() => router.push('/pricing')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('subscription.upgrade')}
              </button>
            )}
          </div>
        </div>

        {/* Quick Purchase Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pay-as-you-go */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t('subscription.payAsYouGo')}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {t('subscription.payAsYouGoDescription')}
            </p>
            <div className="text-2xl font-bold text-green-600 mb-4">$1.50</div>
            <button
              onClick={handlePayAsYouGo}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              {t('subscription.buyNow')}
            </button>
          </div>

          {/* 5 Credits Package */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t('subscription.pack5')}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {t('subscription.pack5Description')}
            </p>
            <div className="text-2xl font-bold text-blue-600 mb-4">$5.50</div>
            <button
              onClick={() => handleCreditsPackage(5)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('subscription.buyNow')}
            </button>
          </div>

          {/* 15 Credits Package */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t('subscription.pack15')}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {t('subscription.pack15Description')}
            </p>
            <div className="text-2xl font-bold text-blue-600 mb-4">$12.00</div>
            <button
              onClick={() => handleCreditsPackage(15)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('subscription.buyNow')}
            </button>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-500 md:col-span-2 lg:col-span-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {t('subscription.monthlySubscription')}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {t('subscription.subscriptionFullDescription')}
                </p>
                <div className="text-2xl font-bold text-purple-600 mb-4">$30.00/month</div>
              </div>
              <div className="text-right">
                <button
                  onClick={handleSubscription}
                  className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  {currentPlan === 'subscription' ? t('subscription.manage') : t('subscription.subscribe')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Billing History (placeholder) */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('subscription.billingHistory')}
          </h2>
          <p className="text-gray-600">
            {t('subscription.billingHistoryDescription')}
          </p>
        </div>
      </div>
    </>
  );
}

// Prevent static generation
export async function getServerSideProps() {
  return {
    props: {}
  }
} 