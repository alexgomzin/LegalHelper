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

  const diagnostics = {
    message: "Paddle Product vs Price ID Analysis",
    currentIDs: paddleConfig.products,
    idAnalysis: Object.entries(paddleConfig.products).map(([key, id]) => ({
      product: key,
      id: id,
      type: id?.startsWith('pro_') ? 'Product ID' : id?.startsWith('pri_') ? 'Price ID' : 'Unknown',
      recommendation: id?.startsWith('pro_') ? 'Try using Price ID instead (pri_...)' : 'Looks correct'
    })),
    instructions: [
      "1. In Paddle Dashboard, go to Catalog → Products",
      "2. Click on each product to see its details",
      "3. Look for Price section - copy the Price ID (starts with pri_)",
      "4. Price IDs are usually what you need for checkout, not Product IDs",
      "5. Update your environment variables to use Price IDs"
    ],
    troubleshooting: {
      "400 Error": "Usually means invalid product/price ID",
      "Product vs Price": "Paddle Billing typically requires Price IDs for checkout",
      "Check Format": "Product IDs start with 'pro_', Price IDs start with 'pri_'"
    }
  };

  return res.status(200).json({
    success: true,
    ...diagnostics,
    timestamp: new Date().toISOString()
  });
} 