import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    console.log('Creating profile for user_id:', user_id);
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .single();
    
    if (existingProfile) {
      return res.status(200).json({ 
        success: true, 
        message: 'Profile already exists',
        profile_id: existingProfile.id 
      });
    }
    
    // Get user info from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user_id);
    
    if (authError || !authUser.user) {
      console.error('User not found in auth system:', authError);
      return res.status(404).json({ error: 'User not found in auth system' });
    }
    
    // Create the profile
    const newProfile = {
      id: user_id,
      email: authUser.user.email || '',
      credits_remaining: 0,
      subscription_tier: 'free',
      subscription_status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();
    
    if (createError) {
      console.error('Failed to create profile:', createError);
      return res.status(500).json({ 
        error: 'Failed to create profile', 
        details: createError.message 
      });
    }
    
    console.log('✅ Successfully created profile:', createdProfile);
    
    return res.status(200).json({
      success: true,
      message: 'Profile created successfully',
      profile: {
        id: createdProfile.id,
        email: createdProfile.email,
        credits_remaining: createdProfile.credits_remaining,
        subscription_tier: createdProfile.subscription_tier
      }
    });
    
  } catch (error) {
    console.error('Error creating profile:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 