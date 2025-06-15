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

  return res.status(200).json({
    success: true,
    message: 'Paddle configuration loaded',
    config: paddleConfig,
    timestamp: new Date().toISOString()
  });
} 