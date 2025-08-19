import emailjs from '@emailjs/browser';

// Test different template parameter structures
export const testTemplateStructure = async (): Promise<void> => {
  const serviceId = 'service_zdf9xta';
  const templateId = 'template_apnp45o';
  const publicKey = 'meXmdsep-Hf_vqEqa';
  
  emailjs.init(publicKey);
  
  // Test with common EmailJS template parameter structures
  const testConfigurations = [
    {
      name: 'Standard Contact Form',
      params: {
        to_name: 'GameHub Admin',
        from_name: 'Test User',
        from_email: 'test@example.com',
        message: 'Game Request: Cyberpunk 2077\n\nThis is a test message to verify the template structure.',
        subject: 'Game Request: Cyberpunk 2077'
      }
    },
    {
      name: 'Game Request Specific',
      params: {
        to_email: 'vedantvyas79@gmail.com',
        from_name: 'Test User',
        from_email: 'test@example.com',
        game_name: 'Cyberpunk 2077',
        game_cover: 'https://example.com/game-cover.jpg',
        user_message: 'Please add this game!',
        request_date: new Date().toLocaleString(),
        subject: 'Game Request: Cyberpunk 2077'
      }
    },
    {
      name: 'Simple Structure',
      params: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Game Request: Cyberpunk 2077\n\nThis is a test request.',
        subject: 'Game Request Test'
      }
    }
  ];
  
  console.log('🧪 Testing EmailJS template structures...');
  
  for (const config of testConfigurations) {
    try {
      console.log(`Testing: ${config.name}`);
      console.log('Parameters:', config.params);
      
      const result = await emailjs.send(serviceId, templateId, config.params);
      
      console.log(`✅ SUCCESS with "${config.name}":`, result);
      console.log('✨ This template structure works! Check your email.');
      return;
      
    } catch (error) {
      console.log(`❌ Failed with "${config.name}":`, error.text || error.message);
    }
  }
  
  console.log('❌ All template structures failed. Please check your EmailJS template configuration.');
};

// Add to window for easy testing
if (typeof window !== 'undefined') {
  (window as any).testTemplate = testTemplateStructure;
}
