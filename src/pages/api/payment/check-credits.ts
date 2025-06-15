import { NextApiRequest, NextApiResponse } from 'next';

// Admin emails that get unlimited credits
const ADMIN_EMAILS = ['g0mzinaldo@yandex.ru'];
const ADMIN_USER_ID = '971b8cd0-8eb3-4f9b-94b0-34175c432baa';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('check-credits endpoint called', req.query);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id parameter' });
    }

    console.log('Checking credits for user_id:', user_id);

    // If this is the admin user, return unlimited credits immediately
    if (user_id === ADMIN_USER_ID) {
      console.log('Admin user detected, returning unlimited credits');
      return res.status(200).json({
        has_credits: true,
        subscription_tier: 'admin',
        credits_remaining: 999999,
        can_analyze: true
      });
    }

    // For non-admin users, you can add regular Supabase logic here later
    // For now, just return a default response
    console.log('Non-admin user, returning default response');
    return res.status(200).json({
      has_credits: true,
      subscription_tier: 'free',
      credits_remaining: 1,
      can_analyze: true
    });

  } catch (error) {
    console.error('Error checking credits:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 