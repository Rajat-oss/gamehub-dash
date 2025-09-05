# EmailJS Setup for OTP Verification

## Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service
1. Go to Email Services in your EmailJS dashboard
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Note down your Service ID (e.g., 'service_gamehub')

## Step 3: Create Email Template
1. Go to Email Templates in your dashboard
2. Click "Create New Template"
3. Use this template content:

**Template ID:** `template_verify`

**Subject:** `GameHub - Email Verification Code`

**Content:**
```
Hello,

Your GameHub verification code is: {{otp_code}}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
GameHub Team
```

**Template Variables:**
- `{{to_email}}` - Recipient email
- `{{otp_code}}` - The 6-digit verification code
- `{{app_name}}` - App name (GameHub)

## Step 4: Get Your Public Key
1. Go to Account > General
2. Copy your Public Key

## Step 5: Update Your Code
1. Open `src/services/otpService.ts`
2. Replace `'service_gamehub'` with your actual Service ID
3. Replace `'template_verify'` with your actual Template ID
4. Replace `'YOUR_PUBLIC_KEY'` with your actual Public Key

## Step 6: Initialize EmailJS (Optional)
Add this to your main.tsx or App.tsx:

```typescript
import emailjs from '@emailjs/browser';

emailjs.init('YOUR_PUBLIC_KEY');
```

## Environment Variables (Recommended)
Create these in your .env file:

```
VITE_EMAILJS_SERVICE_ID=service_gamehub
VITE_EMAILJS_TEMPLATE_ID=template_verify
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

Then update otpService.ts to use:
```typescript
process.env.VITE_EMAILJS_SERVICE_ID || 'service_gamehub'
```

## Testing
1. Try registering with a real email address
2. Check your email for the verification code
3. Enter the code in the verification form

## Troubleshooting
- Make sure your email service is properly configured
- Check EmailJS dashboard for delivery status
- Verify template variables are correct
- Check browser console for any errors