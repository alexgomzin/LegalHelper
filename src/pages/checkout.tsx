'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Link from 'next/link';

declare global {
  interface Window {
    Paddle?: any;
  }
}

export default function Checkout() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [paddleLoaded, setPaddleLoaded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [priceId, setPriceId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [successUrl, setSuccessUrl] = useState<string>('');
  const [cancelUrl, setCancelUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string>('');

  // Get parameters from URL query
  useEffect(() => {
    if (router.isReady) {
      const { plan, product, priceId: queryPriceId, email: queryEmail, success, cancel } = router.query;
      
      if (plan) setSelectedPlan(plan as string);
      if (product) setSelectedProduct(product as string);
      if (queryPriceId) setPriceId(queryPriceId as string);
      if (queryEmail) setEmail(queryEmail as string);
      if (success) setSuccessUrl(success as string);
      if (cancel) setCancelUrl(cancel as string);
    }
  }, [router.isReady, router.query]);

  // Redirect to login if not authenticated and no email provided
  useEffect(() => {
    if (!isLoading && !user && !email) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [isLoading, user, email, router]);

  // Load Paddle.js for Paddle Billing
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
        
        window.Paddle.Initialize({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || 'test_client_token',
          environment: environment,
          eventCallback: function(data: any) {
            console.log('Paddle event:', data);
            
            if (data.name === 'checkout.completed') {
              setIsProcessing(true);
              handleSuccessfulPurchase(data);
            }
            
            if (data.name === 'checkout.error') {
              setCheckoutError(data.error?.message || 'Checkout failed');
            }
          }
        });
        setPaddleLoaded(true);
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSuccessfulPurchase = async (data: any) => {
    try {
      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: data.data?.transaction_id,
          user_id: user?.id,
          email: email || user?.email,
        }),
      });

      if (response.ok) {
        // Redirect to success page
        if (successUrl) {
          window.location.href = successUrl;
        } else {
          router.push('/dashboard?purchase=success');
        }
      } else {
        console.error('Failed to process purchase');
        setCheckoutError('Purchase completed but there was an issue updating your account. Please contact support.');
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      setCheckoutError('Purchase completed but there was an issue updating your account. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const initiatePaddleCheckout = () => {
    if (!paddleLoaded) {
      setCheckoutError('Payment system is not ready. Please try again.');
      return;
    }

    if (!priceId) {
      setCheckoutError('No price selected. Please return to pricing page.');
      return;
    }

    const customerEmail = email || user?.email;
    if (!customerEmail) {
      setCheckoutError('No customer email available. Please login or provide email.');
      return;
    }

    setCheckoutError('');
    setIsProcessing(true);

    if (window.Paddle) {
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: priceId,
            quantity: 1
          }
        ],
        customer: {
          email: customerEmail
        },
        settings: {
          displayMode: 'overlay',
          locale: 'en',
          theme: 'light',
          successUrl: successUrl || `${window.location.origin}/dashboard?purchase=success`,
          cancelUrl: cancelUrl || `${window.location.origin}/pricing?purchase=cancelled`
        }
      });
    }
    
    setIsProcessing(false);
  };

  const getPriceDetails = () => {
    // Map price IDs to plan details
    const priceMap: { [key: string]: any } = {
      'pri_01jxr3y58530jpe07e9cttnamc': {
        title: 'Pay-as-you-go',
        price: '$1.50',
        description: 'Per document analysis',
        features: ['No subscription required', 'Pay only when you need analysis', 'All analysis features included']
      },
      'pri_01jxr3zc1d20kdagx69ht75c5y': {
        title: 'Starter Pack',
        price: '$5.50',
        description: '5 analyses ($1.10 each)',
        features: ['Credits never expire', 'All analysis features included', 'Perfect for occasional use']
      },
      'pri_01jxr4273t1g8fsdje12v8ztwt': {
        title: 'Professional Pack',
        price: '$12.00',
        description: '15 analyses ($0.80 each)',
        features: ['Credits never expire', 'All analysis features included', 'Save 47% vs pay-as-you-go', 'Most popular choice']
      },
      'pri_01jxr44atsbpkaam04an1cm6rc': {
        title: 'Business Pack',
        price: '$22.50',
        description: '30 analyses ($0.75 each)',
        features: ['Credits never expire', 'All analysis features included', 'Save 50% vs pay-as-you-go', 'Best value for teams']
      },
      'pri_01jxr46gefp8dv3cp12h6xs607': {
        title: 'Monthly Subscription',
        price: '$30.00',
        description: '50 analyses per month ($0.60 each)',
        features: ['Best value for high usage', 'Cancel anytime', 'Recurring monthly billing', 'Priority support']
      }
    };

    return priceMap[priceId] || {
      title: 'Select a Plan',
      price: '',
      description: 'Please select a valid plan',
      features: []
    };
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const planDetails = getPriceDetails();
  const customerEmail = email || user?.email;

  return (
    <>
      <Head>
        <title>Checkout - LegalHelper</title>
        <meta name="description" content="Complete your purchase" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
              <p className="text-gray-600 mt-2">You're about to purchase:</p>
            </div>

            {/* Plan Details */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{planDetails.title}</h2>
              <p className="text-3xl font-bold text-blue-600 mb-2">{planDetails.price}</p>
              <p className="text-gray-600 mb-4">{planDetails.description}</p>
              
              <ul className="space-y-2">
                {planDetails.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Details */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Details</h3>
              <p className="text-gray-600">
                <strong>Email:</strong> {customerEmail || 'Not provided'}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                <strong>Price ID:</strong> <code className="bg-gray-100 px-1 rounded">{priceId}</code>
              </p>
            </div>

            {/* Error Display */}
            {checkoutError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <strong>Error:</strong> {checkoutError}
              </div>
            )}

            {/* Checkout Button */}
            <div className="text-center">
              <button
                onClick={initiatePaddleCheckout}
                disabled={isProcessing || !paddleLoaded || !priceId || !customerEmail}
                className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
              </button>
              
              <p className="text-sm text-gray-500 mt-2">
                {!paddleLoaded && 'Loading payment system...'}
                {paddleLoaded && !priceId && 'Missing price information'}
                {paddleLoaded && !customerEmail && 'Missing customer email'}
              </p>
            </div>

            {/* Back to Pricing Link */}
            <div className="text-center mt-6">
              <Link href="/pricing" className="text-blue-600 hover:underline">
                ← Back to Pricing
              </Link>
            </div>

            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold mb-2">Debug Info:</h4>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify({
                    priceId,
                    email,
                    customerEmail,
                    successUrl,
                    cancelUrl,
                    paddleLoaded,
                    user: user?.email
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 