# Simple EmailJS Setup (No Custom Template Needed)

## Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for free account
3. Verify your email

## Step 2: Add Email Service
1. Go to **Email Services**
2. Click **Add New Service**
3. Choose **Gmail**
4. Connect your Gmail account
5. Note your **Service ID** (e.g., `service_abc123`)

## Step 3: Use Default Template
- **Skip creating custom template** - we'll use the default `contact_form`
- Most EmailJS accounts come with this template pre-installed

## Step 4: Get Your Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key**

## Step 5: Update Code
Open `src/services/emailService.ts` and update:

```typescript
// Replace these lines:
emailjs.init('YOUR_ACTUAL_PUBLIC_KEY'); // Your real public key

class EmailService {
  private serviceId = 'YOUR_ACTUAL_SERVICE_ID'; // Your real service ID
  private templateId = 'contact_form'; // Keep this as is
}
```

## Example:
```typescript
emailjs.init('user_abc123xyz789');

class EmailService {
  private serviceId = 'service_gmail456';
  private templateId = 'contact_form';
}
```

## That's It!
- No custom template needed
- Uses default contact form template
- OTP will be sent in the message body
- Works with free EmailJS account

## Test
1. Update the service with your keys
2. Register with real email
3. Check inbox for OTP email