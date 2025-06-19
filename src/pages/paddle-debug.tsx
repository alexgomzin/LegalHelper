import { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function PaddleDebug() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);

  const testUrls = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    const priceId = 'pri_01jxr3y58530jpe07e9cttnamc'; // Your pay-per-document price ID
    const email = encodeURIComponent(user.email);

    const urlsToTest = [
      `https://sandbox-checkout.paddle.com/checkout?_ptxn=${priceId}&customer_email=${email}`,
      `https://sandbox-checkout.paddle.com/${priceId}?customer_email=${email}`,
      `https://checkout.paddle.com/checkout?_ptxn=${priceId}&customer_email=${email}`,
      `https://checkout.paddle.com/${priceId}?customer_email=${email}`,
      `https://buy.paddle.com/product/${priceId}?customer_email=${email}`,
      `https://www.paddle.com/checkout/${priceId}?customer_email=${email}`,
      `https://checkout.paddle.com/checkout?price_id=${priceId}&customer_email=${email}`,
      `https://sandbox-checkout.paddle.com/checkout?price_id=${priceId}&customer_email=${email}`,
    ];

    setTestResults([]);
    
    for (let i = 0; i < urlsToTest.length; i++) {
      const url = urlsToTest[i];
      setTestResults(prev => [...prev, { url, status: 'Testing...' }]);
      
      // Test each URL by trying to open it
      setTimeout(() => {
        window.open(url, `paddle-test-${i}`, 'width=400,height=600,scrollbars=yes,resizable=yes');
      }, i * 1000); // Delay each test by 1 second
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Paddle Billing Debug</h1>
      
      <div className="bg-blue-100 border border-blue-400 rounded p-4 mb-6">
        <p className="text-sm">
          <strong>User:</strong> {user ? `✅ ${user.email}` : '❌ Not logged in'}
        </p>
        <p className="text-sm">
          <strong>Test Price ID:</strong> pri_01jxr3y58530jpe07e9cttnamc
        </p>
      </div>

      <button
        onClick={testUrls}
        disabled={!user}
        className="bg-blue-600 text-white py-2 px-4 rounded disabled:bg-gray-400 mb-6"
      >
        Test All Checkout URLs
      </button>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">URL Test Results:</h2>
        {testResults.map((result, index) => (
          <div key={index} className="border border-gray-200 rounded p-4">
            <p className="text-sm font-mono break-all">{result.url}</p>
            <p className="text-sm text-gray-600">{result.status}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <h3 className="font-bold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Make sure you're logged in</li>
          <li>Click "Test All Checkout URLs"</li>
          <li>Multiple windows will open (one every second)</li>
          <li>Check which ones show a valid Paddle checkout vs "Page Not Found"</li>
          <li>Report back which URL format works!</li>
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