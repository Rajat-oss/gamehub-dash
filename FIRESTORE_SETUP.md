# Firestore Setup Guide

## Quick Fix for "Failed to save game log" Error

### Step 1: Deploy Firestore Security Rules
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `gameplace-a351d`
3. Go to **Firestore Database** → **Rules**
4. Replace the existing rules with the content from `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Game logs - users can only access their own logs
    match /gameLogs/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Game comments - authenticated users can read all, write their own
    match /gameComments/{document} {
      allow read: if true; // Anyone can read comments
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // User activities - authenticated users can read all, write their own
    match /userActivities/{document} {
      allow read: if true; // Anyone can read activities for public feed
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

5. Click **Publish**

### Step 2: Verify Authentication
Make sure users are properly signed in before trying to save game logs.

### Step 3: Test the Application
1. Sign in to the application
2. Try adding a game to your library
3. The error should be resolved

## Alternative: Temporary Open Rules (NOT for production)
If you want to test quickly, you can temporarily use open rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING: This allows anyone to read/write all data. Only use for testing!**

## Troubleshooting

### Error: "Permission denied"
- Check that Firestore rules are deployed
- Verify user is authenticated
- Ensure user ID matches in the data

### Error: "Database unavailable"
- Check internet connection
- Verify Firebase project is active
- Check Firebase console for service status

### Error: "Invalid document reference"
- Verify collection names match the service files
- Check that document IDs are valid

## Collections Used
- `gameLogs` - User game library entries
- `gameComments` - Game comments and reviews
- `userActivities` - User activity feed

## Security Features
- Users can only access their own game logs
- Comments are public but users can only edit their own
- Activities are public for community feed
- All write operations require authentication