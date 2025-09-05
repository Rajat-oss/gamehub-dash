import emailjs from '@emailjs/browser';

class SimpleEmailService {
  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    try {
      const templateParams = {
        to_email: email,
        otp_code: otp,
        subject: 'GameHub - Email Verification Code'
      };

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'pixelpilgrim-service';
      const templateId = 'template_verification';
      
      await emailjs.send(serviceId, templateId, templateParams);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}

export const simpleEmailService = new SimpleEmailService();

// Simple email service with minimal dependencies
export const sendSimpleGameRequest = async (gameData: {
  gameName: string;
  userName: string;
  userEmail: string;
  message?: string;
}): Promise<void> => {
  try {
    console.log('Sending simple game request email...');
    
    // Use EmailJS with a simple contact template format
    const templateParams = {
      to_name: 'GameHub Admin',
      from_name: gameData.userName,
      from_email: gameData.userEmail,
      subject: `Game Request: ${gameData.gameName}`,
      message: `
New Game Request:

Game: ${gameData.gameName}
Requested by: ${gameData.userName} (${gameData.userEmail})
Message: ${gameData.message || 'No additional message'}
Date: ${new Date().toLocaleString()}

Please add this game to the GameHub platform.
      `.trim()
    };

    console.log('Simple template params:', templateParams);

    // Use the EmailJS send method with fallback configuration
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'pixelpilgrim-service';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_game_request';
    
    // Try to send with current template first
    let result;
    try {
      result = await emailjs.send(serviceId, templateId, templateParams);
    } catch (primaryError) {
      console.warn('Primary template failed, trying with contact template format...', primaryError);
      
      // Try with a generic contact form template structure
      const contactParams = {
        name: gameData.userName,
        email: gameData.userEmail,
        subject: `Game Request: ${gameData.gameName}`,
        message: templateParams.message
      };
      
      result = await emailjs.send(serviceId, 'contact_form', contactParams);
    }
    
    console.log('Simple email sent successfully:', result);
    
  } catch (error) {
    console.error('Simple email sending failed:', error);
    
    // Provide more specific error messages
    if (error.text) {
      console.error('EmailJS Error Text:', error.text);
    }
    if (error.status) {
      console.error('EmailJS Status:', error.status);
    }
    
    throw new Error(`Email sending failed: ${error.text || error.message || 'Unknown error'}`);
  }
};
