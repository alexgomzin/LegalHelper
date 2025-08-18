'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import Link from 'next/link';

interface CreditStatusProps {
  className?: string;
  compact?: boolean;
  onNoCredits?: () => void;
}

/**
 * Clear credit status cache to force refresh
 * Call this after credit usage to update the display
 */
export function clearCreditStatusCache(userId: string) {
  if (typeof window !== 'undefined') {
    console.log('🔄 Clearing credit status cache for user:', userId);
    
    const cacheKey = `creditStatus_${userId}`;
    localStorage.removeItem(cacheKey);
    
    const creditCheckKey = `creditCheck_${userId}`;
    localStorage.removeItem(creditCheckKey);
    
    console.log('📡 Dispatching creditStatusUpdate event');
    // Dispatch custom event to trigger component refresh
    window.dispatchEvent(new CustomEvent('creditStatusUpdate', { detail: { userId } }));
  }
}

export default function AnalysisStatus({ className = '', compact = false, onNoCredits }: CreditStatusProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [status, setStatus] = useState<{
    tier: string;
    analysesRemaining?: number;
    isSubscribed: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0); // Counter to force refresh

  // Listen for credit status updates
  useEffect(() => {
    const handleCreditUpdate = (event: CustomEvent) => {
      console.log('🎯 Received creditStatusUpdate event:', event.detail);
      if (user && event.detail.userId === user.id) {
        console.log('✅ Event matches current user, forcing refresh');
        setForceRefresh(prev => prev + 1); // Trigger refresh
      } else {
        console.log('❌ Event does not match current user:', { eventUserId: event.detail.userId, currentUserId: user?.id });
      }
    };

    window.addEventListener('creditStatusUpdate', handleCreditUpdate as EventListener);
    return () => window.removeEventListener('creditStatusUpdate', handleCreditUpdate as EventListener);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Debounce API calls to prevent multiple simultaneous requests
    const timeoutId = setTimeout(() => {
      const fetchStatus = async () => {
        try {
          console.log('💳 Fetching credit status for user:', user.id, 'forceRefresh:', forceRefresh);
          
          // Check if we already have recent data in localStorage to avoid API spam
          const cacheKey = `creditStatus_${user.id}`;
          const cachedData = localStorage.getItem(cacheKey);
          const cacheExpiry = 5000; // Reduced to 5 seconds for faster updates
          
          // Skip cache if forceRefresh was triggered
          if (cachedData && forceRefresh === 0) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < cacheExpiry) {
              console.log('📋 Using cached credit data');
              setStatus(data);
              setLoading(false);
              return;
            }
          }
          
          console.log('🌐 Making API call to check credits (cache skipped or expired)');
          const response = await fetch(`/api/payment/check-credits?user_id=${user.id}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('📊 Credit status response:', data);
            const statusData = {
              tier: data.subscription_tier,
              analysesRemaining: data.credits_remaining,
              isSubscribed: data.subscription_tier === 'subscription'
            };
            
            setStatus(statusData);
            
            // Cache the result
            localStorage.setItem(cacheKey, JSON.stringify({
              data: statusData,
              timestamp: Date.now()
            }));
            
            console.log('✅ Credit status updated:', statusData);
            
            // Remove automatic onNoCredits trigger - only show modal when user tries to upload
          } else {
            console.error('❌ Failed to fetch credit status, defaulting to free tier');
            // Default to free tier if API fails
            setStatus({
              tier: 'free',
              analysesRemaining: 0,
              isSubscribed: false
            });
          }
        } catch (error) {
          console.error('❌ Error fetching analysis status:', error);
          // Default to free tier if API fails
          setStatus({
            tier: 'free',
            analysesRemaining: 0,
            isSubscribed: false
          });
        } finally {
          setLoading(false);
        }
      };

      fetchStatus();
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [user, onNoCredits, forceRefresh]); // Added forceRefresh dependency

  if (!user || loading) {
    return null;
  }

  // Admin display logic
  if (status?.tier === 'admin') {
    return (
      <div className={className}>
        <div className="flex items-center space-x-2 mb-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100">
            <svg className="h-3 w-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="text-yellow-700 text-sm font-medium">{t('analyze.adminUnlimitedAnalyses')}</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">{t('analyze.adminUnlimitedDescription')}</p>
        <Link
          href="/admin"
          className="text-xs font-medium text-yellow-600 hover:text-yellow-800"
        >
          {t('analyze.adminDashboard')}
        </Link>
      </div>
    );
  }

  // Compact version for navbar or small areas
  if (compact) {
    return (
      <div className={`text-sm ${className}`}>
        {status?.tier === 'admin' ? (
          <span className="text-purple-600 font-medium">{t('analyze.adminUnlimited')}</span>
        ) : status?.isSubscribed ? (
          <span className="text-green-600 font-medium">{t('analyze.monthlySubscription')}</span>
        ) : (
          <span className="text-gray-600">
            {status?.analysesRemaining || 0} {(status?.analysesRemaining || 0) === 1 ? t('analyze.analysisLeft') : t('analyze.analysesLeft')}
          </span>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      <h3 className="font-medium text-gray-800 mb-2">{t('analyze.yourAnalysisPlan')}</h3>
      
      {status?.tier === 'admin' ? (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-3 w-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.12 2.12a1 1 0 011.76 0l1.93 3.91 4.31.63a1 1 0 01.56 1.7l-3.12 3.05.74 4.3a1 1 0 01-1.45 1.05L10 15.51l-3.85 2.03a1 1 0 01-1.45-1.05l.74-4.3L2.32 9.14a1 1 0 01.56-1.7l4.31-.63L9.12 2.12z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-purple-700 text-sm font-medium">{t('analyze.adminAccountUnlimited')}</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">{t('analyze.unlimitedDocumentAnalyses')}</p>
        </div>
      ) : status?.isSubscribed ? (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
              <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-green-700 text-sm font-medium">{t('analyze.monthlySubscriptionActive')}</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">{status?.analysesRemaining || 0} {t('analyze.analysesRemainingThisMonth')}</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
              <span className="text-blue-600 text-xs font-medium">{status?.analysesRemaining || 0}</span>
            </span>
            <span className="text-gray-700 text-sm">
              {(status?.analysesRemaining || 0) === 1 ? t('analyze.analysisRemaining') : t('analyze.analysesRemaining')}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            {(status?.analysesRemaining || 0) === 0 ? t('analyze.purchaseMoreAnalyses') : ''}
          </p>
        </div>
      )}
      
      <Link
        href="/pricing"
        className="text-xs font-medium text-blue-600 hover:text-blue-800"
      >
        {status?.tier === 'admin' ? t('analyze.adminDashboard') : status?.isSubscribed ? t('analyze.manageSubscription') : t('analyze.purchaseAnalyses')}
      </Link>
    </div>
  );
} 