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
  const [isProcessing, setIsProcessing] = useState(false);

  // Get plan and product from URL query parameters
  useEffect(() => {
    if (router.isReady) {
      const { plan, product } = router.query;
      if (plan) setSelectedPlan(plan as string);
      if (product) setSelectedProduct(product as string);
    }
  }, [router.isReady, router.query]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(`/checkout?plan=${selectedPlan}&product=${selectedProduct}`)}`);
    }
  }, [isLoading, user, router, selectedPlan, selectedProduct]);

  // Load Paddle JS
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/paddle.js';
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Setup({
          vendor: process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID || '12345',
          eventCallback: function(data: any) {
            if (data.event === 'Checkout.Complete') {
              setIsProcessing(true);
              handleSuccessfulPurchase(data);
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
      const apiEndpoint = selectedPlan === 'payg' ? '/api/payment/pay-per-document' : '/api/payment/confirm';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkout_id: data.checkout.id,
          user_id: user?.id,
          product_id: selectedProduct,
        }),
      });

      if (response.ok) {
        // Redirect to success page or dashboard
        router.push('/dashboard?purchase=success');
      } else {
        console.error('Failed to process purchase');
        alert('Purchase completed but there was an issue updating your account. Please contact support.');
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert('Purchase completed but there was an issue updating your account. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const initiatePaddleCheckout = () => {
    if (!paddleLoaded || !user) {
      alert('Payment system is not ready. Please try again.');
      return;
    }

    let productId = selectedProduct;
    
    // Map plan to product ID if not specified
    if (!productId) {
      switch (selectedPlan) {
        case 'payg':
          productId = 'PAY_PER_DOCUMENT';
          break;
        case 'pack5':
          productId = 'PRODUCT_ID_5_PACK';
          break;
        case 'pack15':
          productId = 'PRODUCT_ID_15_PACK';
          break;
        case 'pack30':
          productId = 'PRODUCT_ID_30_PACK';
          break;
        case 'subscription':
          productId = 'PRODUCT_ID_50_PACK_SUBSCRIPTION';
          break;
        default:
          alert('Invalid plan selected');
          return;
      }
    }

    if (window.Paddle && productId) {
      window.Paddle.Checkout.open({
        product: productId,
        email: user.email,
        allowQuantityChange: false,
        frameTarget: 'checkout-container', // This will embed the checkout in the div below
        frameInitialHeight: 500,
        frameStyle: 'width:100%; min-width:312px; background-color: transparent; border: none;'
      });
    }
  };

  const getPlanDetails = () => {
    switch (selectedPlan) {
      case 'payg':
        return {
          title: 'Pay-as-you-go',
          price: '$1.50',
          description: 'Per document analysis',
          features: ['No subscription required', 'Pay only when you need analysis', 'All analysis features included']
        };
      case 'pack5':
        return {
          title: 'Starter Pack',
          price: '$5.50',
          description: '5 analyses ($0.90 each)',
          features: ['Credits never expire', 'All analysis features included', 'Perfect for occasional use']
        };
      case 'pack15':
        return {
          title: 'Professional Pack',
          price: '$12.00',
          description: '15 analyses ($0.80 each)',
          features: ['Credits never expire', 'All analysis features included', 'Save 11% vs pay-as-you-go', 'Most popular choice']
        };
      case 'pack30':
        return {
          title: 'Business Pack',
          price: '$22.50',
          description: '30 analyses ($0.75 each)',
          features: ['Credits never expire', 'All analysis features included', 'Save 17% vs pay-as-you-go', 'Best value for teams']
        };
      case 'subscription':
        return {
          title: 'Monthly Subscription',
          price: '$30.00',
          description: '50 analyses per month ($0.60 each)',
          features: ['Best value for high usage', 'Cancel anytime', 'Recurring monthly billing', 'Priority support']
        };
      default:
        return {
          title: 'Select a Plan',
          price: '',
          description: 'Please select a valid plan',
          features: []
        };
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;
  }

  const planDetails = getPlanDetails();

  return (
    <>
      <Head>
        <title>Checkout - LegalHelper</title>
        <meta name="description" content="Complete your purchase for LegalHelper legal document analysis services" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
              </svg>
              LegalHelper
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
            <p className="text-gray-600 mt-2">Secure checkout powered by Paddle</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900">{planDetails.title}</h3>
                <p className="text-2xl font-bold text-blue-600">{planDetails.price}</p>
                <p className="text-gray-600">{planDetails.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">What's included:</h4>
                <ul className="space-y-1">
                  {planDetails.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Total</p>
                  <p>{planDetails.price}</p>
                </div>
                <p className="text-sm text-gray-500">All prices are in USD</p>
              </div>
            </div>

            {/* Checkout */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment</h2>
              
              {!paddleLoaded ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading payment system...</p>
                </div>
              ) : isProcessing ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Processing your purchase...</p>
                </div>
              ) : !selectedPlan ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No plan selected. Please go back to pricing and select a plan.</p>
                  <Link href="/pricing" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                    Go to Pricing
                  </Link>
                </div>
              ) : (
                <div>
                  <button
                    onClick={initiatePaddleCheckout}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Complete Purchase with Paddle
                  </button>
                  
                  <div id="checkout-container" className="mt-6 min-h-[400px]">
                    {/* Paddle checkout will be embedded here */}
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Secure checkout powered by Paddle<br/>
                  We don't store your payment information
                </p>
              </div>
            </div>
          </div>

          {/* Back to Pricing */}
          <div className="text-center mt-8">
            <Link href="/pricing" className="text-blue-600 hover:text-blue-800">
              ← Back to Pricing Plans
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 