import { useState, useEffect } from 'react';
import Head from 'next/head';

declare global {
  interface Window {
    Paddle?: any;
  }
}

export default function TestCheckout() {
  const [paddleLoaded, setPaddleLoaded] = useState(false);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    
    script.onload = () => {
      setTimeout(() => {
        if (window.Paddle) {
          try {
            // Set environment to sandbox
            window.Paddle.Environment.set('sandbox');
            
            // Initialize Paddle
            const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
            if (clientToken) {
              window.Paddle.Initialize({
                token: clientToken,
                eventCallback: function(data: any) {
                  console.log('Paddle event:', data);
                  setDebugInfo(prev => prev + `\nEvent: ${JSON.stringify(data, null, 2)}`);
                  
                  if (data.name === 'checkout.completed') {
                    alert('Payment completed successfully!');
                  }
                }
              });
              setPaddleLoaded(true);
              setDebugInfo('Paddle loaded and initialized successfully');
            } else {
              setError('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN not configured');
            }
          } catch (err) {
            setError(`Paddle initialization failed: ${err}`);
          }
        } else {
          setError('Paddle SDK not available');
        }
      }, 100);
    };
    
    script.onerror = () => {
      setError('Failed to load Paddle script');
    };
    
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const testPaddleCheckout = () => {
    if (!window.Paddle || !paddleLoaded) {
      setError('Paddle not loaded');
      return;
    }

    const priceId = process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT;
    if (!priceId) {
      setError('NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT not configured');
      return;
    }

    try {
      setDebugInfo(prev => prev + `\nTrying checkout with price ID: ${priceId}`);
      
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: priceId,
            quantity: 1
          }
        ],
        customer: {
          email: 'test@example.com'
        },
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
          successUrl: `${window.location.origin}/dashboard?purchase=success`,
          cancelUrl: `${window.location.origin}/pricing?purchase=cancelled`
        }
      });
    } catch (err) {
      setError(`Checkout failed: ${err}`);
    }
  };

  const testAPICheckout = async () => {
    try {
      const priceId = process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT;
      if (!priceId) {
        setError('NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT not configured');
        return;
      }

      setDebugInfo(prev => prev + `\nTesting API checkout with price ID: ${priceId}`);
      
      const response = await fetch('/api/payment/create-paddle-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          customerEmail: 'test@example.com',
          successUrl: `${window.location.origin}/dashboard?purchase=success`,
          cancelUrl: `${window.location.origin}/pricing?purchase=cancelled`
        }),
      });

      const data = await response.json();
      setDebugInfo(prev => prev + `\nAPI Response: ${JSON.stringify(data, null, 2)}`);

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(`API Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`API request failed: ${err}`);
    }
  };

  return (
    <>
      <Head>
        <title>Test Paddle Checkout - LegalHelper</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Paddle Checkout</h1>

            {/* Environment Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-2">Environment Configuration</h2>
              <div className="space-y-1 text-sm">
                <p>Environment: <code>{process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'not set'}</code></p>
                <p>Client Token: <span className={process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ? '✓ Set' : '✗ Missing'}
                </span></p>
                <p>Pay Per Document Price ID: <code>{process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT || 'not set'}</code></p>
                <p>Paddle.js Status: <span className={paddleLoaded ? 'text-green-600' : 'text-yellow-600'}>
                  {paddleLoaded ? '✓ Loaded' : '⏳ Loading...'}
                </span></p>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="space-y-4 mb-6">
              <button
                onClick={testPaddleCheckout}
                disabled={!paddleLoaded}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors mr-4"
              >
                Test Paddle.js Checkout
              </button>
              
              <button
                onClick={testAPICheckout}
                className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Test API Checkout
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <strong>Error:</strong> {error}
                <button 
                  onClick={() => setError('')}
                  className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Debug Info */}
            {debugInfo && (
              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Debug Information:</h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {debugInfo}
                </pre>
                <button 
                  onClick={() => setDebugInfo('')}
                  className="mt-2 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Clear Debug Info
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 