# IGDB API Setup Guide

## Getting IGDB API Credentials

1. **Create a Twitch Developer Account**
   - Go to [https://dev.twitch.tv/](https://dev.twitch.tv/)
   - Sign in with your Twitch account or create one

2. **Register Your Application**
   - Go to the [Twitch Developer Console](https://dev.twitch.tv/console)
   - Click "Register Your Application"
   - Fill in the required fields:
     - Name: Your app name (e.g., "GameHub Dashboard")
     - OAuth Redirect URLs: `http://localhost:8080` (for development)
     - Category: Choose appropriate category

3. **Get Your Credentials**
   - After registration, click "Manage" on your application
   - Copy the **Client ID**
   - Generate a **Client Secret**

4. **Get Access Token**
   - Make a POST request to get an access token:
   ```bash
   curl -X POST 'https://id.twitch.tv/oauth2/token' \
   -H 'Content-Type: application/x-www-form-urlencoded' \
   -d 'client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&grant_type=client_credentials'
   ```

5. **Update Environment Variables**
   - Open `.env` file in your project root
   - Replace the placeholder values:
   ```
   VITE_IGDB_CLIENT_ID=your_actual_client_id
   VITE_IGDB_ACCESS_TOKEN=your_actual_access_token
   ```

## CORS Issues

The IGDB API doesn't support CORS for browser requests. This implementation uses a CORS proxy for development. For production, you should:

1. Create a backend API that proxies requests to IGDB
2. Or use a serverless function (Vercel, Netlify Functions, etc.)

## Alternative: Use Mock Data

If you don't want to set up IGDB API immediately, the app will automatically fall back to mock data when credentials are not provided.