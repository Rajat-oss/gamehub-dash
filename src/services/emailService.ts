import emailjs from '@emailjs/browser';

// Initialize EmailJS
emailjs.init('meXmdsep-Hf_vqEqa');

class EmailService {
  private serviceId = 'service_zdf9xta';
  private templateId = 'template_x9bq7x2';

  async sendOTPEmail(email: string, otp: string): Promise<void> {
    const templateParams = {
      user_email: email,
      message: otp
    };

    await emailjs.send(
      this.serviceId,
      this.templateId,
      templateParams
    );
  }
}

export const emailService = new EmailService();