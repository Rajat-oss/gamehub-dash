declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  amount: number;
  currency: string;
  planName: string;
  planType: 'pro' | 'elite';
}

export const paymentService = {
  initializeRazorpay: () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  createPayment: async (options: PaymentOptions, userEmail: string, userName: string) => {
    const isRazorpayLoaded = await paymentService.initializeRazorpay();
    
    if (!isRazorpayLoaded) {
      throw new Error('Razorpay SDK failed to load');
    }

    const paymentOptions = {
      key: 'rzp_test_9999999999', // Replace with your Razorpay key
      amount: options.amount * 100, // Amount in paise
      currency: options.currency,
      name: 'Pixel Pilgrim',
      description: `${options.planName} Plan Subscription`,
      image: '/logofinal.png',
      prefill: {
        name: userName,
        email: userEmail,
      },
      theme: {
        color: '#7c3aed',
      },
      handler: function (response: any) {
        // Handle successful payment
        console.log('Payment successful:', response);
        return response;
      },
      modal: {
        ondismiss: function () {
          console.log('Payment modal closed');
        },
      },
    };

    const razorpay = new window.Razorpay(paymentOptions);
    razorpay.open();
    
    return new Promise((resolve, reject) => {
      paymentOptions.handler = function (response: any) {
        resolve(response);
      };
      
      paymentOptions.modal.ondismiss = function () {
        reject(new Error('Payment cancelled'));
      };
    });
  },
};