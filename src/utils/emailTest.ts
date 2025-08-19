import emailjs from '@emailjs/browser';

// Test EmailJS configuration
export const testEmailJS = async (): Promise<void> => {
  try {
    console.log('Testing EmailJS configuration...');
    
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_zdf9xta';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_apnp45o';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'meXmdsep-Hf_vqEqa';
    
    console.log('Config:', {
      serviceId,
      templateId,
      publicKey: publicKey ? '***SET***' : 'NOT SET'
    });

    // Initialize EmailJS
    emailjs.init(publicKey);
    
    // Test template parameters
    const testParams = {
      to_email: 'vedantvyas79@gmail.com',
      from_name: 'Test User',
      from_email: 'test@example.com',
      game_name: 'Test Game',
      game_genres: 'Action, Adventure',
      game_rating: '85',
      game_cover: 'https://via.placeholder.com/300x400?text=Test+Game',
      user_message: 'This is a test message',
      request_date: new Date().toLocaleString()
    };

    console.log('Sending test email with params:', testParams);

    const result = await emailjs.send(serviceId, templateId, testParams);
    
    console.log('Test email sent successfully:', result);
    return result;
    
  } catch (error) {
    console.error('EmailJS test failed:', error);
    throw error;
  }
};

// Add this to window for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testEmailJS = testEmailJS;
}
