import React from 'react';

export default function RealisticAnalysisExample() {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-blue-100">
      {/* Beautiful header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-2 mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold">Document Analysis</h3>
              <p className="text-blue-100 text-sm">AI-powered legal review complete</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-red-500 bg-opacity-20 text-red-100 px-3 py-1 rounded-full text-sm font-medium">
              2 High Risk
            </div>
            <div className="bg-yellow-500 bg-opacity-20 text-yellow-100 px-3 py-1 rounded-full text-sm font-medium">
              1 Medium Risk
            </div>
            <div className="bg-green-500 bg-opacity-20 text-green-100 px-3 py-1 rounded-full text-sm font-medium">
              Issues Found
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Document preview */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Contract Analysis</h4>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                <p>
                  <span className="font-medium">PAYMENT TERMS:</span><br/>
                  Client agrees to pay all fees within 30 days. 
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md mx-1 font-medium">
                    Late payments incur 2% monthly interest
                  </span>
                  charges may apply.
                </p>
                
                <p>
                  <span className="font-medium">LIABILITY:</span><br/>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md font-medium">
                    Law firm not liable for any damages
                  </span>
                  regardless of circumstances.
                </p>
                
                <p>
                  <span className="font-medium">TERMINATION:</span><br/>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md font-medium">
                    Either party may terminate immediately
                  </span>
                  without cause or notice period.
                </p>
              </div>
            </div>
          </div>

          {/* Analysis results */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Risk Assessment</h4>
            
            {/* High risk item */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-5 border-l-4 border-red-400">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-red-800 font-semibold text-sm uppercase tracking-wide">High Risk</span>
              </div>
              <h5 className="font-semibold text-red-900 mb-2">Excessive Interest Rate</h5>
              <p className="text-red-800 text-sm leading-relaxed">
                24% annual interest rate may be legally unenforceable and considered predatory.
              </p>
            </div>

            {/* Medium risk item */}
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-5 border-l-4 border-yellow-400">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-yellow-800 font-semibold text-sm uppercase tracking-wide">Medium Risk</span>
              </div>
              <h5 className="font-semibold text-yellow-900 mb-2">Immediate Termination</h5>
              <p className="text-yellow-800 text-sm leading-relaxed">
                No notice period required could leave you without legal representation unexpectedly.
              </p>
            </div>

            {/* Summary card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-800 font-semibold">Analysis Summary</span>
              </div>
              <p className="text-blue-700 text-sm leading-relaxed">
                Document contains <strong>3 significant issues</strong> requiring attention before signing. 
                Consider negotiating terms or seeking legal counsel.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom action area */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">Analysis completed in 45 seconds</span>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Download Report
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
