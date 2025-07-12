import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

interface AnalysisProgressIndicatorProps {
  isAnalyzing: boolean;
  duration?: number; // Duration in milliseconds
}

export default function AnalysisProgressIndicator({ 
  isAnalyzing, 
  duration = 45000 // 45 seconds default
}: AnalysisProgressIndicatorProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Progress messages in order
  const progressMessages = [
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

  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(0);
      setCurrentMessageIndex(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / duration) * 100, 95); // Cap at 95% until complete
      
      setProgress(progressPercent);

      // Update message based on progress
      const newMessageIndex = progressThresholds.findIndex(threshold => progressPercent < threshold);
      const messageIndex = newMessageIndex === -1 ? progressThresholds.length - 1 : Math.max(0, newMessageIndex - 1);
      setCurrentMessageIndex(messageIndex);
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [isAnalyzing, duration]);

  // Complete the progress when analysis is done
  useEffect(() => {
    if (!isAnalyzing && progress > 0 && progress < 100) {
      // Smoothly complete the progress to 100%
      const completeProgress = () => {
        setProgress(100);
        setCurrentMessageIndex(progressMessages.length - 1);
      };
      
      // Add a small delay to make the completion visible
      setTimeout(completeProgress, 200);
    }
  }, [isAnalyzing, progress, progressMessages.length]);

  if (!isAnalyzing && progress === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <h3 className="text-lg font-medium mb-2">{t('analyze.analyzingDocument')}</h3>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-200 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {Math.round(progress)}%
        </span>
        <span className="text-sm text-gray-500">
          {isAnalyzing ? 'Processing...' : 'Complete'}
        </span>
      </div>

      {/* Current Progress Message */}
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 transition-all duration-300">
          {progressMessages[currentMessageIndex]}
        </p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="mt-4 flex justify-between">
        {progressMessages.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index <= currentMessageIndex
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
} 