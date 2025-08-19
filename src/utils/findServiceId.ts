import emailjs from '@emailjs/browser';

// Try to discover the correct service ID
export const findCorrectServiceId = async (): Promise<void> => {
  const publicKey = 'meXmdsep-Hf_vqEqa';
  const templateId = 'template_apnp45o';
  
  emailjs.init(publicKey);
  
  // Common service ID patterns to try
  const possibleServiceIds = [
    'service_pixelpilgrim',
    'service_gamehub', 
    'service_default',
    'default_service',
    'gmail_service',
    'service_1',
    'service_abc123',
    'service_123abc',
    'pixelpilgrim',
    'gamehub-service',
    'service_vedant',
    // Generate some common patterns
    ...Array.from({length: 10}, (_, i) => `service_${String.fromCharCode(97 + i)}${String.fromCharCode(97 + Math.floor(i/2))}${i}`),
  ];
  
  const testParams = {
    to_name: 'Test',
    from_name: 'Service Discovery',
    from_email: 'test@example.com',
    message: 'Testing service ID discovery',
    subject: 'Service ID Test'
  };
  
  console.log('Trying to find correct service ID...');
  
  for (const serviceId of possibleServiceIds) {
    try {
      console.log(`Testing service ID: ${serviceId}`);
      
      const result = await emailjs.send(serviceId, templateId, testParams);
      
      console.log(`✅ SUCCESS! Found working service ID: ${serviceId}`);
      console.log('Result:', result);
      return serviceId;
      
    } catch (error) {
      if (error.status === 400 && error.text.includes('service ID not found')) {
        console.log(`❌ Service ID "${serviceId}" not found`);
      } else if (error.status === 400 && error.text.includes('template')) {
        console.log(`✅ Service ID "${serviceId}" exists, but template issue:`, error.text);
      } else {
        console.log(`⚠️  Service ID "${serviceId}" - Other error:`, error.text);
      }
    }
  }
  
  console.log('❌ Could not find a working service ID from common patterns');
  console.log('Please check your EmailJS dashboard at: https://dashboard.emailjs.com/admin');
};

// Add to window for easy access
if (typeof window !== 'undefined') {
  (window as any).findServiceId = findCorrectServiceId;
}
