import { NextApiRequest, NextApiResponse } from 'next';

// Admin emails that get unlimited credits
const ADMIN_EMAILS = ['g0mzinaldo@yandex.ru'];
const ADMIN_USER_ID = '971b8cd0-8eb3-4f9b-94b0-34175c432baa';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, document_id } = req.body;

    if (!user_id || !document_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Use credit called for user_id:', user_id);

    // If this is the admin user, return success without deducting credits
    if (user_id === ADMIN_USER_ID) {
      console.log('Admin user detected, allowing unlimited usage');
      return res.status(200).json({
        success: true,
        credits_used: 0,
        credits_remaining: 999999
      });
    }

    // For non-admin users, you can add regular Supabase logic here later
    // For now, just return success (you can implement proper credit logic later)
    console.log('Non-admin user, allowing usage for now');
    return res.status(200).json({
      success: true,
      credits_used: 1,
      credits_remaining: 0
    });

  } catch (error) {
    console.error('Error using credit:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 