# Render Deployment Guide

## Project Status
✅ Your project is ready for Render deployment! The `render.yaml` file is properly configured.

## Required Environment Variables

You'll need to set up these environment variables in Render:

### 1. Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key  
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 2. OpenAI API
- `OPENAI_API_KEY`: Your OpenAI API key for document analysis

### 3. Paddle Payment Integration
- `NEXT_PUBLIC_PADDLE_VENDOR_ID`: Your Paddle vendor ID (integer)
- `NEXT_PUBLIC_PADDLE_ENVIRONMENT`: Set to `sandbox` or `production`
- `NEXT_PUBLIC_PADDLE_PAY_PER_DOCUMENT`: Pay-per-document product ID
- `NEXT_PUBLIC_PADDLE_5_PACK`: 5-pack product ID
- `NEXT_PUBLIC_PADDLE_15_PACK`: 15-pack product ID  
- `NEXT_PUBLIC_PADDLE_30_PACK`: 30-pack product ID
- `NEXT_PUBLIC_PADDLE_SUBSCRIPTION`: Subscription plan ID

### 4. Node Environment
- `NODE_ENV`: Set to `production`

## Admin User Configuration
- Admin Email: `g0mzinaldo@yandex.ru`
- Admin ID: `971b8cd0-8eb3-4f9b-94b0-34175c432baa`
- The app is configured to give unlimited credits to this admin user

## Next Steps for Deployment

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up or log in to your account

### 2. Deploy from GitHub
- Connect your GitHub repository to Render
- Render will automatically detect the `render.yaml` file

### 3. Set Environment Variables
Instead of using databases as specified in `render.yaml`, you can set these as regular environment variables:
- Go to your service settings in Render
- Add each environment variable manually
- Or use Render's environment groups for better organization

### 4. Configure Databases (Alternative)
If you prefer to use Render's database feature as configured in `render.yaml`:
- Create environment groups in Render for each database reference
- Add the actual values there

### 5. Monitor Deployment
- Watch the build logs
- The health check endpoint `/api/test-deployment` will verify the deployment
- Your app will be available at `https://your-app-name.onrender.com`

## Key Features Configured
- ✅ Health check endpoint
- ✅ Proper build and start commands
- ✅ Environment variable configuration
- ✅ Admin user with unlimited credits
- ✅ Payment integration ready
- ✅ Document analysis API endpoints

## Troubleshooting
- If build fails, check the environment variables are set correctly
- Make sure all required API keys are valid
- Check Render build logs for specific error messages
- The health check at `/api/test-deployment` should return success 