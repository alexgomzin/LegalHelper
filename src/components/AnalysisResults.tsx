'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/contexts/LanguageContext'

interface HighlightedText {
  id: number;
  text: string;
  riskLevel: 'high' | 'medium' | 'low';
  explanation: string;
  recommendation: string;
}

interface AnalysisResultsProps {
  results: {
    highlightedText?: HighlightedText[];
    summary?: string;
    fullText?: string;
    documentLanguage?: string;
  };
}

export default function AnalysisResults({ results }: AnalysisResultsProps) {
  const { navigateTo } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [activeRisk, setActiveRisk] = useState<number | null>(null)
  const [validatedResults, setValidatedResults] = useState<{
    highlightedText: HighlightedText[];
    summary: string;
    fullText?: string;
    documentLanguage?: string;
  }>({ highlightedText: [], summary: '' })
  
  const documentRef = useRef<HTMLDivElement>(null)
  
  // Utility function to normalize text for better matching
  const normalizeTextForMatching = (text: string): string => {
    return text
      .normalize("NFD") // Normalize Unicode
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };
  
  // Utility function to clean text for matching (remove common punctuation)
  const cleanTextForMatching = (text: string): string => {
    return text
      .replace(/[.,;:!?\-"""''„"‚'`´]+/g, '') // Remove common punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };
  
  // Get language display name
  const getLanguageDisplay = (langCode: string): string => {
    switch(langCode) {
      case 'ru': return 'Русский';
      case 'de': return 'Deutsch';
      case 'en': return 'English';
      case 'fr': return 'Français';
      case 'es': return 'Español';
      default: return langCode;
    }
  }
  
  // Process and validate the results data
  useEffect(() => {
    // Default values in case of missing properties
    const defaultSummary = t('analysis.noSummary') || 'The document was analyzed but no specific summary was provided.'
    
    // Create a validated version of the results to avoid errors in rendering
    let validatedHighlightedText: HighlightedText[] = []
    
    if (results.highlightedText && Array.isArray(results.highlightedText)) {
      validatedHighlightedText = results.highlightedText.map((item, index) => ({
        id: item.id || index + 1,
        text: item.text || t('analysis.unspecifiedText') || 'Unspecified text',
        riskLevel: (item.riskLevel as 'high' | 'medium' | 'low') || 'medium',
        explanation: item.explanation || t('analysis.noExplanation') || 'No explanation provided',
        recommendation: item.recommendation || t('analysis.noRecommendation') || 'No specific recommendation provided'
      }))
    }
    
    const validatedResultsData = {
      highlightedText: validatedHighlightedText,
      summary: results.summary || defaultSummary,
      fullText: results.fullText,
      documentLanguage: results.documentLanguage || 'en'
    };
    
    setValidatedResults(validatedResultsData)
    
    // Set the first risk as active by default if there are risks
    if (validatedHighlightedText.length > 0 && activeRisk === null) {
      setActiveRisk(validatedHighlightedText[0].id)
    }
    
    // Save this analysis to localStorage for future access
    saveAnalysisToStorage(validatedResultsData);
    
  }, [results, activeRisk, t])
  
  // Save analysis to localStorage
  const saveAnalysisToStorage = (analysisData: any) => {
    try {
      // Get existing documents or initialize empty array
      const existingDocsStr = localStorage.getItem('analyzedDocuments');
      const existingDocs = existingDocsStr ? JSON.parse(existingDocsStr) : [];
      
      // Create a new document entry
      const documentName = localStorage.getItem('lastUploadedFileName') || 'Document.pdf';
      const documentId = `doc-${Date.now()}`;
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Check if document already exists
      const existingIndex = existingDocs.findIndex((doc: any) => doc.name === documentName);
      
      if (existingIndex !== -1) {
        // Update existing entry
        existingDocs[existingIndex].date = today;
        existingDocs[existingIndex].status = 'Analyzed';
      } else {
        // Add new entry
        existingDocs.unshift({
          id: documentId,
          name: documentName,
          date: today,
          status: 'Analyzed'
        });
      }
      
      // Save updated document list
      localStorage.setItem('analyzedDocuments', JSON.stringify(existingDocs));
      
      // Save the full analysis results
      localStorage.setItem(`analysis-${documentId}`, JSON.stringify(analysisData));
      localStorage.setItem('currentAnalysisId', documentId);
    } catch (error) {
      console.error('Error saving analysis to storage:', error);
    }
  };
  
  // Filter highlights based on the active tab
  const filteredHighlights = validatedResults.highlightedText.filter(item => {
    if (activeTab === 'all') return true
    return item.riskLevel === activeTab
  })
  
  // Handle navigation to a specific risk in the document
  const navigateToRisk = (riskId: number) => {
    setActiveRisk(riskId)
    
    // Re-render the document contents with the new active risk
    if (documentRef.current && validatedResults.fullText) {
      // Update content with new active risk
      documentRef.current.innerHTML = highlightRiskyText(
        validatedResults.fullText, 
        validatedResults.highlightedText
      );
      
      // Re-attach event listeners
      attachRiskClickHandlers();
      
      // Find and scroll to the active risk element
      const activeElement = document.getElementById(`risk-${riskId}`);
      if (activeElement && documentRef.current) {
        // Scroll the active risk into view
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Also scroll the risk details into view on mobile
        if (window.innerWidth < 1024) {
          const riskPanel = document.getElementById('risk-panel');
          if (riskPanel) {
            setTimeout(() => {
              riskPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        }
      }
    }
  }
  
  // Attach click handlers to risk elements
  const attachRiskClickHandlers = () => {
    if (documentRef.current) {
      const riskElements = documentRef.current.querySelectorAll('[data-risk-id]');
      riskElements.forEach(element => {
        const riskId = parseInt(element.getAttribute('data-risk-id') || '0', 10);
        if (riskId > 0) {
          element.addEventListener('click', () => navigateToRisk(riskId));
        }
      });
    }
  }
  
  // Apply click handlers after rendering
  useEffect(() => {
    if (documentRef.current && validatedResults.fullText) {
      // First, remove any existing event listeners to prevent duplicates
      const existingRiskElements = documentRef.current.querySelectorAll('[data-risk-id]');
      existingRiskElements.forEach(element => {
        const riskId = parseInt(element.getAttribute('data-risk-id') || '0', 10);
        if (riskId > 0) {
          element.removeEventListener('click', () => navigateToRisk(riskId));
        }
      });
      
      // Re-render the document with highlights
      documentRef.current.innerHTML = highlightRiskyText(
        validatedResults.fullText,
        validatedResults.highlightedText
      );
      
      // Then attach click handlers to all highlighted elements
      attachRiskClickHandlers();
    }
  }, [validatedResults.fullText, activeRisk]);
  
  // Handle downloading as PDF
  const handleDownloadPDF = () => {
    alert(t('common.downloadPdfAlert') || 'PDF download functionality will be implemented soon')
  }
  
  // Handle downloading as JSON
  const handleDownloadJSON = () => {
    try {
      // Create a JSON string from the results
      const jsonString = JSON.stringify(results, null, 2)
      
      // Create a blob and download link
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a')
      a.href = url
      a.download = 'document-analysis.json'
      a.click()
      
      // Clean up
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading JSON:', error)
      alert(t('common.downloadJsonError') || 'Failed to download results. Please try again.')
    }
  }
  
  // Highlight risky text in the document
  const highlightRiskyText = (text: string, highlights: HighlightedText[]) => {
    if (!text || !highlights || highlights.length === 0) {
      console.log('No text or highlights provided for highlighting');
      return text;
    }
    
    console.log(`Starting text highlighting with ${highlights.length} highlights`);
    console.log('Document text length:', text.length);
    console.log('Highlights:', highlights.map(h => ({ id: h.id, text: h.text.substring(0, 50) + '...' })));
    
    // Create a safe version of the text for searching
    const textToUse = normalizeTextForMatching(text);
    
    // Create an array to hold text segments with their highlighting status
    interface TextSegment {
      text: string;
      riskId: number | null;
      riskLevel: 'high' | 'medium' | 'low' | null;
    }
    
    // Initialize with the entire text as a single non-highlighted segment
    let segments: TextSegment[] = [{ 
      text: text, // Use original text, not normalized
      riskId: null, 
      riskLevel: null 
    }];
    
    // Sort highlights by length (longest first) to handle overlapping matches better
    const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length);
    
    // Process each highlight
    for (const highlight of sortedHighlights) {
      // Skip empty highlights
      if (!highlight.text || highlight.text.trim().length < 3) {
        console.log(`Skipping highlight ${highlight.id}: too short or empty`);
        continue;
      }
      
      console.log(`Processing highlight ${highlight.id}: "${highlight.text}"`);
      
      // Normalize and clean the highlight text
      let highlightText = highlight.text.trim();
      
      // Create a new set of segments for each iteration
      const newSegments: TextSegment[] = [];
      let foundAnyMatch = false;
      
      // Process each existing segment
      for (const segment of segments) {
        // Skip already highlighted segments
        if (segment.riskId !== null) {
          newSegments.push(segment);
          continue;
        }
        
        const segmentText = segment.text;
        
        // Try multiple matching strategies with increasing flexibility
        const matchingStrategies = [
          // Strategy 1: Exact match (case insensitive)
          {
            name: 'exact',
            segmentText: segmentText.toLowerCase(),
            highlightText: highlightText.toLowerCase(),
            originalLength: highlightText.length
          },
          // Strategy 2: Normalized match (removes diacritics, normalizes spaces)
          {
            name: 'normalized', 
            segmentText: normalizeTextForMatching(segmentText).toLowerCase(),
            highlightText: normalizeTextForMatching(highlightText).toLowerCase(),
            originalLength: highlightText.length
          },
          // Strategy 3: Clean match (removes punctuation)
          {
            name: 'clean',
            segmentText: cleanTextForMatching(segmentText).toLowerCase(),
            highlightText: cleanTextForMatching(highlightText).toLowerCase(),
            originalLength: highlightText.length
          },
          // Strategy 4: Fuzzy match (first 20 chars if original is longer)
          {
            name: 'fuzzy',
            segmentText: segmentText.toLowerCase(),
            highlightText: highlightText.substring(0, Math.min(20, highlightText.length)).toLowerCase(),
            originalLength: Math.min(20, highlightText.length)
          }
        ];
        
        let foundMatch = false;
        let matchInfo = null;
        
        // Try each matching strategy
        for (const strategy of matchingStrategies) {
          const matchIndex = strategy.segmentText.indexOf(strategy.highlightText);
          if (matchIndex !== -1) {
            console.log(`Found match for highlight ${highlight.id} using ${strategy.name} strategy at index ${matchIndex}`);
            
            // For modified text strategies, find the actual position in original text
            let actualStart = matchIndex;
            let actualLength = strategy.originalLength;
            
            if (strategy.name !== 'exact') {
              // Find the actual position by searching around the approximate location
              const searchStart = Math.max(0, matchIndex - 10);
              const searchEnd = Math.min(segmentText.length, matchIndex + strategy.highlightText.length + 10);
              const searchRegion = segmentText.substring(searchStart, searchEnd);
              
              // Try to find the best match in the region
              for (let i = 0; i <= searchRegion.length - strategy.originalLength; i++) {
                const candidate = searchRegion.substring(i, i + strategy.originalLength);
                const processedCandidate = strategy.name === 'normalized' 
                  ? normalizeTextForMatching(candidate).toLowerCase()
                  : cleanTextForMatching(candidate).toLowerCase();
                
                if (processedCandidate === strategy.highlightText) {
                  actualStart = searchStart + i;
                  actualLength = candidate.length;
                  break;
                }
              }
            }
            
            matchInfo = {
              start: actualStart,
              length: actualLength,
              strategy: strategy.name
            };
            foundMatch = true;
            foundAnyMatch = true;
            break;
          }
        }
        
        if (!foundMatch) {
          newSegments.push(segment);
          continue;
        }
        
        // Process the match
        const { start, length } = matchInfo!;
        let lastIndex = 0;
        
        // Add text before the highlight if any
        if (start > lastIndex) {
          newSegments.push({
            text: segmentText.substring(lastIndex, start),
            riskId: null,
            riskLevel: null
          });
        }
        
        // Add the highlighted segment
        const actualHighlightedText = segmentText.substring(start, start + length);
        newSegments.push({
          text: actualHighlightedText,
          riskId: highlight.id,
          riskLevel: highlight.riskLevel
        });
        
        console.log(`Highlighted text for ${highlight.id}: "${actualHighlightedText}"`);
        
        // Add any remaining text after the highlight
        lastIndex = start + length;
        if (lastIndex < segmentText.length) {
          newSegments.push({
            text: segmentText.substring(lastIndex),
            riskId: null,
            riskLevel: null
          });
        }
      }
      
      if (!foundAnyMatch) {
        console.warn(`No match found for highlight ${highlight.id}: "${highlight.text}"`);
      }
      
      // Replace segments with the new set for next iteration
      segments = newSegments;
    }
    
    console.log(`Text highlighting completed. Generated ${segments.length} segments.`);
    console.log('Highlighted segments:', segments.filter(s => s.riskId !== null).map(s => ({ id: s.riskId, text: s.text.substring(0, 30) + '...' })));
    
    // Convert segments back to HTML
    let result = '';
    for (const segment of segments) {
      if (segment.riskId === null) {
        // Regular text, no highlighting - escape HTML characters
        const escapedText = segment.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        result += escapedText;
      } else {
        // Highlighted risk
        const riskClass = `risk-${segment.riskLevel}`;
        const isActive = activeRisk === segment.riskId;
        const activeClass = isActive ? 'border-2 font-medium' : '';
        
        // Escape the text content
        const escapedText = segment.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        
        result += `<span 
          id="risk-${segment.riskId}" 
          class="${riskClass} ${activeClass}" 
          data-risk-id="${segment.riskId}" 
          data-risk-level="${segment.riskLevel}"
          style="cursor: pointer;"
          onclick="document.dispatchEvent(new CustomEvent('riskClicked', {detail: ${segment.riskId}}))"
        >${escapedText}</span>`;
      }
    }
    
    return result;
  }
  
  // Add event listener for risk clicks from the document text
  useEffect(() => {
    // This function will be called when a risk is clicked in the document
    const handleRiskClicked = (event: CustomEvent) => {
      const riskId = event.detail;
      navigateToRisk(riskId);
    };
    
    // Add the event listener
    document.addEventListener('riskClicked', handleRiskClicked as EventListener);
    
    // Cleanup
    return () => {
      document.removeEventListener('riskClicked', handleRiskClicked as EventListener);
    };
  }, []);
  
  return (
    <div className="mb-12">
      {/* Replace Link with a simpler anchor tag approach */}
      <div className="flex justify-end mb-6">
        <Link 
          href="/analyze"
          onClick={(e) => {
            e.preventDefault();
            // Clear all session storage completely
            sessionStorage.clear();
            // Use direct window location change for reliability
            window.location.href = '/analyze';
          }}
          className="btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('common.analyzeNewDocument')}
        </Link>
      </div>
      
      {/* Summary Section with enhanced styling */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg shadow-md mb-8 border-l-4 border-blue-500">
        <h2 className="text-2xl font-bold mb-6 text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('analysis.summary')}
          {validatedResults.documentLanguage && validatedResults.documentLanguage !== 'en' && (
            <span className="ml-3 text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-normal">
              {getLanguageDisplay(validatedResults.documentLanguage)}
            </span>
          )}
        </h2>
        <div className="bg-white p-6 rounded-md shadow-sm mb-4">
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{validatedResults.summary}</p>
        </div>
        
        <div className="flex justify-between items-center mt-8">
          <div className="flex gap-3">
            <button onClick={handleDownloadPDF} className="btn-primary flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t('common.downloadPdf')}
            </button>
            <button onClick={handleDownloadJSON} className="btn-secondary flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              {t('common.downloadJson')}
            </button>
          </div>
          
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
            {validatedResults.highlightedText.length} {t('analysis.issuesFound') || 'issues found'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document with highlighted risks - enhanced styling */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md h-full border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center border-b pb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('analysis.documentText') || 'Document Text'}
            </h2>
            {validatedResults.fullText ? (
              <div 
                ref={documentRef}
                className="document-container bg-gray-50 p-6 rounded-md border border-gray-200"
                style={{ 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: '1.6'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: highlightRiskyText(validatedResults.fullText, validatedResults.highlightedText) 
                }}
              />
            ) : (
              <div className="p-6 bg-gray-100 rounded text-gray-600 italic border border-gray-200">
                <div className="flex items-center mb-3 text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('analysis.fullTextNotAvailable') || 'Full document text not available. Only highlighted sections are shown below.'}
                </div>
                
                <div className="mt-6 space-y-4">
                  {validatedResults.highlightedText.map(item => (
                    <div 
                      key={item.id}
                      className={`risk-highlight risk-${item.riskLevel} ${activeRisk === item.id ? 'active-risk' : ''}`}
                      onClick={() => navigateToRisk(item.id)}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Risk analysis panel - enhanced styling */}
        <div>
          <div id="risk-panel" className="bg-white p-6 rounded-lg shadow-md h-full border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center border-b pb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {t('analysis.risks')}
            </h2>
            
            {activeRisk !== null && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border-l-4 border-blue-500">
                {(() => {
                  // Find the active risk item
                  const activeRiskItem = validatedResults.highlightedText.find(item => item.id === activeRisk);
                  if (!activeRiskItem) return null;
                  
                  return (
                    <div>
                      <h3 className="font-bold text-lg mb-3 text-blue-800">{t('analysis.activeRisk') || 'Active Risk'}</h3>
                      <div className="mb-3">
                        <div className="risk-box risk-identifier">
                          <h4 className="font-bold text-md mb-1 text-red-700">{t('analysis.riskIdentified') || 'Risk identified'}:</h4>
                          <p className="text-gray-700">{activeRiskItem.explanation}</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="risk-box recommendation-box bg-gray-50 p-3 rounded-md">
                          <h4 className="font-bold text-md mb-1 text-green-700">{t('common.recommendation')}:</h4>
                          <p className="text-gray-700">{activeRiskItem.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            
            <div className="flex border-b mb-6 overflow-x-auto bg-gray-50 rounded-t-lg">
              <button 
                className={`tab-button ${activeTab === 'all' ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setActiveTab('all')}
              >
                {t('common.allRisks')} ({validatedResults.highlightedText.length})
              </button>
              <button 
                className={`tab-button ${activeTab === 'high' ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setActiveTab('high')}
              >
                {t('common.highRisks')} ({validatedResults.highlightedText.filter(i => i.riskLevel === 'high').length})
              </button>
              <button 
                className={`tab-button ${activeTab === 'medium' ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setActiveTab('medium')}
              >
                {t('common.mediumRisks')} ({validatedResults.highlightedText.filter(i => i.riskLevel === 'medium').length})
              </button>
              <button 
                className={`tab-button ${activeTab === 'low' ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setActiveTab('low')}
              >
                {t('common.lowRisks')} ({validatedResults.highlightedText.filter(i => i.riskLevel === 'low').length})
              </button>
            </div>
            
            {filteredHighlights.length > 0 ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {filteredHighlights.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-md border cursor-pointer transition-all hover:shadow-md ${
                      activeRisk === item.id 
                        ? `bg-${item.riskLevel === 'high' ? 'red' : item.riskLevel === 'medium' ? 'yellow' : 'green'}-50 border-${item.riskLevel === 'high' ? 'red' : item.riskLevel === 'medium' ? 'yellow' : 'green'}-500` 
                        : `border-${item.riskLevel === 'high' ? 'red' : item.riskLevel === 'medium' ? 'yellow' : 'green'}-300 hover:border-${item.riskLevel === 'high' ? 'red' : item.riskLevel === 'medium' ? 'yellow' : 'green'}-500 hover:bg-gray-50`
                    }`}
                    onClick={() => navigateToRisk(item.id)}
                  >
                    <div className="flex items-center mb-2">
                      <span className={`inline-block w-3 h-3 rounded-full bg-${item.riskLevel === 'high' ? 'red' : item.riskLevel === 'medium' ? 'yellow' : 'green'}-500 mr-2`}></span>
                      <span className="text-sm font-medium text-gray-900">{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-md text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('analysis.noRisksWithFilter') || 'No risks found with the selected filter.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 