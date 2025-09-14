# Pixel Pilgrim - Gaming Social Platform

A modern gaming social platform built with React, TypeScript, and Firebase.

## Features

- 🎮 Game tracking and library management
- 👥 Social gaming community
- 💳 Razorpay payment integration
- 🔥 Firebase authentication and database
- 📱 Responsive design
- 🎨 Dark/Light theme support

## Deployment on Vercel

### Prerequisites

1. Create accounts on:
   - [Vercel](https://vercel.com)
   - [Firebase](https://firebase.google.com)
   - [IGDB](https://api.igdb.com)
   - [Razorpay](https://razorpay.com)

### Environment Variables

Set these in your Vercel dashboard:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_IGDB_CLIENT_ID=your_igdb_client_id
VITE_IGDB_ACCESS_TOKEN=your_igdb_access_token
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Deploy Steps

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Framer Motion
- **Backend:** Firebase (Auth, Firestore)
- **Payment:** Razorpay
- **Deployment:** Vercel
- **API:** IGDB Games Database

## License

MIT License