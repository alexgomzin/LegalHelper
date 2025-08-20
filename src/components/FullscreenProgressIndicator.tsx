import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

interface FullscreenProgressIndicatorProps {
  isVisible: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
  isAnalyzing?: boolean;
  duration?: number; // Duration in milliseconds for analysis
  onComplete?: () => void;
}

export default function FullscreenProgressIndicator({ 
  isVisible,
  isUploading = false,
  uploadProgress = 0,
  isAnalyzing = false,
  duration = 45000, // 45 seconds default for analysis
  onComplete
}: FullscreenProgressIndicatorProps) {
  const { t } = useTranslation();
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  // Progress messages for analysis in order
  const analysisMessages = [
    t('analyze.progressMessages.initializing'),
    t('analyze.progressMessages.extractingText'),
    t('analyze.progressMessages.processingContent'),
    t('analyze.progressMessages.analyzingRisks'),
    t('analyze.progressMessages.identifyingClauses'),
    t('analyze.progressMessages.generatingRecommendations'),
    t('analyze.progressMessages.finalizing'),
    t('analyze.progressMessages.almostComplete')
  ];

  // Progress thresholds for each message (percentages)
  const progressThresholds = [5, 15, 25, 40, 60, 75, 90, 95];

  // Analysis progress effect
  useEffect(() => {
    if (!isAnalyzing) {
      setAnalysisProgress(0);
      setCurrentMessageIndex(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / duration) * 100, 95); // Cap at 95% until complete
      
      setAnalysisProgress(progressPercent);

      // Update message based on progress
      const newMessageIndex = progressThresholds.findIndex(threshold => progressPercent < threshold);
      const messageIndex = newMessageIndex === -1 ? progressThresholds.length - 1 : Math.max(0, newMessageIndex - 1);
      setCurrentMessageIndex(messageIndex);
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [isAnalyzing, duration]);

  // Complete the analysis progress when analysis is done
  useEffect(() => {
    if (!isAnalyzing && analysisProgress > 0 && analysisProgress < 100 && !isCompleting) {
      setIsCompleting(true);
      
      // Smoothly complete the progress to 100%
      const completeProgress = () => {
        setAnalysisProgress(100);
        setCurrentMessageIndex(analysisMessages.length - 1);
        
        // Hide the component after completion
        setTimeout(() => {
          setIsCompleting(false);
          onComplete?.();
        }, 2000); // Hide after 2 seconds
      };
      
      // Add a small delay to make the completion visible
      setTimeout(completeProgress, 200);
    }
  }, [isAnalyzing, analysisProgress, analysisMessages.length, isCompleting, onComplete]);

  // Don't show anything if not visible
  if (!isVisible) {
    return null;
  }

  // Determine current phase and progress
  const currentProgress = isUploading ? uploadProgress : analysisProgress;
  const currentPhase = isUploading ? 'upload' : 'analysis';
  const isComplete = !isUploading && !isAnalyzing && analysisProgress === 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          {isComplete ? (
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                {currentPhase === 'upload' ? (
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isComplete ? 'Analysis Complete!' : 
             currentPhase === 'upload' ? t('analyze.uploadingDocument') : 
             t('analyze.analyzingDocument')}
          </h2>
          
          {!isComplete && (
            <p className="text-gray-600">
              {currentPhase === 'upload' ? 
                t('analyze.uploadingMessage') : 
                'Please wait while we analyze your document...'}
            </p>
          )}
        </div>

        {/* Progress Section */}
        {!isComplete && (
          <div className="mb-8">
            {/* Main Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
              <div 
                className={`h-4 rounded-full transition-all duration-300 ease-out relative ${
                  currentPhase === 'upload' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ width: `${currentProgress}%` }}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>

            {/* Progress Percentage */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-800">
                {Math.round(currentProgress)}%
              </span>
              <span className="text-sm text-gray-500">
                {currentPhase === 'upload' ? 'Uploading...' : 'Analyzing...'}
              </span>
            </div>

            {/* Current Status Message */}
            {currentPhase === 'analysis' && (
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-700 font-medium">
                  {analysisMessages[currentMessageIndex]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analysis Steps Indicator (only during analysis) */}
        {currentPhase === 'analysis' && !isComplete && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {analysisMessages.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index <= currentMessageIndex
                      ? 'bg-green-500 scale-110'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-500">
                Step {currentMessageIndex + 1} of {analysisMessages.length}
              </span>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {isComplete && (
          <div className="text-center">
            <p className="text-green-600 font-medium mb-4">
              Your document has been successfully analyzed!
            </p>
            <div className="text-sm text-gray-500">
              Redirecting to results...
            </div>
          </div>
        )}

        {/* Warning Message */}
        {!isComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Please don't navigate away</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Leaving this page will cancel the {currentPhase === 'upload' ? 'upload' : 'analysis'} process.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
