import { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function PaddleDebug() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testCheckout = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    setIsLoading(true);
    setTestResults([]);

    const priceIds = [
      'pri_01jxr3y58530jpe07e9cttnamc', // Pay per document
      'pri_01jxr3zc1d20kdagx69ht75c5y', // 5 pack
      'pri_01jxr4273t1g8fsdje12v8ztwt', // 15 pack
      'pri_01jxr44atsbpkaam04an1cm6rc', // 30 pack
      'pri_01jxr46gefp8dv3cp12h6xs607'  // Subscription
    ];

    const priceNames = [
      'Pay Per Document ($1.50)',
      '5 Credit Pack ($5.50)',
      '15 Credit Pack ($12.00)', 
      '30 Credit Pack ($22.50)',
      'Monthly Subscription ($30.00)'
    ];

    for (let i = 0; i < priceIds.length; i++) {
      const priceId = priceIds[i];
      const priceName = priceNames[i];
      
      setTestResults(prev => [...prev, { 
        priceId, 
        priceName,
        status: 'Creating checkout...', 
        url: '',
        error: null 
      }]);

      try {
        const response = await fetch('/api/payment/create-paddle-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: priceId,
            customerEmail: user.email,
            successUrl: `${window.location.origin}/dashboard?purchase=success`,
            cancelUrl: `${window.location.origin}/pricing?purchase=cancelled`
          }),
        });

        const data = await response.json();

        if (data.success && data.checkoutUrl) {
          setTestResults(prev => prev.map(result => 
            result.priceId === priceId 
              ? { ...result, status: 'Opening checkout...', url: data.checkoutUrl }
              : result
          ));

          // Try to open the checkout URL
          setTimeout(() => {
            const opened = window.open(data.checkoutUrl, `paddle-checkout-${i}`, 'width=500,height=700,scrollbars=yes,resizable=yes');
            
            setTestResults(prev => prev.map(result => 
              result.priceId === priceId 
                ? { 
                    ...result, 
                    status: opened ? 'Checkout opened' : 'Popup blocked - check popup blocker',
                    url: data.checkoutUrl
                  }
                : result
            ));
          }, i * 1000);
        } else {
          setTestResults(prev => prev.map(result => 
            result.priceId === priceId 
              ? { ...result, status: 'Failed', error: data.error || 'Unknown error' }
              : result
          ));
        }
      } catch (error) {
        setTestResults(prev => prev.map(result => 
          result.priceId === priceId 
            ? { ...result, status: 'Failed', error: error instanceof Error ? error.message : 'Unknown error' }
            : result
        ));
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Paddle Billing Debug</h1>
      
      <div className="bg-blue-100 border border-blue-400 rounded p-4 mb-6">
        <p className="text-sm">
          <strong>User:</strong> {user ? `✅ ${user.email}` : '❌ Not logged in'}
        </p>
        <p className="text-sm">
          <strong>Environment:</strong> {process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox'}
        </p>
        <p className="text-sm">
          <strong>Vendor ID:</strong> {process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID || 'Not configured'}
        </p>
      </div>

      <div className="bg-amber-100 border border-amber-400 rounded p-4 mb-6">
        <h3 className="font-bold mb-2">⚠️ Important Notes:</h3>
        <ul className="text-sm space-y-1">
          <li>• The old direct URL approach doesn't work with Paddle Billing</li>
          <li>• We need to either use Paddle.js SDK or create hosted checkouts in dashboard</li>
          <li>• This test will create checkout URLs via API and try to open them</li>
          <li>• If API fails, it will fallback to our internal checkout page</li>
        </ul>
      </div>

      <button
        onClick={testCheckout}
        disabled={!user || isLoading}
        className="bg-blue-600 text-white py-3 px-6 rounded disabled:bg-gray-400 mb-6 font-semibold"
      >
        {isLoading ? 'Testing Checkouts...' : 'Test All Price Checkouts'}
      </button>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Checkout Test Results:</h2>
        {testResults.map((result, index) => (
          <div key={index} className="border border-gray-200 rounded p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{result.priceName}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                result.status === 'Checkout opened' ? 'bg-green-100 text-green-800' :
                result.status === 'Failed' ? 'bg-red-100 text-red-800' :
                result.status.includes('blocked') ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {result.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Price ID: <code className="bg-gray-100 px-1 rounded">{result.priceId}</code></p>
            {result.url && (
              <p className="text-sm">
                <strong>Checkout URL:</strong> 
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  Open Checkout
                </a>
              </p>
            )}
            {result.error && (
              <p className="text-sm text-red-600 mt-2"><strong>Error:</strong> {result.error}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <h3 className="font-bold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Make sure you're logged in</li>
          <li>Click "Test All Price Checkouts"</li>
          <li>Each checkout will be created via API and opened in a new window</li>
          <li>Check if the Paddle checkout loads properly for each price</li>
          <li>If popups are blocked, click the "Open Checkout" links manually</li>
        </ol>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Current Environment:</h3>
        <p className="text-sm">Paddle Environment: {process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox'}</p>
        <p className="text-sm">Vendor ID: {process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID}</p>
      </div>
    </div>
  );
} 