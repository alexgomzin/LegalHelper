'use client';

import { PaddleProvider, usePaddle } from '@/components/PaddleProvider';
import { useAuth } from '@/contexts/SupabaseAuthContext';

function TestPaddleContent() {
  const { isLoaded, openCheckout } = usePaddle();
  const { user } = useAuth();

  const testCheckout = async (productId: string) => {
    if (!user) {
      alert('Please login first');
      return;
    }

    console.log('Testing Paddle Billing checkout for price ID:', productId);

    // Use the new Paddle Billing checkout method
    await openCheckout({
      product: productId,
      email: user.email,
      successCallback: (data) => {
        console.log('Purchase successful!', data);
        alert('Purchase successful! Check console for details.');
      },
      closeCallback: () => {
        console.log('Checkout closed');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Paddle Checkout Test</h1>
      
      <div className="bg-yellow-100 border border-yellow-400 rounded p-4 mb-6">
        <p className="text-sm">
          <strong>Status:</strong> Paddle is {isLoaded ? '✅ loaded' : '⏳ loading...'}
        </p>
        <p className="text-sm">
          <strong>User:</strong> {user ? `✅ ${user.email}` : '❌ Not logged in'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded p-4">
          <h3 className="font-bold">Single Analysis</h3>
          <p className="text-gray-600 text-sm">$1.50</p>
          <button
            onClick={() => testCheckout(process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT || 'PAY_PER_DOCUMENT')}
            disabled={!isLoaded || !user}
            className="mt-2 w-full bg-green-600 text-white py-2 rounded disabled:bg-gray-400"
          >
            Test $1.50 Purchase
          </button>
        </div>

        <div className="border border-gray-200 rounded p-4">
          <h3 className="font-bold">Starter Pack</h3>
          <p className="text-gray-600 text-sm">$5.50 (5 analyses)</p>
          <button
            onClick={() => testCheckout(process.env.NEXT_PUBLIC_PADDLE_5_PACK || 'PRODUCT_ID_5_PACK')}
            disabled={!isLoaded || !user}
            className="mt-2 w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
          >
            Test $5.50 Purchase
          </button>
        </div>

        <div className="border border-gray-200 rounded p-4">
          <h3 className="font-bold">Professional Pack</h3>
          <p className="text-gray-600 text-sm">$12.00 (15 analyses)</p>
          <button
            onClick={() => testCheckout(process.env.NEXT_PUBLIC_PADDLE_15_PACK || 'PRODUCT_ID_15_PACK')}
            disabled={!isLoaded || !user}
            className="mt-2 w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
          >
            Test $12.00 Purchase
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Make sure you're logged in</li>
          <li>Wait for Paddle to load (green checkmark above)</li>
          <li>Click any "Test Purchase" button</li>
          <li>The Paddle checkout overlay should open</li>
          <li>You can close it or complete a test transaction</li>
        </ol>
      </div>
    </div>
  );
}

export default function TestPaddle() {
  return (
    <PaddleProvider>
      <TestPaddleContent />
    </PaddleProvider>
  );
} 