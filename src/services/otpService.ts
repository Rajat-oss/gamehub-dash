import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

interface OTPData {
  email: string;
  otp: string;
  createdAt: any;
  expiresAt: number;
  verified: boolean;
}

class OTPService {
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(email: string): Promise<void> {
    const otp = this.generateOTP();
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes

    try {
      await setDoc(doc(db, 'emailVerification', email), {
        email,
        otp,
        createdAt: serverTimestamp(),
        expiresAt,
        verified: false
      });

      // Send email
      await this.sendVerificationEmail(email, otp);
      
      // Also log for debugging
      console.log(`OTP sent to ${email}: ${otp}`);
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send verification code');
    }
  }

  private async sendVerificationEmail(email: string, otp: string): Promise<void> {
    try {
      const { emailService } = await import('./emailService');
      await emailService.sendOTPEmail(email, otp);
    } catch (error) {
      console.error('Email service error:', error);
      throw new Error(`Failed to send verification email to ${email}. Please check your email configuration.`);
    }
  }

  async verifyOTP(email: string, inputOTP: string): Promise<boolean> {
    try {
      const otpDoc = await getDoc(doc(db, 'emailVerification', email));
      
      if (!otpDoc.exists()) {
        throw new Error('Verification code not found or expired');
      }

      const data = otpDoc.data() as OTPData;
      
      if (Date.now() > data.expiresAt) {
        await deleteDoc(doc(db, 'emailVerification', email));
        throw new Error('Verification code has expired');
      }

      if (data.otp !== inputOTP) {
        throw new Error('Invalid verification code');
      }

      // Mark as verified
      await setDoc(doc(db, 'emailVerification', email), {
        ...data,
        verified: true
      });

      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  async isEmailVerified(email: string): Promise<boolean> {
    try {
      const otpDoc = await getDoc(doc(db, 'emailVerification', email));
      
      if (!otpDoc.exists()) {
        return false;
      }

      const data = otpDoc.data() as OTPData;
      return data.verified === true && Date.now() <= data.expiresAt;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  }

  async cleanupOTP(email: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'emailVerification', email));
    } catch (error) {
      // Silently ignore cleanup errors
    }
  }
}

export const otpService = new OTPService();