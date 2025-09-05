import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FaEnvelope, FaCheckCircle, FaClock } from 'react-icons/fa';

interface OTPVerificationProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({ email, onBack, onSuccess }) => {
  const { sendOTP, verifyOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otp);
      toast.success('Email verified successfully! Welcome to GameHub!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await sendOTP(email);
      toast.success('New verification code sent!');
      setTimeLeft(180);
      setCanResend(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <FaEnvelope className="w-8 h-8 text-primary" />
        </div>
        <CardTitle>Verify Your Email</CardTitle>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Enter verification code</p>
              <p className="text-muted-foreground">
                Check your email inbox and enter the 6-digit code we sent you.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-mono"
              autoComplete="one-time-code"
            />
          </div>
          
          {timeLeft > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <FaClock className="w-4 h-4" />
              <span>Code expires in {formatTime(timeLeft)}</span>
            </div>
          )}
          
          <Button 
            onClick={handleVerify} 
            className="w-full" 
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>
          
          <Button 
            onClick={handleResend} 
            variant="outline" 
            className="w-full" 
            disabled={resendLoading || !canResend}
          >
            {resendLoading ? 'Sending...' : canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
          </Button>
          
          <Button onClick={onBack} variant="ghost" className="w-full">
            Back to Registration
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          Didn't receive the code? Check your spam folder or wait to resend.
        </p>
      </CardContent>
    </Card>
  );
};