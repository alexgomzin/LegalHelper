import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ 
    success: true, 
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    method: req.method,
    env: process.env.NODE_ENV
  });
} 