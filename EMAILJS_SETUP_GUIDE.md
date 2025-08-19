# EmailJS Setup Guide

## The Issue
The error "The service ID not found" means the EmailJS service isn't properly configured. Let's fix this step by step.

## Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a free account (if you don't have one)
3. Verify your email address

## Step 2: Create an Email Service
1. Go to https://dashboard.emailjs.com/admin
2. Click "Email Services" in the left sidebar
3. Click "Add New Service"
4. Choose your email provider (Gmail is recommended):
   - Select "Gmail"
   - Connect your Gmail account (vedantvyas79@gmail.com)
   - Give it a Service ID (something like "service_gamehub" or use the auto-generated one)
5. Click "Create Service"
6. **Copy the Service ID** - you'll need this

## Step 3: Create an Email Template
1. In the EmailJS dashboard, click "Email Templates"
2. Click "Create New Template"
3. Use this template content:

**Subject:** Game Request: {{game_name}}

**Template Body:**
```
Hello GameHub Admin,

You have received a new game request:

Game Details:
- Name: {{game_name}}
- Genres: {{game_genres}}
- Rating: {{game_rating}}
- Cover Image: {{game_cover}}

User Information:
- Name: {{from_name}}
- Email: {{from_email}}

Additional Message:
{{user_message}}

Request submitted on: {{request_date}}

Best regards,
GameHub Platform
```

4. Save the template and **copy the Template ID**

## Step 4: Get Your Public Key
1. Go to "Account" in the EmailJS dashboard
2. Find your **Public Key** under "API Keys"
3. Copy this key

## Step 5: Update Your .env File
Update your `.env` file with the correct values:

```env
VITE_EMAILJS_SERVICE_ID=your_actual_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_actual_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key_here
VITE_ADMIN_EMAIL=vedantvyas79@gmail.com
```

## Step 6: Test the Setup
1. Restart your development server
2. Try submitting a game request
3. Check your email inbox

## Alternative: Quick Setup with Default Template
If you want to test quickly, you can use EmailJS's default contact template:

1. Create a service as above
2. Use the default "contact_form" template
3. Update the template variables to match our format

Let me know your EmailJS Service ID, Template ID, and Public Key, and I'll help you configure it!
