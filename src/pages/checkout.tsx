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
      
      // Debug logging
      console.log('=== CHECKOUT DEBUG ===');
      console.log('Router query:', router.query);
      console.log('Plan from URL:', plan);
      console.log('Product from URL:', product);
      console.log('Direct priceId from URL:', queryPriceId);
      
      // Map plan to price ID using environment variables
      const planToPriceId: { [key: string]: string } = {
        'payg': process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT || '',
        'pack5': process.env.NEXT_PUBLIC_PADDLE_5_PACK || '',
        'pack15': process.env.NEXT_PUBLIC_PADDLE_15_PACK || '',
        'pack30': process.env.NEXT_PUBLIC_PADDLE_30_PACK || '',
        'subscription': process.env.NEXT_PUBLIC_PADDLE_SUBSCRIPTION || ''
      };
      
      console.log('Environment variables:', {
        PADDLE_PAY_PER_DOCUMENT: process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT,
        PADDLE_5_PACK: process.env.NEXT_PUBLIC_PADDLE_5_PACK,
        PADDLE_15_PACK: process.env.NEXT_PUBLIC_PADDLE_15_PACK,
        PADDLE_30_PACK: process.env.NEXT_PUBLIC_PADDLE_30_PACK,
        PADDLE_SUBSCRIPTION: process.env.NEXT_PUBLIC_PADDLE_SUBSCRIPTION
      });
      console.log('Plan to Price ID mapping:', planToPriceId);
      
      if (plan) {
        setSelectedPlan(plan as string);
        
        if (planToPriceId[plan as string]) {
          const mappedPriceId = planToPriceId[plan as string];
          setPriceId(mappedPriceId);
          console.log('Mapped plan to price ID:', plan, '->', mappedPriceId);
        } else {
          console.log('No mapping found for plan:', plan);
        }
      }
      
      if (product) setSelectedProduct(product as string);
      if (queryPriceId) {
        setPriceId(queryPriceId as string); // Direct price ID overrides plan mapping
        console.log('Using direct price ID from URL:', queryPriceId);
      }
      if (queryEmail) setEmail(queryEmail as string);
      if (success) setSuccessUrl(success as string);
      if (cancel) setCancelUrl(cancel as string);
      
      console.log('Final state:', {
        selectedPlan: plan,
        selectedProduct: product,
        priceId: queryPriceId || (plan ? planToPriceId[plan as string] : ''),
        email: queryEmail
      });
      console.log('=== END DEBUG ===');
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
    console.log('Starting Paddle.js loading process...');
    
    // Check if Paddle is already loaded
    if (window.Paddle) {
      console.log('Paddle already loaded');
      setPaddleLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Paddle script loaded, checking window.Paddle...');
      
      // Wait a bit for Paddle to initialize
      setTimeout(() => {
        if (window.Paddle) {
          const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
          const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
          
          console.log('Initializing Paddle with:', { environment, hasClientToken: !!clientToken });
          
          if (!clientToken) {
            console.error('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not configured');
            setCheckoutError('Payment system configuration error. Please contact support.');
            return;
          }
          
          try {
            // Set environment first for sandbox
            if (environment === 'sandbox') {
              window.Paddle.Environment.set('sandbox');
            }
            
            // Initialize Paddle with the correct parameters for Paddle Billing
            const initConfig: any = {
              token: clientToken,
              eventCallback: function(data: any) {
                console.log('Paddle event:', data);
                
                if (data.name === 'checkout.completed') {
                  setIsProcessing(true);
                  handleSuccessfulPurchase(data);
                }
                
                if (data.name === 'checkout.error') {
                  console.error('Paddle checkout error event:', data);
                  setCheckoutError(`Checkout Error: ${data.error?.message || 'Unknown checkout error'}`);
                }
                
                if (data.name === 'checkout.warning') {
                  console.warn('Paddle checkout warning:', data);
                }
              }
            };

            // Add vendor ID if available (required for some Paddle configurations)
            if (process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID) {
              initConfig.vendor = process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID;
            }

            window.Paddle.Initialize(initConfig);
            console.log('Paddle initialized successfully');
            setPaddleLoaded(true);
          } catch (error) {
            console.error('Failed to initialize Paddle:', error);
            setCheckoutError('Failed to initialize payment system. Please refresh the page.');
          }
        } else {
          console.error('Paddle SDK still not available after script load');
          // Try one more time after a longer delay
          setTimeout(() => {
            if (window.Paddle) {
              console.log('Paddle finally loaded after delay');
              setPaddleLoaded(true);
            } else {
              console.error('Paddle SDK never loaded - possible network issue or CDN blocked');
              setCheckoutError('Payment system failed to load. Please check your internet connection and refresh the page.');
            }
          }, 1000);
        }
      }, 100); // Wait 100ms for Paddle to be available
    };
    
    script.onerror = () => {
      console.error('Failed to load Paddle script from CDN - network error or CDN blocked');
      setCheckoutError('Failed to load payment system. Please check your connection and refresh.');
    };
    
    console.log('Adding Paddle script to document...');
    document.head.appendChild(script); // Try head instead of body

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleSuccessfulPurchase = async (data: any) => {
    try {
      console.log('=== HANDLING SUCCESSFUL PURCHASE ===');
      console.log('Purchase data received:', data);
      console.log('Current priceId:', priceId);
      console.log('Current user:', user?.id);
      
      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkout_id: data.data?.transaction_id || data.checkout?.id || `checkout-${Date.now()}`,
          user_id: user?.id,
          product_id: priceId, // Use the current priceId
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

  const initiatePaddleCheckout = async () => {
    console.log('=== INITIATE PADDLE CHECKOUT CALLED ===');
    console.log('priceId:', priceId);
    console.log('email:', email);
    console.log('user?.email:', user?.email);
    console.log('user?.id:', user?.id);
    
    if (!priceId) {
      console.log('ERROR: No price selected');
      setCheckoutError('No price selected. Please return to pricing page.');
      return;
    }

    // Validate price ID format
    if (!priceId.startsWith('pri_')) {
      console.log('ERROR: Invalid price ID format:', priceId);
      setCheckoutError('Invalid price ID format. Please contact support.');
      console.error('Invalid price ID:', priceId);
      return;
    }

    // Ensure we have a valid customer email
    const customerEmail = email || user?.email;
    if (!customerEmail) {
      console.log('ERROR: No customer email available');
      setCheckoutError('No customer email available. Please login or provide email.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      console.log('ERROR: Invalid email format:', customerEmail);
      setCheckoutError('Invalid email format. Please check your email address.');
      return;
    }

    console.log('All validations passed, proceeding with checkout...');
    setCheckoutError('');
    setIsProcessing(true);

    try {
      // First try to use Paddle.js if available and properly loaded
      if (window.Paddle && paddleLoaded && process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
        console.log('Using Paddle.js for checkout...');
        
        try {
          // Build checkout data with proper validation
          const checkoutData: any = {
            items: [
              {
                price_id: priceId,
                quantity: 1
              }
            ],
            customer: {
              email: customerEmail
            }
          };

          // Only add custom_data if user ID exists
          if (user?.id) {
            checkoutData.custom_data = {
              user_id: user.id
            };
          }

          console.log('=== DETAILED CHECKOUT DATA ===');
          console.log('Full checkout data:', JSON.stringify(checkoutData, null, 2));
          console.log('Price ID:', priceId);
          console.log('Customer email:', customerEmail);
          console.log('User ID:', user?.id || 'NOT_PROVIDED');
          console.log('Environment:', process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT);
          console.log('Vendor ID:', process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID);
          console.log('Client Token exists:', !!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);
          console.log('=== END DETAILED CHECKOUT DATA ===');

          console.log('Opening Paddle checkout with data:', checkoutData);
          console.log('Paddle object methods:', Object.keys(window.Paddle));
          console.log('Paddle Checkout methods:', window.Paddle.Checkout ? Object.keys(window.Paddle.Checkout) : 'No Checkout object');
          
          // Use Paddle.js checkout
          const checkoutPromise = window.Paddle.Checkout.open(checkoutData);
          console.log('Paddle checkout promise:', checkoutPromise);
          
          return; // Exit here if Paddle.js works
          
        } catch (paddleError) {
          console.error('Paddle.js checkout failed:', paddleError);
          console.error('Full error details:', JSON.stringify(paddleError, null, 2));
          if (paddleError instanceof Error) {
            console.error('Error name:', paddleError.name);
            console.error('Error message:', paddleError.message);
            console.error('Error stack:', paddleError.stack);
          }
       
          // Don't return here, fall through to API approach
        }
      } else {
        if (!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
          console.log('Client token missing, using API approach directly...');
        } else {
          console.log('Paddle.js not available, using API approach...');
        }
      }

      // Fallback: Use API to create checkout URL
      console.log('Creating Paddle checkout via API...');
      const response = await fetch('/api/payment/create-paddle-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          customerEmail: customerEmail,
          userId: user?.id || null,
          successUrl: successUrl || `${window.location.origin}/dashboard?purchase=success`,
          cancelUrl: cancelUrl || `${window.location.origin}/pricing?purchase=cancelled`
        }),
      });

      console.log('API Response Status:', response.status);
      const data = await response.json();
      console.log('API Response Data:', data);

      if (data.success && data.checkoutUrl) {
        console.log('Redirecting to checkout URL:', data.checkoutUrl);
        window.location.href = data.checkoutUrl;
      } else {
        console.error('API Error:', data);
        
        // If API also fails, create a manual checkout URL for sandbox testing
        if (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'sandbox') {
          console.log('Creating manual sandbox checkout URL...');
          const sandboxUrl = `https://sandbox-checkout.paddle.com/checkout?price=${priceId}&customer_email=${encodeURIComponent(customerEmail)}&success_url=${encodeURIComponent(successUrl || `${window.location.origin}/dashboard?purchase=success`)}&cancel_url=${encodeURIComponent(cancelUrl || `${window.location.origin}/pricing?purchase=cancelled`)}`;
          console.log('Trying sandbox URL:', sandboxUrl);
          window.location.href = sandboxUrl;
        } else {
          setCheckoutError(`API Error: ${data.error || 'Failed to create checkout'}. ${data.note || ''}`);
        }
      }
    } catch (error) {
      console.error('Checkout process failed:', error);
      setCheckoutError(`Network Error: ${error instanceof Error ? error.message : 'Failed to create checkout'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPriceDetails = () => {
    // Map both price IDs and plan IDs to plan details
    const priceMap: { [key: string]: any } = {
      // Price ID mappings using environment variables
      [process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT || '']: {
        title: 'Pay-as-you-go',
        price: '$1.50',
        description: 'Per document analysis',
        features: ['No subscription required', 'Pay only when you need analysis', 'All analysis features included']
      },
      [process.env.NEXT_PUBLIC_PADDLE_5_PACK || '']: {
        title: 'Starter Pack',
        price: '$5.50',
        description: '5 analyses ($1.10 each)',
        features: ['Credits never expire', 'All analysis features included', 'Perfect for occasional use']
      },
      [process.env.NEXT_PUBLIC_PADDLE_15_PACK || '']: {
        title: 'Professional Pack',
        price: '$12.00',
        description: '15 analyses ($0.80 each)',
        features: ['Credits never expire', 'All analysis features included', 'Save 47% vs pay-as-you-go', 'Most popular choice']
      },
      [process.env.NEXT_PUBLIC_PADDLE_30_PACK || '']: {
        title: 'Business Pack',
        price: '$22.50',
        description: '30 analyses ($0.75 each)',
        features: ['Credits never expire', 'All analysis features included', 'Save 50% vs pay-as-you-go', 'Best value for teams']
      },
      [process.env.NEXT_PUBLIC_PADDLE_SUBSCRIPTION || '']: {
        title: 'Monthly Subscription',
        price: '$30.00',
        description: '50 analyses per month ($0.60 each)',
        features: ['Best value for high usage', 'Cancel anytime', 'Recurring monthly billing', 'Priority support']
      },
      // Plan ID mappings (fallback)
      'payg': {
        title: 'Pay-as-you-go',
        price: '$1.50',
        description: 'Per document analysis',
        features: ['No subscription required', 'Pay only when you need analysis', 'All analysis features included']
      },
      'pack5': {
        title: 'Starter Pack',
        price: '$5.50',
        description: '5 analyses ($1.10 each)',
        features: ['Credits never expire', 'All analysis features included', 'Perfect for occasional use']
      },
      'pack15': {
        title: 'Professional Pack',
        price: '$12.00',
        description: '15 analyses ($0.80 each)',
        features: ['Credits never expire', 'All analysis features included', 'Save 47% vs pay-as-you-go', 'Most popular choice']
      },
      'pack30': {
        title: 'Business Pack',
        price: '$22.50',
        description: '30 analyses ($0.75 each)',
        features: ['Credits never expire', 'All analysis features included', 'Save 50% vs pay-as-you-go', 'Best value for teams']
      },
      'subscription': {
        title: 'Monthly Subscription',
        price: '$30.00',
        description: '50 analyses per month ($0.60 each)',
        features: ['Best value for high usage', 'Cancel anytime', 'Recurring monthly billing', 'Priority support']
      }
    };

    // Try price ID first, then plan ID, then default
    return priceMap[priceId] || priceMap[selectedPlan] || {
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
              
              {/* Paddle Status */}
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                <p className="font-medium text-gray-700 mb-2">Payment System Status:</p>
                <div className="space-y-1 text-gray-600">
                  <p>Environment: <span className="font-mono">{process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'not set'}</span></p>
                  <p>Client Token: <span className={process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ? 'text-green-600' : 'text-red-600'}>
                    {process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ? '✓ Configured' : '✗ Missing'}
                  </span></p>
                  <p>Paddle.js: <span className={paddleLoaded ? 'text-green-600' : 'text-yellow-600'}>
                    {paddleLoaded ? '✓ Loaded' : '⏳ Loading...'}
                  </span></p>
                  <p>Fallback API: <span className="text-green-600">✓ Available</span></p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {checkoutError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <strong>Error:</strong> {checkoutError}
                <button 
                  onClick={() => {
                    console.log('=== MANUAL DEBUG CHECK ===');
                    console.log('window.Paddle:', window.Paddle);
                    console.log('typeof window.Paddle:', typeof window.Paddle);
                    console.log('window.Paddle keys:', window.Paddle ? Object.keys(window.Paddle) : 'N/A');
                    console.log('Environment variables:', {
                      environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
                      clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
                      priceId: priceId
                    });
                    console.log('Script tags in document:', Array.from(document.querySelectorAll('script')).map(s => s.src).filter(src => src.includes('paddle')));
                    
                    // Try to manually load Paddle if it's not there
                    if (!window.Paddle) {
                      console.log('Attempting manual Paddle load...');
                      const script = document.createElement('script');
                      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
                      script.onload = () => {
                        console.log('Manual script loaded, window.Paddle:', window.Paddle);
                        if (window.Paddle) {
                          setPaddleLoaded(true);
                          setCheckoutError('');
                        }
                      };
                      document.head.appendChild(script);
                    } else {
                      console.log('Paddle exists, clearing error');
                      setPaddleLoaded(true);
                      setCheckoutError('');
                    }
                  }}
                  className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Debug & Retry
                </button>
              </div>
            )}

            {/* Checkout Button */}
            <div className="text-center">
                          <button
                onClick={() => {
                  console.log('=== CHECKOUT BUTTON CLICKED ===');
                  console.log('Current state:', {
                    priceId,
                    customerEmail,
                    paddleLoaded,
                    isProcessing,
                    checkoutError
                  });
                  initiatePaddleCheckout();
                }}
              disabled={isProcessing || !priceId || !customerEmail}
              className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Proceed to Payment'}
            </button>
            
            <p className="text-sm text-gray-500 mt-2">
              {!paddleLoaded && !checkoutError && 'Loading payment system...'}
              {!priceId && 'Missing price information'}
              {!customerEmail && 'Missing customer email'}
                {paddleLoaded && priceId && customerEmail && !isProcessing && 'Ready to proceed'}
                {isProcessing && 'Initiating checkout...'}
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