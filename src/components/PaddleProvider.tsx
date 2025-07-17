'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define type for Paddle context
interface PaddleContextType {
  isLoaded: boolean;
  openCheckout: (options: PaddleCheckoutOptions) => void;
  error?: string;
}

// Define type for Paddle checkout options
interface PaddleCheckoutOptions {
  product?: string;
  title?: string;
  message?: string;
  email?: string;
  successCallback?: (data: any) => void;
  closeCallback?: () => void;
}

// Create context with default values
const PaddleContext = createContext<PaddleContextType>({
  isLoaded: false,
  openCheckout: () => {},
});

// Hook to use Paddle context
export const usePaddle = () => useContext(PaddleContext);

// PaddleProvider component
export function PaddleProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    // For Paddle Billing, we don't need to load any SDK
    // We'll use direct API calls and redirect to checkout URLs
    setIsLoaded(true);
  }, []);

  // Function to open Paddle checkout using Paddle Billing
  const openCheckout = async (options: PaddleCheckoutOptions) => {
    if (error) {
      console.error('Cannot open checkout due to initialization error:', error);
      return;
    }
    
    try {
      console.log('Creating Paddle Billing checkout for price:', options.product);
      
      // Create checkout via hosted checkout API
      const response = await fetch('/api/payment/create-hosted-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: options.product,
          customerEmail: options.email,
          successUrl: `${window.location.origin}/dashboard?purchase=success`,
          cancelUrl: window.location.href
        }),
      });

      const data = await response.json();
      
      if (data.success && data.checkoutUrl) {
        console.log('Opening Paddle Billing checkout:', data.checkoutUrl);
        
        // Redirect to Paddle Billing checkout
        window.location.href = data.checkoutUrl;
      } else {
        console.error('Failed to create checkout:', data);
        alert(`Failed to create checkout: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      alert('Error creating checkout. Please try again or contact support.');
    }
  };

  return (
    <PaddleContext.Provider value={{ isLoaded, openCheckout, error }}>
      {children}
    </PaddleContext.Provider>
  );
}

// Declare Paddle type for TypeScript
declare global {
  interface Window {
    Paddle?: any;
  }
} 