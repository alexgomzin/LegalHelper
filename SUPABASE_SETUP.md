# Setting up Supabase Authentication

This document provides step-by-step instructions for setting up real authentication with Supabase for the Legal Helper application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up or log in
2. Create a new project from the dashboard
3. Choose a name for your project and set a secure database password
4. Select a region closest to your users
5. Wait for your project to be created (this may take a few minutes)

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to Project Settings > API
2. Copy the URL under "Project URL" - this is your `NEXT_PUBLIC_SUPABASE_URL`
3. Copy the "anon" key - this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Set Up Environment Variables

1. Copy the `.env.local.example` file to `.env.local`:
   ```
   cp .env.local.example .env.local
   ```
2. Edit `.env.local` and paste your Supabase URL and anon key values

## 4. Configure Authentication Settings

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure Site URL to match your application's URL (e.g., `http://localhost:3000` for local development)
3. Enable the Email provider under Authentication > Providers > Email
4. Customize email templates if needed under Authentication > Email Templates

## 5. Set Up the Database

1. Go to the SQL Editor in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/profiles.sql`
4. Run the query to create the profiles table and related functions

## 6. Testing Authentication

1. Run your application using `npm run dev`
2. Try to register a new user via the registration form
3. Verify that the user appears in the Supabase Authentication dashboard
4. Verify that a corresponding entry was created in the profiles table

## 7. Additional Configuration Options

### Email Confirmation

By default, Supabase requires email confirmation. If you want to change this:

1. Go to Authentication > Settings
2. Under Email Auth, toggle "Enable email confirmations" off if you don't want to require email confirmation

### Password Reset

The password reset flow is already implemented in the application, but you may want to customize the email templates:

1. Go to Authentication > Email Templates
2. Customize the "Reset Password" template

### Social Login Providers

To enable login with social providers like Google, GitHub, etc.:

1. Go to Authentication > Providers
2. Choose the provider you want to enable
3. Follow the instructions to set up the required credentials
4. Update the login component to include buttons for the enabled providers

## Troubleshooting

- If users can't sign up or sign in, check the browser console for errors
- Verify your environment variables are correctly set
- Check the Supabase dashboard for any authentication errors
- Ensure your database tables and RLS policies are correctly configured

For more information, refer to the [Supabase Authentication documentation](https://supabase.com/docs/guides/auth) 