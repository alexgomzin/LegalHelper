import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id parameter' });
    }

    // Get the user data from profiles table
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found', userError });
    }

    // Admin emails for comparison
    const ADMIN_EMAILS = ['g0mzinaldo@yandex.ru'];

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits_remaining: user.credits_remaining,
        subscription_tier: user.subscription_tier,
        subscription_status: user.subscription_status
      },
      adminCheck: {
        adminEmails: ADMIN_EMAILS,
        isEmailMatch: ADMIN_EMAILS.includes(user.email),
        exactEmailComparison: user.email === 'g0mzinaldo@yandex.ru',
        emailLength: user.email ? user.email.length : 0,
        adminEmailLength: 'g0mzinaldo@yandex.ru'.length
      }
    });
  } catch (error) {
    console.error('Debug user error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
  }
} 