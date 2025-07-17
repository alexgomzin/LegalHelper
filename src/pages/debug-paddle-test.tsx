import { useState } from 'react';
import Head from 'next/head';

export default function DebugPaddleTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const runDebugTest = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/debug-paddle-detailed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'pri_01jxr3y58530jpe07e9cttnamc',
          customerEmail: 'test@example.com',
          userId: 'test-user-123'
        }),
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
        <title>Paddle Debug Test</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Paddle API Debug Test</h1>
            
            <div className="mb-6">
              <button
                onClick={runDebugTest}
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Testing...' : 'Run Debug Test'}
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
                  <h3 className="font-bold mb-2">Test Results:</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-bold text-yellow-800 mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside text-yellow-700 space-y-1">
                <li>Click "Run Debug Test" to test multiple Paddle API request variations</li>
                <li>Check the browser console for detailed logs</li>
                <li>Check your server logs (Render logs) for complete error details</li>
                <li>The test will try 4 different request formats to isolate the issue</li>
              </ol>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-bold text-blue-800 mb-2">What this tests:</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li><strong>Test 1:</strong> Minimal request (just price_id and customer email)</li>
                <li><strong>Test 2:</strong> With checkout URL</li>
                <li><strong>Test 3:</strong> With custom_data</li>
                <li><strong>Test 4:</strong> Hardcoded known good values</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 