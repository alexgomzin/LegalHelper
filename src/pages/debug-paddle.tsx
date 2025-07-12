import { useState, useEffect } from 'react';
import Head from 'next/head';

interface DebugData {
  status: string;
  environment: string;
  validation: any;
  priceValidation: any[];
  apiTest: any;
  priceTest: any;
  criticalIssues: string[];
  recommendations: string[];
  summary: any;
}

export default function DebugPaddle() {
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDebugData();
  }, []);

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug-paddle-full');
      const data = await response.json();
      setDebugData(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch debug data');
      console.error('Debug fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Paddle configuration debug data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchDebugData}
            className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Paddle Configuration Debug - Legal Helper</title>
      </Head>
      
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Paddle Configuration Debug</h1>
          <p className="text-gray-600">
            This page helps diagnose Paddle checkout issues, especially the 400 error you're experiencing.
          </p>
        </div>

        {debugData && (
          <>
            {/* Status Overview */}
            <div className={`p-6 rounded-lg mb-6 ${
              debugData.status === 'HEALTHY' ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
            } border`}>
              <h2 className="text-xl font-bold mb-2">
                Overall Status: {debugData.status}
              </h2>
              <p className="text-gray-700">
                <strong>Environment:</strong> {debugData.environment}
              </p>
              <p className="text-gray-700">
                <strong>Most Likely Cause:</strong> {debugData.summary.mostLikelyCause}
              </p>
              <p className="text-gray-700">
                <strong>Next Step:</strong> {debugData.summary.nextStep}
              </p>
            </div>

            {/* Critical Issues */}
            {debugData.criticalIssues.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-red-800 mb-4">
                  🚨 Critical Issues ({debugData.criticalIssues.length})
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {debugData.criticalIssues.map((issue, index) => (
                    <li key={index} className="text-red-700">{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {debugData.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-blue-800 mb-4">
                  💡 Recommendations
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {debugData.recommendations.map((rec, index) => (
                    <li key={index} className="text-blue-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Environment Variables Validation */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Environment Variables</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(debugData.validation).map(([key, val]: [string, any]) => (
                  <div key={key} className="border border-gray-100 rounded p-4">
                    <h4 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Value:</strong> {val.value || 'Not set'}
                    </p>
                    <p className={`text-sm mt-1 ${val.valid ? 'text-green-600' : 'text-red-600'}`}>
                      <strong>Status:</strong> {val.valid ? '✅ Valid' : '❌ Invalid'}
                    </p>
                    {val.issue && (
                      <p className="text-sm text-red-600 mt-1">
                        <strong>Issue:</strong> {val.issue}
                      </p>
                    )}
                    {val.expectedFormat && (
                      <p className="text-sm text-gray-500 mt-1">
                        <strong>Expected:</strong> {val.expectedFormat}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price IDs Validation */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Price IDs Validation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {debugData.priceValidation.map((price, index) => (
                  <div key={index} className="border border-gray-100 rounded p-4">
                    <h4 className="font-semibold capitalize">{price.product.replace(/([A-Z])/g, ' $1')}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>ID:</strong> {price.id || 'Not set'}
                    </p>
                    <p className={`text-sm mt-1 ${price.valid ? 'text-green-600' : 'text-red-600'}`}>
                      <strong>Status:</strong> {price.valid ? '✅ Valid' : '❌ Invalid'}
                    </p>
                    {price.issue && (
                      <p className="text-sm text-red-600 mt-1">
                        <strong>Issue:</strong> {price.issue}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      <strong>Environment:</strong> {price.environment_match}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* API Test Results */}
            {debugData.apiTest && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">API Connectivity Test</h3>
                <div className={`p-4 rounded ${debugData.apiTest.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`font-semibold ${debugData.apiTest.success ? 'text-green-800' : 'text-red-800'}`}>
                    {debugData.apiTest.message}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>URL:</strong> {debugData.apiTest.url}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Status:</strong> {debugData.apiTest.status}
                  </p>
                  {debugData.apiTest.error && (
                    <p className="text-sm text-red-600 mt-1">
                      <strong>Error:</strong> {debugData.apiTest.error}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Price Test Results */}
            {debugData.priceTest && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Price ID Test</h3>
                <div className={`p-4 rounded ${debugData.priceTest.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`font-semibold ${debugData.priceTest.success ? 'text-green-800' : 'text-red-800'}`}>
                    {debugData.priceTest.message}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Price ID:</strong> {debugData.priceTest.priceId}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Status:</strong> {debugData.priceTest.status}
                  </p>
                  {debugData.priceTest.error && (
                    <p className="text-sm text-red-600 mt-1">
                      <strong>Error:</strong> {debugData.priceTest.error}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Raw Debug Data */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Raw Debug Data</h3>
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </div>

            {/* Refresh Button */}
            <div className="text-center mt-6">
              <button
                onClick={fetchDebugData}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Refresh Debug Data
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
} 