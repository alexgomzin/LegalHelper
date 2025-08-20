import React, { useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

interface RiskItem {
  id: number;
  text: string;
  riskLevel: 'high' | 'medium' | 'low';
  explanation: string;
  recommendation: string;
}

export default function RealisticAnalysisExample() {
  const { t } = useTranslation();
  const [activeRisk, setActiveRisk] = useState<number>(1);

  // Sample contract text with realistic legal content
  const contractText = `AGREEMENT FOR LEGAL SERVICES

This Agreement is entered into between Client and Law Firm for the provision of legal services.

1. SCOPE OF SERVICES
Law Firm agrees to provide legal consultation and representation services to Client as may be requested from time to time.

2. PAYMENT TERMS
Client agrees to pay all fees within 30 days of invoice date. Late payments may incur interest charges of 2% per month.

3. LIABILITY LIMITATION
IN NO EVENT SHALL LAW FIRM BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, REGARDLESS OF THE THEORY OF LIABILITY.

4. TERMINATION
Either party may terminate this agreement at any time without cause by providing written notice. Upon termination, Client remains responsible for all unpaid fees.

5. CONFIDENTIALITY
Both parties agree to maintain strict confidentiality regarding all matters discussed during the course of this engagement.`;

  // Sample risk items that match the contract text
  const riskItems: RiskItem[] = [
    {
      id: 1,
      text: "Late payments may incur interest charges of 2% per month",
      riskLevel: 'high',
      explanation: "The 2% monthly interest rate (24% annually) is extremely high and may be considered usurious in many jurisdictions. This could be legally unenforceable.",
      recommendation: "Negotiate for a lower interest rate (typically 1-1.5% per month maximum) or request removal of interest charges entirely."
    },
    {
      id: 2,
      text: "IN NO EVENT SHALL LAW FIRM BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES",
      riskLevel: 'high',
      explanation: "This broad liability limitation clause could prevent you from recovering damages even in cases of professional negligence or malpractice.",
      recommendation: "Request to limit this clause to exclude cases of gross negligence, willful misconduct, or professional malpractice."
    },
    {
      id: 3,
      text: "Either party may terminate this agreement at any time without cause",
      riskLevel: 'medium',
      explanation: "While mutual termination rights provide flexibility, immediate termination without notice period could leave you without representation at critical moments.",
      recommendation: "Consider adding a reasonable notice period (e.g., 30 days) except in cases of material breach or emergency situations."
    },
    {
      id: 4,
      text: "Client remains responsible for all unpaid fees",
      riskLevel: 'medium',
      explanation: "This clause ensures you must pay for services even after termination, but lacks clarity on what constitutes 'services rendered'.",
      recommendation: "Request detailed breakdown of billable work and establish clear boundaries on post-termination fee obligations."
    }
  ];

  // Function to highlight risks in the contract text
  const getHighlightedText = () => {
    let highlightedText = contractText;
    
    // Sort risks by text length (longest first) to avoid conflicts
    const sortedRisks = [...riskItems].sort((a, b) => b.text.length - a.text.length);
    
    sortedRisks.forEach(risk => {
      const riskColorClass = 
        risk.riskLevel === 'high' ? 'bg-red-100 border-red-300 text-red-900' :
        risk.riskLevel === 'medium' ? 'bg-yellow-100 border-yellow-300 text-yellow-900' :
        'bg-green-100 border-green-300 text-green-900';
      
      const isActive = activeRisk === risk.id;
      const activeClass = isActive ? 'ring-2 ring-blue-500 font-semibold' : '';
      
      const highlightSpan = `<span class="px-1 py-0.5 rounded border cursor-pointer transition-all hover:shadow-sm ${riskColorClass} ${activeClass}" data-risk-id="${risk.id}">${risk.text}</span>`;
      highlightedText = highlightedText.replace(risk.text, highlightSpan);
    });
    
    return highlightedText;
  };

  const activeRiskItem = riskItems.find(risk => risk.id === activeRisk);

  return (
    <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl mx-auto">
      {/* Browser-like header */}
      <div className="h-8 bg-gray-100 flex items-center px-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 text-xs text-gray-600">LegalHelper - Analysis Results</div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Legal Services Agreement - Analysis
          </h3>
          <div className="flex items-center space-x-2 text-sm">
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">2 High</span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">2 Medium</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">0 Low</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Text with Highlights */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Contract Document
              </h4>
              <div 
                className="text-sm leading-relaxed text-gray-700 whitespace-pre-line max-h-80 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const riskId = target.getAttribute('data-risk-id');
                  if (riskId) {
                    setActiveRisk(parseInt(riskId));
                  }
                }}
              />
            </div>
          </div>

          {/* Risk Analysis Panel */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <svg className="w-4 h-4 mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Risk Analysis
            </h4>

            {activeRiskItem && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center mb-2">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    activeRiskItem.riskLevel === 'high' ? 'bg-red-500' :
                    activeRiskItem.riskLevel === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></span>
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {activeRiskItem.riskLevel} Risk
                  </span>
                </div>
                
                <div className="mb-3">
                  <h5 className="text-sm font-semibold text-red-700 mb-1">Risk Identified:</h5>
                  <p className="text-xs text-gray-700 leading-relaxed">{activeRiskItem.explanation}</p>
                </div>
                
                <div>
                  <h5 className="text-sm font-semibold text-green-700 mb-1">Recommendation:</h5>
                  <p className="text-xs text-gray-700 leading-relaxed">{activeRiskItem.recommendation}</p>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {riskItems.map(risk => (
                <div
                  key={risk.id}
                  className={`p-2 rounded-md border cursor-pointer transition-all text-xs ${
                    activeRisk === risk.id
                      ? `${risk.riskLevel === 'high' ? 'bg-red-50 border-red-300' : 
                          risk.riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-300' : 
                          'bg-green-50 border-green-300'} ring-1 ring-blue-500`
                      : `border-gray-200 hover:border-gray-300 hover:bg-gray-50`
                  }`}
                  onClick={() => setActiveRisk(risk.id)}
                >
                  <div className="flex items-start">
                    <span className={`inline-block w-2 h-2 rounded-full mt-1 mr-2 flex-shrink-0 ${
                      risk.riskLevel === 'high' ? 'bg-red-500' :
                      risk.riskLevel === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></span>
                    <span className="text-gray-800 line-clamp-2">{risk.text.substring(0, 60)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-blue-800">
                Analysis Complete - 4 issues identified
              </span>
            </div>
            <div className="text-xs text-blue-600">
              Click highlighted text to see details
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
