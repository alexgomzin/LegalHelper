import { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Head from 'next/head';

export default function TestHostedCheckout() {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testCheckout = async () => {
    if (!user) {
      setError('Please log in first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/payment/create-hosted-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT,
          customerEmail: user.email,
          userId: user.id,
          successUrl: `${window.location.origin}/dashboard?purchase=success`,
          cancelUrl: `${window.location.origin}/pricing?purchase=cancelled`
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success && data.checkoutUrl) {
        // Open in new tab for testing
        window.open(data.checkoutUrl, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testDebug = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/debug-paddle-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT,
          customerEmail: user?.email || 'test@example.com',
          userId: user?.id
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Test Hosted Checkout - Legal Helper</title>
      </Head>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Test Hosted Checkout</h1>
        
        <div className="bg-blue-100 border border-blue-400 rounded p-4 mb-6">
          <p className="text-sm">
            <strong>User:</strong> {user ? `✅ ${user.email}` : '❌ Not logged in'}
          </p>
          <p className="text-sm">
            <strong>Environment:</strong> {process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox'}
          </p>
          <p className="text-sm">
            <strong>Price ID:</strong> {process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT || 'Not configured'}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <button
            onClick={testCheckout}
            disabled={!user || loading}
            className="bg-green-600 text-white py-3 px-6 rounded disabled:bg-gray-400 font-semibold mr-4"
          >
            {loading ? 'Testing...' : 'Test Hosted Checkout'}
          </button>

          <button
            onClick={testDebug}
            disabled={loading}
            className="bg-blue-600 text-white py-3 px-6 rounded disabled:bg-gray-400 font-semibold"
          >
            {loading ? 'Testing...' : 'Debug Transaction API'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-gray-100 border border-gray-400 rounded p-4 mb-6">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-amber-100 border border-amber-400 rounded p-4">
          <h3 className="font-bold mb-2">🔍 What This Tests:</h3>
          <ul className="text-sm space-y-1">
            <li>• <strong>Hosted Checkout:</strong> Tests the new hosted checkout approach</li>
            <li>• <strong>Debug API:</strong> Tests the transaction API to see if it returns proper payment URLs</li>
            <li>• <strong>Expected Result:</strong> Checkout URL should point to paddle.com, not dashboard</li>
            <li>• <strong>Success:</strong> If URL opens a Paddle payment form, the fix worked</li>
          </ul>
        </div>
      </div>
    </>
  );
} 