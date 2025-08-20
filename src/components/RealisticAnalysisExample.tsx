import React, { useState } from 'react';

interface RiskItem {
  id: number;
  text: string;
  riskLevel: 'high' | 'medium' | 'low';
  explanation: string;
  recommendation: string;
}

export default function RealisticAnalysisExample() {
  const [activeRisk, setActiveRisk] = useState<number>(1);

  // Simplified, shorter contract excerpt
  const contractText = `PAYMENT TERMS
Client agrees to pay all fees within 30 days of invoice date. Late payments may incur interest charges of 2% per month.

LIABILITY LIMITATION  
IN NO EVENT SHALL LAW FIRM BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES.

TERMINATION
Either party may terminate this agreement at any time without cause by providing written notice.

CONFIDENTIALITY
Both parties agree to maintain confidentiality regarding all matters discussed during this engagement.`;

  // Simplified risk items
  const riskItems: RiskItem[] = [
    {
      id: 1,
      text: "Late payments may incur interest charges of 2% per month",
      riskLevel: 'high',
      explanation: "24% annual interest rate is extremely high and may be legally unenforceable in many jurisdictions.",
      recommendation: "Negotiate for a lower interest rate (1-1.5% monthly) or request removal of interest charges entirely."
    },
    {
      id: 2,
      text: "IN NO EVENT SHALL LAW FIRM BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES",
      riskLevel: 'high',
      explanation: "Broad liability limitation may prevent recovery even in cases of professional negligence.",
      recommendation: "Limit this clause to exclude gross negligence, willful misconduct, or professional malpractice."
    },
    {
      id: 3,
      text: "Either party may terminate this agreement at any time without cause",
      riskLevel: 'medium',
      explanation: "Immediate termination without notice period could leave you without representation at critical moments.",
      recommendation: "Add a reasonable notice period (30 days) except in cases of material breach or emergencies."
    },
    {
      id: 4,
      text: "Both parties agree to maintain confidentiality",
      riskLevel: 'low',
      explanation: "Standard confidentiality clause with no apparent issues, though scope could be more specific.",
      recommendation: "Consider defining specific types of confidential information and duration of confidentiality obligations."
    }
  ];

  // Function to highlight risks in the contract text
  const getHighlightedText = () => {
    let highlightedText = contractText;
    
    const sortedRisks = [...riskItems].sort((a, b) => b.text.length - a.text.length);
    
    sortedRisks.forEach(risk => {
      const baseColorClass = 
        risk.riskLevel === 'high' ? 'bg-red-50 text-red-800 border-l-4 border-red-400' :
        risk.riskLevel === 'medium' ? 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400' :
        'bg-green-50 text-green-800 border-l-4 border-green-400';
      
      const isActive = activeRisk === risk.id;
      const activeClass = isActive ? 
        (risk.riskLevel === 'high' ? 'bg-red-100 shadow-lg transform scale-105' :
         risk.riskLevel === 'medium' ? 'bg-yellow-100 shadow-lg transform scale-105' :
         'bg-green-100 shadow-lg transform scale-105') : '';
      
      const hoverClass = 'hover:shadow-md hover:bg-opacity-80 hover:transform hover:scale-102';
      
      const highlightSpan = `<span class="px-2 py-1 rounded-r-md cursor-pointer transition-all duration-300 ease-in-out ${baseColorClass} ${activeClass} ${hoverClass}" data-risk-id="${risk.id}">${risk.text}</span>`;
      highlightedText = highlightedText.replace(risk.text, highlightSpan);
    });
    
    return highlightedText;
  };

  const activeRiskItem = riskItems.find(risk => risk.id === activeRisk);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-3xl mx-auto border border-gray-100">
      {/* Simplified header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Document Analysis Results
          </h3>
          <div className="flex items-center space-x-2 text-sm">
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium text-xs">2 High</span>
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium text-xs">1 Medium</span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium text-xs">1 Low</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Document Text - more space */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">Contract Excerpt</h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div 
                className="text-sm leading-relaxed text-gray-800 whitespace-pre-line"
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
            <p className="text-xs text-gray-500 mt-2 italic">Click on highlighted text to see risk analysis</p>
          </div>

          {/* Risk Analysis Panel - compact */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">Risk Analysis</h4>
            
            {activeRiskItem && (
              <div className="mb-4 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ease-in-out">
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      activeRiskItem.riskLevel === 'high' ? 'bg-red-500' :
                      activeRiskItem.riskLevel === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></span>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {activeRiskItem.riskLevel} Risk
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-semibold text-red-700 mb-1 uppercase tracking-wide">Risk Analysis:</h5>
                      <p className="text-sm text-gray-700 leading-relaxed">{activeRiskItem.explanation}</p>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <h5 className="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wide">Recommendation:</h5>
                      <p className="text-sm text-gray-700 leading-relaxed">{activeRiskItem.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {riskItems.map((risk, index) => (
                <div
                  key={risk.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out text-sm border transform hover:scale-102 hover:shadow-md ${
                    activeRisk === risk.id
                      ? `${risk.riskLevel === 'high' ? 'bg-red-50 border-red-200 shadow-md scale-105' : 
                          risk.riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-200 shadow-md scale-105' : 
                          'bg-green-50 border-green-200 shadow-md scale-105'}`
                      : `border-gray-100 hover:border-gray-200 hover:bg-gray-50`
                  }`}
                  onClick={() => setActiveRisk(risk.id)}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-start">
                    <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 transition-all duration-200 ${
                      risk.riskLevel === 'high' ? 'bg-red-500' :
                      risk.riskLevel === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    } ${activeRisk === risk.id ? 'w-3 h-3 mt-1.5' : ''}`}></span>
                    <span className="text-gray-700 leading-tight transition-colors duration-200">{risk.text.substring(0, 50)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simplified bottom info */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Interactive analysis - click highlighted text to explore risks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
