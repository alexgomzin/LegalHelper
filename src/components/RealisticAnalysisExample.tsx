import React, { useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/router';
import { trackGetStartedClick } from '@/utils/gtag';

export default function RealisticAnalysisExample() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);

  const closeModal = () => setSelectedRisk(null);

  const handleTryNowClick = () => {
    // Трекинг клика для аналитики
    trackGetStartedClick();
    
    if (isAuthenticated) {
      // Пользователь авторизован - перенаправляем на страницу анализа
      router.push('/analyze');
    } else {
      // Пользователь не авторизован - перенаправляем на страницу входа
      router.push('/login');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-lg mx-auto border border-gray-200">
        {/* Compact header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-lg p-1.5 mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold">{t('analysisExample.documentType')}</h3>
                <p className="text-blue-100 text-xs">{t('analysisExample.aiReviewComplete')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="bg-red-500 bg-opacity-30 text-red-100 px-2 py-0.5 rounded-full text-xs font-medium">
                2 {t('analysisExample.highRisk')}
              </div>
              <div className="bg-yellow-500 bg-opacity-30 text-yellow-100 px-2 py-0.5 rounded-full text-xs font-medium">
                1 {t('analysisExample.caution')}
              </div>
              <div className="bg-green-500 bg-opacity-30 text-green-100 px-2 py-0.5 rounded-full text-xs font-medium">
                1 {t('analysisExample.lowRisk')}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Legal document preview */}
          <div className="mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 leading-relaxed border border-gray-200">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="font-semibold text-gray-800">{t('analysisExample.title')}</span>
              </div>
              <div className="space-y-2 text-2xs">
                <p>
                  {t('analysisExample.clause1').split(t('analysisExample.prepaymentNoGuarantees'))[0]}
                  <span 
                    className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-medium mx-1 cursor-pointer hover:bg-red-200 transition-colors"
                    onClick={() => setSelectedRisk('highRisk')}
                  >
                    {t('analysisExample.prepaymentNoGuarantees')}
                  </span>
                  {t('analysisExample.clause1').split(t('analysisExample.prepaymentNoGuarantees'))[1]}
                </p>
                <p>
                  {t('analysisExample.clause2').split(t('analysisExample.noLiabilityForProperty'))[0]}
                  <span 
                    className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-medium mx-1 cursor-pointer hover:bg-red-200 transition-colors"
                    onClick={() => setSelectedRisk('critical')}
                  >
                    {t('analysisExample.noLiabilityForProperty')}
                  </span>
                  {t('analysisExample.clause2').split(t('analysisExample.noLiabilityForProperty'))[1]}
                </p>
                <p>
                  {t('analysisExample.clause3').split(t('analysisExample.shortNotice'))[0]}
                  <span 
                    className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium mx-1 cursor-pointer hover:bg-yellow-200 transition-colors"
                    onClick={() => setSelectedRisk('caution')}
                  >
                    {t('analysisExample.shortNotice')}
                  </span>
                  {t('analysisExample.clause3').split(t('analysisExample.shortNotice'))[1]}
                </p>
                <p>
                  {t('analysisExample.clause4').split(t('analysisExample.includesUtilities'))[0]}
                  <span 
                    className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-medium mx-1 cursor-pointer hover:bg-green-200 transition-colors"
                    onClick={() => setSelectedRisk('lowRisk')}
                  >
                    {t('analysisExample.includesUtilities')}
                  </span>
                  {t('analysisExample.clause4').split(t('analysisExample.includesUtilities'))[1]}
                </p>
              </div>
            </div>
          </div>

          {/* Professional legal analysis */}
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-semibold text-gray-800">{t('analysisExample.riskAnalysis')}:</h4>
            
            <div 
              className="bg-red-50 border-l-3 border-red-400 p-2 rounded-r cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => setSelectedRisk('highRisk')}
            >
              <div className="flex items-center mb-1">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-red-800 font-medium text-xs uppercase">{t('analysisExample.highRisk')}</span>
              </div>
              <p className="text-red-800 text-xs leading-relaxed">
                {t('analysisExample.highRiskDesc')}
              </p>
            </div>

            <div 
              className="bg-red-50 border-l-3 border-red-400 p-2 rounded-r cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => setSelectedRisk('critical')}
            >
              <div className="flex items-center mb-1">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-red-800 font-medium text-xs uppercase">{t('analysisExample.critical')}</span>
              </div>
              <p className="text-red-800 text-xs leading-relaxed">
                {t('analysisExample.criticalDesc')}
              </p>
            </div>

            <div 
              className="bg-yellow-50 border-l-3 border-yellow-400 p-2 rounded-r cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => setSelectedRisk('caution')}
            >
              <div className="flex items-center mb-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-yellow-800 font-medium text-xs uppercase">{t('analysisExample.caution')}</span>
              </div>
              <p className="text-yellow-800 text-xs leading-relaxed">
                {t('analysisExample.cautionDesc')}
              </p>
            </div>

            <div 
              className="bg-green-50 border-l-3 border-green-400 p-2 rounded-r cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => setSelectedRisk('lowRisk')}
            >
              <div className="flex items-center mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-800 font-medium text-xs uppercase">{t('analysisExample.lowRisk')}</span>
              </div>
              <p className="text-green-800 text-xs leading-relaxed">
                {t('analysisExample.lowRiskDesc')}
              </p>
            </div>
          </div>

          {/* Legal summary */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-800 font-medium text-xs">{t('analysisExample.recommendations')}</span>
            </div>
            <p className="text-blue-700 text-xs leading-relaxed">
              <strong>{t('analysisExample.summaryTitle')}</strong> - {t('analysisExample.summaryDesc')}
            </p>
          </div>

          {/* Professional footer */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center text-gray-500">
              <svg className="w-3 h-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs">{t('analysisExample.analyzedIn')}</span>
            </div>
            <button 
              onClick={handleTryNowClick}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              {isAuthenticated ? t('analysisExample.startAnalysis') : t('analysisExample.signInToAnalyze')}
            </button>
          </div>
        </div>
      </div>

      {/* Risk Detail Modal */}
      {selectedRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t(`analysisExample.${selectedRisk}Title`)}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">{t('common.explanation')}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(`analysisExample.${selectedRisk}Explanation`)}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">{t('common.recommendation')}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(`analysisExample.${selectedRisk}Recommendation`)}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                {t('analysisExample.closeDetails')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
