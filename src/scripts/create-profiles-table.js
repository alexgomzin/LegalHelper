// Run this script with your Supabase service role key to set up the profiles table
// Usage: node src/scripts/create-profiles-table.js

const { createClient } = require('@supabase/supabase-js')

// Replace with your Supabase URL and service role key
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createProfilesTable() {
  try {
    // Check if the profiles table already exists
    const { data: existingTables, error: tableCheckError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'profiles')

    if (tableCheckError) {
      console.error('Error checking if profiles table exists:', tableCheckError)
      return
    }

    if (existingTables && existingTables.length > 0) {
      console.log('Profiles table already exists')
      return
    }

    // Create the profiles table
    const { error: createTableError } = await supabase.rpc('create_profiles_table', {
      // This calls a Postgres function to create the table
      // You'll need to create this function in the Supabase SQL Editor
    })

    if (createTableError) {
      console.error('Error creating profiles table:', createTableError)
      return
    }

    console.log('Profiles table created successfully')

    // Create a policy to allow users to read their own profiles
    const { error: policyError } = await supabase.rpc('create_profile_policies')

    if (policyError) {
      console.error('Error creating profile policies:', policyError)
      return
    }

    console.log('Profile policies created successfully')
  } catch (error) {
    console.error('Error setting up profiles table:', error)
  }
}

// Run the function
createProfilesTable()
  .then(() => {
    console.log('Setup completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Setup failed:', error)
    process.exit(1)
  }) 