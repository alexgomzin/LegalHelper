'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { usePaddle } from './PaddleProvider';
import { useTranslation } from '@/contexts/LanguageContext';

interface SubscriptionManagerProps {
  className?: string;
}

export default function SubscriptionManager({ className = '' }: SubscriptionManagerProps) {
  const { user } = useAuth();
  const { isLoaded, openCheckout } = usePaddle();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    tier: string;
    status: string;
    endDate?: string;
    analysesRemaining?: number;
  } | null>(null);

  // Fetch the user's subscription status
  useEffect(() => {
    if (!user) return;

    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch(`/api/payment/check-credits?user_id=${user.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setSubscriptionInfo({
            tier: data.subscription_tier,
            status: data.subscription_tier === 'subscription' ? 'active' : 'none',
            analysesRemaining: data.credits_remaining,
            endDate: user.subscription_end_date,
          });
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  // Function to handle purchasing a subscription
  const handleSubscribe = () => {
    if (!user || !isLoaded) return;

    openCheckout({
      product: 'PRODUCT_ID_PRO_SUBSCRIPTION', // Replace with your actual Paddle product ID
      email: user.email,
      successCallback: (data) => {
        console.log('Subscription successful', data);
        // Call your backend to record the subscription
        fetch('/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            checkout_id: data.checkout.id,
            user_id: user.id,
            product_id: 'PRODUCT_ID_PRO_SUBSCRIPTION',
          }),
        }).then(() => {
          // Refresh the page to update UI
          window.location.reload();
        });
      },
    });
  };

  // Function to handle purchasing analysis packs
  const handlePurchaseAnalyses = (packSize: '5' | '15') => {
    if (!user || !isLoaded) return;

    const productId = packSize === '5' ? 'PRODUCT_ID_5_PACK' : 'PRODUCT_ID_15_PACK';
    
    openCheckout({
      product: productId,
      email: user.email,
      successCallback: (data) => {
        console.log('Analysis pack purchase successful', data);
        // Call your backend to record the purchase
        fetch('/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            checkout_id: data.checkout.id,
            user_id: user.id,
            product_id: productId,
          }),
        }).then(() => {
          // Refresh the page to update UI
          window.location.reload();
        });
      },
    });
  };

  // Function to handle purchasing subscription
  const handlePurchaseSubscription = () => {
    if (!user || !isLoaded) return;

    openCheckout({
      product: 'PRODUCT_ID_50_PACK_SUBSCRIPTION',
      email: user.email,
      successCallback: (data) => {
        console.log('Subscription purchase successful', data);
        // Call your backend to record the subscription
        fetch('/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            checkout_id: data.checkout.id,
            user_id: user.id,
            product_id: 'PRODUCT_ID_50_PACK_SUBSCRIPTION',
          }),
        }).then(() => {
          // Refresh the page to update UI
          window.location.reload();
        });
      },
    });
  };

  // Function to handle cancelling a subscription
  const handleCancelSubscription = async () => {
    if (!user || !user.paddle_subscription_id) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/payment/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          subscription_id: user.paddle_subscription_id,
        }),
      });
      
      if (response.ok) {
        // Refresh the page to update UI
        window.location.reload();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('common.subscription')}</h2>
        
        {/* Current Plan Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">{t('common.subscriptionPage.currentPlan')}</h3>
          
          {subscriptionInfo?.tier === 'pro' ? (
            <div>
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">
                  <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="ml-2 text-green-700 font-medium">{t('common.subscriptionPage.proSubscription')}</span>
              </div>
              <p className="text-sm text-gray-600">
                {t('common.subscriptionPage.proRenew')} {subscriptionInfo.endDate ? new Date(subscriptionInfo.endDate).toLocaleDateString() : 'N/A'}.
              </p>
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                {loading ? t('common.subscriptionPage.processing') : t('common.subscriptionPage.cancel')}
              </button>
            </div>
          ) : subscriptionInfo?.tier === 'credits' ? (
            <div>
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100">
                  <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="ml-2 text-blue-700 font-medium">{t('common.subscriptionPage.payPerUse')}</span>
              </div>
              <p className="text-sm text-gray-600">
                {t('common.subscriptionPage.youHave')} {subscriptionInfo.analysesRemaining} {subscriptionInfo.analysesRemaining !== 1 
                  ? t('common.subscriptionPage.analysesRemaining') 
                  : t('common.subscriptionPage.analysisRemaining')}.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
                  <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="ml-2 text-gray-700 font-medium">{t('common.subscriptionPage.freePlan')}</span>
              </div>
              <p className="text-sm text-gray-600">
                {t('common.subscriptionPage.youHave')} {subscriptionInfo?.analysesRemaining || 0} {(subscriptionInfo?.analysesRemaining || 0) !== 1 
                  ? t('common.subscriptionPage.analysesRemaining') 
                  : t('common.subscriptionPage.analysisRemaining')}.
              </p>
            </div>
          )}
        </div>
        
        {/* Subscription Options */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-800 mb-2">{t('common.subscriptionPage.availablePlans')}</h3>
          
          {/* Pro Subscription */}
          {subscriptionInfo?.tier !== 'pro' && (
            <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{t('common.subscriptionPage.proSubscription')}</h4>
                  <p className="text-sm text-gray-600">{t('common.subscriptionPage.proDescription')}</p>
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={!isLoaded}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoaded ? t('common.subscriptionPage.subscribe') : t('common.subscriptionPage.loading')}
                </button>
              </div>
            </div>
          )}
          
          {/* Analysis Packs */}
          <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div>
              <h4 className="font-medium">{t('common.subscriptionPage.analysisPacks')}</h4>
              <p className="text-sm text-gray-600 mb-3">{t('common.subscriptionPage.analysisPurchase')}</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handlePurchaseAnalyses('5')}
                  disabled={!isLoaded}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {t('common.subscriptionPage.buy5Analyses')}
                </button>
                <button
                  onClick={() => handlePurchaseAnalyses('15')}
                  disabled={!isLoaded}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {t('common.subscriptionPage.buy15Analyses')}
                </button>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{t('common.subscriptionPage.bulkSubscription')}</h4>
                <p className="text-sm text-gray-600">{t('common.subscriptionPage.subscriptionDescription')}</p>
              </div>
              <button
                onClick={handlePurchaseSubscription}
                disabled={!isLoaded}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isLoaded ? t('common.subscriptionPage.subscribe50Pack') : t('common.subscriptionPage.loading')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 