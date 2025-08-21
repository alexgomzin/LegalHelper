import React from 'react';

export default function RealisticAnalysisExample() {
  return (
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
              <h3 className="text-sm font-semibold">Legal Document Analysis</h3>
              <p className="text-blue-100 text-xs">AI Review Complete</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="bg-red-500 bg-opacity-30 text-red-100 px-2 py-0.5 rounded-full text-xs font-medium">
              2 High
            </div>
            <div className="bg-yellow-500 bg-opacity-30 text-yellow-100 px-2 py-0.5 rounded-full text-xs font-medium">
              1 Med
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Attractive document preview */}
        <div className="mb-4">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-3 text-xs text-gray-700 leading-relaxed border border-slate-200">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
              <span className="font-semibold text-slate-800">Real Estate Purchase Agreement</span>
            </div>
            <p className="mb-2">
              <span className="font-medium text-slate-900">🏡 Property Value:</span> $750,000 
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium ml-1">
                ✓ Fair market price
              </span>
            </p>
            <p className="mb-2">
              <span className="font-medium text-slate-900">💰 Deposit:</span> 10% down payment required
              <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium ml-1">
                ⚠️ Non-refundable clause
              </span>
            </p>
            <p>
              <span className="font-medium text-slate-900">📋 Inspection:</span> 
              <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-medium ml-1">
                🚨 Waived inspection rights
              </span>
            </p>
          </div>
        </div>

        {/* Smart risk assessment */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <h4 className="text-sm font-semibold text-gray-800">AI Insights:</h4>
            <div className="ml-2 flex">
              <div className="w-1 h-1 bg-blue-400 rounded-full mr-1 animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full mr-1 animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-rose-100 border-l-3 border-red-400 p-2 rounded-r shadow-sm">
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 shadow-sm"></div>
              <span className="text-red-800 font-medium text-xs uppercase tracking-wider">🔥 Critical</span>
            </div>
            <p className="text-red-800 text-xs font-medium">Inspection waiver could hide $50K+ in repairs</p>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border-l-3 border-yellow-400 p-2 rounded-r shadow-sm">
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 shadow-sm"></div>
              <span className="text-yellow-800 font-medium text-xs uppercase tracking-wider">⚡ Caution</span>
            </div>
            <p className="text-yellow-800 text-xs font-medium">Non-refundable deposit unusually high</p>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-green-100 border-l-3 border-emerald-400 p-2 rounded-r shadow-sm">
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 shadow-sm"></div>
              <span className="text-emerald-800 font-medium text-xs uppercase tracking-wider">✨ Good</span>
            </div>
            <p className="text-emerald-800 text-xs font-medium">Property price aligns with market value</p>
          </div>
        </div>

        {/* Smart summary with score */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-indigo-800 font-semibold text-xs">Risk Score</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xs text-indigo-600 mr-1">7.2/10</span>
              <div className="w-8 h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
          </div>
          <p className="text-indigo-700 text-xs leading-relaxed">
            <strong>High-risk contract</strong> detected. Recommend negotiating inspection clause before proceeding.
          </p>
        </div>

        {/* Enhanced action footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center text-gray-500">
            <div className="flex items-center">
              <svg className="w-3 h-3 mr-1 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs">Analyzed in 12s</span>
            </div>
            <div className="ml-3 flex items-center">
              <span className="text-xs text-emerald-600 font-medium">💎 95% accuracy</span>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded text-xs font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
            ✨ Analyze Now
          </button>
        </div>
      </div>
    </div>
  );
}
