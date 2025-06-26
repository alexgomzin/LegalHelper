import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('=== DEBUG CONNECTION ===');
    
    // Check environment variables
    const envCheck = {
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      service_key_preview: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
    };
    
    console.log('Environment:', envCheck);
    
    // Test basic query - list all tables
    try {
      const { data: tables, error: tablesError } = await supabase
        .rpc('exec_sql', { sql: 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'' });
      
      console.log('Tables query result:', { tables, error: tablesError });
    } catch (tablesErr) {
      console.log('Tables query failed:', tablesErr);
    }
    
    // Test profiles table existence and permissions
    const tests = [];
    
    // Test 1: Simple select
    try {
      const { data: profiles1, error: error1 } = await supabase
        .from('profiles')
        .select('count');
      
      tests.push({
        test: 'profiles_count',
        success: !error1,
        error: error1?.message,
        data: profiles1
      });
    } catch (err) {
      tests.push({
        test: 'profiles_count',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
    
    // Test 2: Select with no filters
    try {
      const { data: profiles2, error: error2 } = await supabase
        .from('profiles')
        .select('*');
      
      tests.push({
        test: 'profiles_select_all',
        success: !error2,
        error: error2?.message,
        data: profiles2?.length ? `Found ${profiles2.length} profiles` : 'No profiles found'
      });
    } catch (err) {
      tests.push({
        test: 'profiles_select_all',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
    
    // Test 3: Raw SQL query
    try {
      const { data: rawQuery, error: rawError } = await supabase
        .rpc('exec_sql', { sql: 'SELECT id, email, credits_remaining FROM public.profiles LIMIT 5' });
      
      tests.push({
        test: 'raw_sql_profiles',
        success: !rawError,
        error: rawError?.message,
        data: rawQuery
      });
    } catch (err) {
      tests.push({
        test: 'raw_sql_profiles',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
    
    // Test 4: Check auth.users table
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      tests.push({
        test: 'auth_users',
        success: !authError,
        error: authError?.message,
        data: authUsers?.users?.length ? `Found ${authUsers.users.length} auth users` : 'No auth users'
      });
    } catch (err) {
      tests.push({
        test: 'auth_users',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
    
    return res.status(200).json({
      environment: envCheck,
      tests: tests,
      summary: {
        total_tests: tests.length,
        passed: tests.filter(t => t.success).length,
        failed: tests.filter(t => !t.success).length
      }
    });
    
  } catch (error) {
    console.error('Debug connection error:', error);
    return res.status(500).json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 