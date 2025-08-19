# Email Notification Setup

This document explains how the email notification system works when users request games in the GameHub application.

## Overview

When a user requests a game, the system automatically sends an email notification to the admin (you) with the game request details.

## Email Service Configuration

The application uses **EmailJS** to send email notifications. The configuration is stored in the `.env` file:

```env
VITE_EMAILJS_SERVICE_ID=pixelpilgrim-service
VITE_EMAILJS_TEMPLATE_ID=template_game_request  
VITE_EMAILJS_PUBLIC_KEY=meXmdsep-Hf_vqEqa
VITE_ADMIN_EMAIL=vedantvyas79@gmail.com
```

## How It Works

1. **User Authentication**: Users must be logged in to submit game requests
2. **Game Selection**: Users can browse and select games from Twitch's top games
3. **Request Submission**: When a user clicks "Request Game", they can add an optional message
4. **Email Notification**: The system automatically sends an email to `vedantvyas79@gmail.com` with:
   - User information (name and email)
   - Game details (name, cover image, genres if available)
   - Optional user message
   - Request timestamp

## Email Template

The email includes the following information:
- **From**: User's name and email
- **Game Name**: The requested game
- **Game Genres**: If available from the game data
- **Game Rating**: If available from the game data  
- **Game Cover**: URL to the game's cover image
- **User Message**: Any additional information provided by the user
- **Request Date**: When the request was submitted

## Files Modified

- `src/components/dashboard/GameRequestModal.tsx` - Updated to send emails
- `src/services/gameRequestService.ts` - New service to handle game requests
- `src/services/emailService.ts` - Existing EmailJS integration (updated to use env vars)
- `.env` - Added EmailJS configuration variables

## Testing

To test the email functionality:

1. Start the development server: `npm run dev`
2. Navigate to the application in your browser
3. Log in with your credentials
4. Browse games and click "Request" on any game
5. Fill out the request form and submit
6. Check your email at `vedantvyas79@gmail.com` for the notification

## EmailJS Template

Make sure your EmailJS template (`template_game_request`) includes the following variables:
- `{{to_email}}`
- `{{from_name}}`
- `{{from_email}}`
- `{{game_name}}`
- `{{game_genres}}`
- `{{game_rating}}`
- `{{game_cover}}`
- `{{user_message}}`
- `{{request_date}}`

## Troubleshooting

If emails are not being sent:
1. Check EmailJS service status
2. Verify the service ID, template ID, and public key in `.env`
3. Ensure the EmailJS template exists and is published
4. Check browser console for any error messages
5. Verify internet connection and that EmailJS quotas haven't been exceeded
