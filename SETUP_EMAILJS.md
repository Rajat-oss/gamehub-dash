# EmailJS Setup for Real OTP Emails

## Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a free account
3. Verify your email

## Step 2: Add Email Service
1. Go to **Email Services** in dashboard
2. Click **Add New Service**
3. Choose **Gmail** (recommended)
4. Connect your Gmail account
5. Note the **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Set **Template Name**: `OTP Verification`
4. Set **Template ID**: `template_otp`

### Template Content:
**Subject:** `GameHub - Email Verification Code`

**Content:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #333;">GameHub</h1>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
    <p>Your verification code is:</p>
    <div style="font-size: 32px; font-weight: bold; color: #007bff; text-align: center; padding: 20px; background: white; border-radius: 4px; letter-spacing: 5px;">
      {{otp_code}}
    </div>
  </div>
  
  <p style="color: #666;">This code will expire in 10 minutes.</p>
  <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
  <p style="color: #999; font-size: 12px; text-align: center;">
    This email was sent by {{app_name}}
  </p>
</div>
```

### Template Settings:
- **To Email:** `{{to_email}}`
- **From Name:** `GameHub`
- **Reply To:** Your email

## Step 4: Get Your Keys
1. Go to **Account** → **General**
2. Copy your **Public Key**
3. Note your **Service ID** from Email Services

## Step 5: Update Your Code

### Update `src/services/emailService.ts`:
```typescript
// Replace these with your actual values
emailjs.init('YOUR_PUBLIC_KEY_HERE');

class EmailService {
  private serviceId = 'YOUR_SERVICE_ID_HERE'; // e.g., 'service_abc123'
  private templateId = 'template_otp';
  // ... rest of the code
}
```

### Example with real values:
```typescript
emailjs.init('user_abc123xyz');

class EmailService {
  private serviceId = 'service_gmail123';
  private templateId = 'template_otp';
}
```

## Step 6: Test the Setup
1. Update the email service with your credentials
2. Register with a real email address
3. Check your email inbox for the OTP
4. Enter the code to complete verification

## Environment Variables (Optional)
Create `.env` file:
```
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=template_otp
```

Then update emailService.ts:
```typescript
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

class EmailService {
  private serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  private templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
}
```

## Troubleshooting
- **Email not received:** Check spam folder
- **Service error:** Verify Service ID and Public Key
- **Template error:** Ensure template variables match
- **Gmail issues:** Make sure Gmail service is properly connected

## Free Tier Limits
- 200 emails/month
- Perfect for development and small apps
- Upgrade for higher limits if needed