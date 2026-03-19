
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Background from './Background';

interface LoginPageProps {
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const { login } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Error States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleGoogleLogin = async () => {
    setIsAnimating(true);
    try {
      await login('google');
    } catch (err: any) {
      setFormError(err.message || "Google login failed.");
      setIsAnimating(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setEmailError('');
    setPasswordError('');
    
    let isValid = true;

    // Validation Logic
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    }

    if (isSignUp && !name.trim()) {
      setFormError('Please enter your full name.');
      isValid = false;
    }

    if (!isValid) return;

    setIsAnimating(true);
    
    try {
      await login('email', email, password, name, isSignUp);
      // Success is handled by AuthContext state change redirecting in App.tsx
    } catch (err: any) {
      setFormError(err.message || "Authentication failed. Please try again.");
      setIsAnimating(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormError('');
    setEmailError('');
    setPasswordError('');
    setName('');
    setPassword('');
    // Keep email populated for convenience
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <Background />
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium text-sm group"
      >
        <svg 
          className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </button>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 animate-slide-up h-[600px]">
        
        {/* Left Side - Visuals */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gray-50/50 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-mint/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-200/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

           <div className="relative z-10">
             <h2 className="font-display font-semibold text-3xl text-primary mb-4 leading-tight">
               Unlock your career potential.
             </h2>
             <p className="text-gray-500 leading-relaxed">
               Join thousands of students optimizing their resumes to pass ATS filters and land top internships.
             </p>
           </div>

           <div className="relative z-10 bg-white p-6 rounded-2xl shadow-soft border border-border mt-8">
             <div className="flex items-center gap-2 mb-3">
               <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                 <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                 <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
               </div>
               <span className="text-xs text-gray-500 font-medium">+2,400 students joined this week</span>
             </div>
             <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
               <div className="bg-primary w-3/4 h-full rounded-full"></div>
             </div>
           </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col justify-center p-8 md:p-12 relative overflow-y-auto">
          <div className="text-center md:text-left mb-6">
             <div className="inline-block px-3 py-1 bg-mint/30 text-primary text-[10px] font-bold tracking-widest uppercase rounded-full mb-4">
               Secure Login
             </div>
             <h1 className="font-display font-bold text-3xl text-primary mb-2">
               {isSignUp ? "Create Account" : "Welcome Back"}
             </h1>
             <p className="text-gray-400 text-sm">
               {isSignUp ? "Start your journey to a better resume." : "Login to access your saved analyses."}
             </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isAnimating}
              className="w-full flex items-center justify-center gap-3 bg-white border border-border hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group relative overflow-hidden"
            >
              {isAnimating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="group-hover:text-primary transition-colors">Continue with Google</span>
                </>
              )}
            </button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-xs text-gray-400 uppercase tracking-wider">or</span>
              </div>
            </div>

            {/* General Error Message */}
            {formError && (
              <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg border border-red-100 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {formError}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-3">
               {isSignUp && (
                 <input 
                   type="text" 
                   placeholder="Full Name" 
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full bg-gray-50 border border-border focus:bg-white focus:ring-2 focus:ring-mint/50 outline-none rounded-xl px-4 py-3 text-sm transition-all" 
                 />
               )}
               
               <div>
                 <input 
                   type="email" 
                   placeholder="Email address" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className={`w-full bg-gray-50 border focus:bg-white focus:ring-2 focus:ring-mint/50 outline-none rounded-xl px-4 py-3 text-sm transition-all ${emailError ? 'border-red-300 ring-1 ring-red-100' : 'border-border'}`}
                 />
                 {emailError && <p className="text-red-500 text-[10px] mt-1 ml-1">{emailError}</p>}
               </div>

               <div>
                 <input 
                   type="password" 
                   placeholder="Password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className={`w-full bg-gray-50 border focus:bg-white focus:ring-2 focus:ring-mint/50 outline-none rounded-xl px-4 py-3 text-sm transition-all ${passwordError ? 'border-red-300 ring-1 ring-red-100' : 'border-border'}`}
                 />
                 {passwordError && <p className="text-red-500 text-[10px] mt-1 ml-1">{passwordError}</p>}
               </div>

               <button 
                 type="submit"
                 disabled={isAnimating}
                 className="w-full bg-primary text-white hover:bg-accent py-3 rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {isAnimating ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
               </button>
            </form>
          </div>

          <div className="mt-6 text-center">
             <p className="text-sm text-gray-500">
               {isSignUp ? "Already have an account?" : "Don't have an account?"}
               <button 
                 onClick={toggleMode}
                 className="ml-2 text-primary font-medium hover:underline focus:outline-none"
               >
                 {isSignUp ? "Log In" : "Sign Up"}
               </button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
