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
    // Load Paddle SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/paddle.js';
    script.async = true;
    script.onload = () => {
      // Initialize Paddle
      try {
      if (window.Paddle) {
          const vendorId = process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID;
          const vendorIdInt = parseInt(vendorId || '12345', 10);
          
          // Validate vendor ID
          if (isNaN(vendorIdInt) || vendorIdInt <= 0) {
            console.error('Invalid Paddle vendor ID:', vendorId);
            setError('Invalid payment configuration');
            return;
          }
          
        window.Paddle.Setup({
            vendor: vendorIdInt, // Ensure it's an integer
          debug: process.env.NODE_ENV !== 'production',
        });
        setIsLoaded(true);
      }
      } catch (err) {
        console.error('Error initializing Paddle:', err);
        setError('Failed to initialize payment system');
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load Paddle script');
      setError('Failed to load payment system');
    };
    
    document.body.appendChild(script);

    // Cleanup
    return () => {
      // Only remove the script if it's still in the document
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Function to open Paddle checkout
  const openCheckout = (options: PaddleCheckoutOptions) => {
    if (error) {
      console.error('Cannot open checkout due to initialization error:', error);
      return;
    }
    
    if (isLoaded && window.Paddle) {
      window.Paddle.Checkout.open(options);
    } else {
      console.error('Paddle is not loaded yet');
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