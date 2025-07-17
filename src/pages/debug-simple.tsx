import { useState } from 'react';
import Head from 'next/head';

export default function DebugSimple() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const runSimpleTest = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/debug-paddle-simple-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      setResults(data);

      if (!response.ok) {
        setError(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Simple Paddle Debug</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Simple Paddle Debug</h1>
            
            <div className="mb-6">
              <button
                onClick={runSimpleTest}
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Testing...' : 'Run Simple Test'}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <h3 className="font-bold">Error:</h3>
                <p>{error}</p>
              </div>
            )}

            {results && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-100 rounded">
                  <h3 className="font-bold mb-2">Full Debug Results:</h3>
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>

                {results.response && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded">
                      <h4 className="font-bold text-blue-800 mb-2">Request Info:</h4>
                      <p><strong>URL:</strong> {results.paddleApiUrl}</p>
                      <p><strong>Environment:</strong> {results.environment}</p>
                      <p><strong>API Key Format:</strong> {results.apiKeyInfo?.format}</p>
                      <p><strong>API Key Environment:</strong> {results.apiKeyInfo?.environment}</p>
                    </div>

                    <div className="p-4 bg-red-50 rounded">
                      <h4 className="font-bold text-red-800 mb-2">Response Info:</h4>
                      <p><strong>Status:</strong> {results.response.status}</p>
                      <p><strong>OK:</strong> {results.response.ok ? 'Yes' : 'No'}</p>
                      <p><strong>Content-Type:</strong> {results.response.headers['content-type']}</p>
                    </div>
                  </div>
                )}

                {results.response?.data && (
                  <div className="p-4 bg-yellow-50 rounded">
                    <h4 className="font-bold text-yellow-800 mb-2">Paddle API Error Response:</h4>
                    <pre className="text-sm overflow-auto whitespace-pre-wrap">
                      {JSON.stringify(results.response.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-bold text-green-800 mb-2">What this shows:</h3>
              <ul className="list-disc list-inside text-green-700 space-y-1">
                <li>Exact Paddle API error response</li>
                <li>API key format validation</li>
                <li>Environment configuration</li>
                <li>Request/response details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 