import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const paddleConfig = {
    vendorId: process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID,
    environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
    products: {
      payPerDocument: process.env.NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT,
      pack5: process.env.NEXT_PUBLIC_PADDLE_5_PACK,
      pack15: process.env.NEXT_PUBLIC_PADDLE_15_PACK,
      pack30: process.env.NEXT_PUBLIC_PADDLE_30_PACK,
      subscription: process.env.NEXT_PUBLIC_PADDLE_SUBSCRIPTION,
    }
  };

  // Validate required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_PADDLE_VENDOR_ID',
    'NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT',
    'NEXT_PUBLIC_PADDLE_5_PACK',
    'NEXT_PUBLIC_PADDLE_15_PACK',
    'NEXT_PUBLIC_PADDLE_30_PACK',
    'NEXT_PUBLIC_PADDLE_SUBSCRIPTION'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  const hasAllVars = missingVars.length === 0;

  return res.status(200).json({
    success: hasAllVars,
    message: hasAllVars ? 'Paddle configuration loaded successfully' : 'Missing required environment variables',
    config: paddleConfig,
    validation: {
      hasAllRequiredVars: hasAllVars,
      missingVars: missingVars,
      totalVars: requiredVars.length,
      presentVars: requiredVars.length - missingVars.length
    },
    recommendations: hasAllVars ? [] : [
      'Check your Render environment variables',
      'Ensure all NEXT_PUBLIC_PADDLE_* variables are set',
      'Verify product IDs match your Paddle dashboard'
    ],
    timestamp: new Date().toISOString()
  });
} 