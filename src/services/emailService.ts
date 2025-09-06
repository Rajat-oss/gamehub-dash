import emailjs from '@emailjs/browser';

class EmailService {
  private serviceId: string;
  private templateId: string;
  private publicKey: string;

  constructor() {
    // Use environment variables with fallbacks
    this.serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_zdf9xta';
    this.templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_x9bq7x2';
    this.publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'meXmdsep-Hf_vqEqa';
    
    // Initialize EmailJS
    emailjs.init(this.publicKey);
  }

  async sendOTPEmail(email: string, otp: string): Promise<void> {
    try {
      const templateParams = {
        to_email: email,
        user_email: email,
        otp_code: otp,
        message: otp,
        subject: 'GameHub - Email Verification Code',
        verification_code: otp
      };

      console.log('Sending OTP email to:', email);
      console.log('Using service ID:', this.serviceId);
      console.log('Using template ID:', this.templateId);

      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      console.log('Email sent successfully:', result);
    } catch (error) {
      console.error('EmailJS Error:', error);
      
      // Provide more specific error messages
      if (error.text?.includes('service')) {
        throw new Error('EmailJS service not found. Please check your service ID configuration.');
      } else if (error.text?.includes('template')) {
        throw new Error('EmailJS template not found. Please check your template ID configuration.');
      } else if (error.text?.includes('public_key')) {
        throw new Error('Invalid EmailJS public key. Please check your configuration.');
      } else {
        throw new Error(`Failed to send verification email: ${error.text || error.message || 'Unknown error'}`);
      }
    }
  }
}

export const emailService = new EmailService();