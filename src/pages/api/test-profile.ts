import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Testing profile access...');
    
    // Test basic connection
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, credits_remaining')
      .limit(5);
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Database error',
        details: error.message,
        code: error.code
      });
    }
    
    console.log('Found profiles:', profiles);
    
    // Test specific user
    const { data: specificProfile, error: specificError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', '3073b241-361d-428b-b001-1408f44c3ae8')
      .single();
    
    return res.status(200).json({
      success: true,
      total_profiles: profiles?.length || 0,
      all_profiles: profiles,
      specific_user: {
        found: !!specificProfile,
        data: specificProfile,
        error: specificError?.message
      },
      environment_check: {
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabase_url_preview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
      }
    });
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'API error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 