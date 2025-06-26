import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

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

    const userIdString = Array.isArray(user_id) ? user_id[0] : user_id;
    console.log('Checking credits for user_id:', userIdString);

    // If this is the admin user, return unlimited credits immediately
    if (userIdString === ADMIN_USER_ID) {
      console.log('Admin user detected, returning unlimited credits');
      return res.status(200).json({
        has_credits: true,
        subscription_tier: 'admin',
        credits_remaining: 999999,
        can_analyze: true
      });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userIdString)
      .single();

    if (profileError || !profile) {
      console.log('User profile not found, attempting to create:', user_id);
      
      // Try to get user info from auth.users table
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userIdString);
      
      if (authError || !authUser.user) {
        console.log('User not found in auth system:', user_id);
        return res.status(404).json({ 
          error: 'User not found in auth system',
          has_credits: false,
          subscription_tier: 'free',
          credits_remaining: 0,
          can_analyze: false
        });
      }

      // Create new profile for the user
      const newProfile = {
        id: userIdString,
        email: authUser.user.email || '',
        credits_remaining: 0,
        subscription_tier: 'free',
        subscription_status: 'inactive',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user profile:', createError);
        return res.status(500).json({ 
          error: 'Failed to create user profile',
          has_credits: false,
          subscription_tier: 'free',
          credits_remaining: 0,
          can_analyze: false
        });
      }

      console.log('✅ Created new user profile:', createdProfile.id);
      
      // Use the newly created profile
      const profile = createdProfile;
      
      return res.status(200).json({
        has_credits: false,
        subscription_tier: 'free',
        credits_remaining: 0,
        can_analyze: false,
        profile_created: true
      });
    }

    console.log('User profile found:', { 
      id: profile.id, 
      credits_remaining: profile.credits_remaining,
      subscription_tier: profile.subscription_tier
    });

    const creditsRemaining = profile.credits_remaining || 0;
    const hasCredits = creditsRemaining > 0 || profile.subscription_tier === 'subscription';

    return res.status(200).json({
      has_credits: hasCredits,
      subscription_tier: profile.subscription_tier || 'free',
      credits_remaining: creditsRemaining,
      can_analyze: hasCredits
    });

  } catch (error) {
    console.error('Error checking credits:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      has_credits: false,
      subscription_tier: 'free',
      credits_remaining: 0,
      can_analyze: false
    });
  }
} 