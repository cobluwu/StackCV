
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { initiateEmailVerification, verifyOTP } from '../services/studentVerification';

interface StudentVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'email_input' | 'otp_input' | 'success';

const StudentVerifyModal: React.FC<StudentVerifyModalProps> = ({ isOpen, onClose }) => {
  const { verifyStudent } = useAuth();
  const [step, setStep] = useState<Step>('email_input');
  
  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('email_input');
      setEmail('');
      setOtp('');
      setGeneratedOtp(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await initiateEmailVerification(email);

      if (response.reason === 'invalid_format') {
        setError('Please enter a valid email address.');
      } else if (response.reason === 'unapproved_domain') {
        setError('Email domain not recognized as an educational institution (e.g., .edu, .ac.in).');
      } else if (response.reason === 'valid' && response.otp) {
        setGeneratedOtp(response.otp);
        setStep('otp_input');
        alert(`Verification code sent to ${email}.\n\n(Check your browser console for the simulated email content)`);
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyOTP(email, otp, generatedOtp);

      if (response.verified) {
         await verifyStudent();
         setStep('success');
      } else {
        setError('Invalid OTP. Please check and try again.');
      }
    } catch (err) {
      setError('Verification error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    onClose();
    // Smooth scroll back to pricing to show new prices
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-lg rounded-2xl p-8 relative shadow-2xl animate-slide-up overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* Step 1: Email Input */}
        {step === 'email_input' && (
          <>
            <div className="text-center mb-6">
               <div className="w-12 h-12 bg-mint/50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
               </div>
               <h2 className="font-display font-semibold text-2xl text-primary">Unlock Student Pricing</h2>
               <p className="text-gray-500 mt-2 text-sm">Enter your university email (e.g. .edu, .ac.in) to save 58% on all premium plans.</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">University Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@university.ac.in"
                  className="w-full bg-gray-50 border border-border focus:bg-white focus:ring-2 focus:ring-mint/50 outline-none rounded-xl px-4 py-3 text-sm transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 flex items-start gap-2">
                   <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                   {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  !email || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-accent shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send Verification Code</span>
                )}
              </button>
            </form>
          </>
        )}

        {/* Step 2: OTP Input */}
        {step === 'otp_input' && (
          <>
             <div className="text-center mb-6">
               <div className="w-12 h-12 bg-mint/50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               </div>
               <h2 className="font-display font-semibold text-2xl text-primary">Enter OTP</h2>
               <p className="text-gray-500 mt-2 text-sm">
                 We've sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>.
               </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-gray-50 border border-border focus:bg-white focus:ring-2 focus:ring-mint/50 outline-none rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 text-center">
                   {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    otp.length !== 6 || isLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-accent shadow-lg hover:shadow-xl'
                  }`}
                >
                   {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setStep('email_input')}
                  className="text-gray-400 text-xs hover:text-gray-600"
                >
                  Change Email Address
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 className="font-display font-semibold text-2xl text-primary mb-2">Verification Successful!</h2>
            <p className="text-gray-500 mb-6">Student discounts have been unlocked. Choose your plan to continue.</p>
            <button 
              onClick={handleSuccessClose}
              className="px-8 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-accent transition-all shadow-lg"
            >
              View Discounted Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentVerifyModal;
