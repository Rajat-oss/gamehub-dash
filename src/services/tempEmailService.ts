import emailjs from '@emailjs/browser';

// Temporary email service that works with default EmailJS templates
export const sendTempGameRequest = async (gameData: {
  gameName: string;
  userName: string;
  userEmail: string;
  message?: string;
}): Promise<void> => {
  try {
    console.log('Using temporary email service...');
    
    // Initialize EmailJS with a working public key
    const publicKey = 'meXmdsep-Hf_vqEqa'; // This should work if it's valid
    emailjs.init(publicKey);
    
    // Create a message that works with any basic template
    const emailMessage = `
Game Request from GameHub

Game: ${gameData.gameName}
Requested by: ${gameData.userName}
Email: ${gameData.userEmail}
Date: ${new Date().toLocaleString()}

Additional Message: ${gameData.message || 'None'}

Please add this game to the GameHub platform.
    `.trim();
    
    // Try multiple template formats
    const templateOptions = [
      // Option 1: Standard contact template format
      {
        serviceId: 'default_service',
        templateId: 'template_contact',
        params: {
          name: gameData.userName,
          email: gameData.userEmail,
          subject: `Game Request: ${gameData.gameName}`,
          message: emailMessage
        }
      },
      // Option 2: Generic template format
      {
        serviceId: 'service_8u5k6jb', // Common default service ID format
        templateId: 'template_game_request',
        params: {
          to_name: 'GameHub Admin',
          from_name: gameData.userName,
          from_email: gameData.userEmail,
          message: emailMessage,
          subject: `Game Request: ${gameData.gameName}`
        }
      },
      // Option 3: Simple contact form
      {
        serviceId: 'gmail',
        templateId: 'template_contact_form',
        params: {
          user_name: gameData.userName,
          user_email: gameData.userEmail,
          user_message: emailMessage
        }
      }
    ];
    
    let lastError;
    
    // Try each template option
    for (const option of templateOptions) {
      try {
        console.log(`Trying template option with service: ${option.serviceId}, template: ${option.templateId}`);
        
        const result = await emailjs.send(
          option.serviceId,
          option.templateId,
          option.params
        );
        
        console.log('Email sent successfully with template option:', result);
        return; // Success, exit function
        
      } catch (error) {
        console.warn(`Template option failed:`, error);
        lastError = error;
        continue;
      }
    }
    
    // If we get here, all options failed
    throw lastError || new Error('All email template options failed');
    
  } catch (error) {
    console.error('Temporary email service failed:', error);
    
    // Create a helpful error message
    let errorMsg = 'Email sending failed. ';
    if (error.text?.includes('service')) {
      errorMsg += 'Please set up EmailJS service first. See EMAILJS_SETUP_GUIDE.md';
    } else if (error.text?.includes('template')) {
      errorMsg += 'Email template not found. Please create an EmailJS template.';
    } else {
      errorMsg += `Error: ${error.text || error.message || 'Unknown error'}`;
    }
    
    throw new Error(errorMsg);
  }
};
