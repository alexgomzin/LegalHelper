import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = new Date().toISOString();
  
  res.status(200).json({
    success: true,
    message: 'Vercel API routing is working!',
    timestamp,
    environment: process.env.NODE_ENV,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    openAIKeyPrefix: process.env.OPENAI_API_KEY ? 
      process.env.OPENAI_API_KEY.substring(0, 7) + '...' : 
      'Not configured'
  });
} 