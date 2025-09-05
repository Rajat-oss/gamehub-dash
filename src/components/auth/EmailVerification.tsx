import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';

interface EmailVerificationProps {
  email: string;
  onBack: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ email, onBack }) => {
  const { sendOTP, verifyOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otp);
      toast.success('Email verified successfully! You can now log in.');
      onBack();
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await sendOTP(email);
      toast.success('New OTP sent to your email!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <FaEnvelope className="w-8 h-8 text-primary" />
        </div>
        <CardTitle>Verify Your Email</CardTitle>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to <strong>{email}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Enter verification code</p>
              <p className="text-muted-foreground">
                We've sent a 6-digit code to your email. Enter it below to verify your account.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
          
          <Button onClick={handleVerify} className="w-full" disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>
          
          <Button onClick={handleResend} variant="outline" className="w-full" disabled={resendLoading}>
            {resendLoading ? 'Sending...' : 'Resend Code'}
          </Button>
          
          <Button onClick={onBack} variant="ghost" className="w-full">
            Back to Login
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          Didn't receive the code? Check your spam folder or try resending.
        </p>
      </CardContent>
    </Card>
  );
};