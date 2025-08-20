import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

// Admin emails that get unlimited credits
const ADMIN_EMAILS = ['g0mzinaldo@yandex.ru'];

// Admin user ID that gets unlimited credits
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

    console.log('Use credit called for user_id:', user_id, 'document_id:', document_id);

    // If this is the admin user, return success without deducting credits
    if (user_id === ADMIN_USER_ID) {
      console.log('Admin user detected, allowing unlimited usage');
      return res.status(200).json({
        success: true,
        credits_used: 0,
        credits_remaining: 999999
      });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      console.log('User profile not found:', user_id);
      return res.status(404).json({ 
        error: 'User profile not found' 
      });
    }

    console.log('Current user profile:', { 
      id: profile.id, 
      credits_remaining: profile.credits_remaining,
      subscription_tier: profile.subscription_tier
    });

    // Check if user has credits or subscription
    const creditsRemaining = profile.credits_remaining || 0;
    const hasSubscription = profile.subscription_tier === 'subscription';

    if (!hasSubscription && creditsRemaining <= 0) {
      console.log('User has no credits remaining');
      return res.status(400).json({ 
        error: 'No credits remaining',
        credits_remaining: 0
      });
    }

    // For subscription users, don't deduct credits
    if (hasSubscription) {
      console.log('Subscription user, not deducting credits');
      return res.status(200).json({
        success: true,
        credits_used: 0,
        credits_remaining: creditsRemaining
      });
    }

    // Deduct one credit for pay-per-use users
    const newCreditsRemaining = creditsRemaining - 1;
    
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        credits_remaining: newCreditsRemaining,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update credits' 
      });
    }

    console.log('Credit deducted successfully. New balance:', newCreditsRemaining);

    // Log the credit usage
    try {
      await supabaseAdmin.from('document_usages').insert({
        user_id,
        document_id,
        credits_used: 1,
        created_at: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Error logging credit usage:', logError);
      // Don't fail the request if logging fails
    }

    return res.status(200).json({
      success: true,
      credits_used: 1,
      credits_remaining: newCreditsRemaining
    });

  } catch (error) {
    console.error('Error using credit:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 