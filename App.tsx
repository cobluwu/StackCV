
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InputSection from './components/InputSection';
import AnalyzeOverlay from './components/AnalyzeOverlay';
import ResultsSection from './components/ResultsSection';
import RewriteSection from './components/RewriteSection';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import Background from './components/Background';
import LoginPage from './components/LoginPage';
import StudentVerifyModal from './components/StudentVerifyModal';
import HistoryModal from './components/HistoryModal';
import { AnalysisResult, AnalysisHistoryItem } from './types';
import { analyzeResume } from './services/geminiService';
import { processPayment } from './services/paymentService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SAMPLE_RESUME, SAMPLE_JD, MOCK_ANALYSIS_RESULT } from './constants/sampleData';

// View Types
type ViewState = 'home' | 'login';

// Inner App component to use Auth Context
const StackCVApp: React.FC = () => {
  const { user, guestCredits, isDemoMode, setDemoMode, updatePlan, decrementGuestCredit, processAnalysisCompletion } = useAuth();
  
  // View State Management
  const [currentView, setCurrentView] = useState<ViewState>('home');
  
  // App States
  const [resumeText, setResumeText] = useState('');
  const [jobDescText, setJobDescText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [previousResults, setPreviousResults] = useState<AnalysisResult | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  
  // Modal States
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Demo Mode Logic
  const handleTryDemo = () => {
    setDemoMode(true);
    setResumeText(SAMPLE_RESUME);
    setJobDescText(SAMPLE_JD);
    
    // Scroll to input section
    document.getElementById('product')?.scrollIntoView({ behavior: 'smooth' });
    
    console.log("Demo mode activated with sample data");

    // Optional: Auto-trigger analysis after a short delay
    setTimeout(() => {
      handleAnalyze();
    }, 1000);
  };

  // Effect to redirect to home if user logs in while on login page
  useEffect(() => {
    if (user && currentView === 'login') {
      setCurrentView('home');
    }
  }, [user, currentView]);

  const handleAnalyze = async () => {
    setError(null);
    
    // Store current results as previous before overwriting
    if (results) {
      setPreviousResults(results);
    }
    
    // 1. Guest Checks
    if (!user && !isDemoMode) {
      if (guestCredits <= 0) {
        // Redirect to login if guest limit reached
        setError("Guest limit (2 scans) reached. Please login for 5 more daily scans.");
        setTimeout(() => setCurrentView('login'), 2000);
        return;
      }
    } else if (user && !isDemoMode) {
      // 2. User Checks
      if (user.credits.count <= 0) {
        setError(`You have reached your limit for today. Upgrade your plan for more.`);
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    setIsAnalyzing(true);

    try {
      const planType = user?.plan || 'free';
      
      // Daily Premium Trial Logic
      const today = new Date().toDateString(); // e.g., "Mon Jan 01 2024"
      const lastTrialDate = localStorage.getItem('resume_align_premium_trial_date');
      const isTrialEligible = planType !== 'pro' && lastTrialDate !== today;

      let data: AnalysisResult;
      
      // Determine if we should use mock data or real analysis
      const isUsingSampleData = resumeText.trim() === SAMPLE_RESUME.trim() && jobDescText.trim() === SAMPLE_JD.trim();
      
      if (isDemoMode && isUsingSampleData) {
        // Simulate delay for demo with sample data
        await new Promise(resolve => setTimeout(resolve, 2000));
        data = MOCK_ANALYSIS_RESULT;
      } else {
        // Use real analysis (even in demo mode, but without limits)
        data = await analyzeResume(resumeText, jobDescText, planType, isTrialEligible);
      }
      
      let success = false;
      if (isDemoMode) {
        success = true;
      } else if (user) {
        // Atomic update: Deduct credit AND save history together
        success = processAnalysisCompletion(data);
      } else {
        success = decrementGuestCredit();
      }

      if (!success) {
         throw new Error("Insufficient credits");
      }

      // If we got insights and user wasn't Pro, it means trial was used
      if (data.proInsights && planType !== 'pro') {
        localStorage.setItem('resume_align_premium_trial_date', today);
      }

      setResults(data);
      
      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error(err);
      setError("We encountered an issue analyzing your data. Please try again.");
      setPreviousResults(null); // Reset comparison on error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadHistory = (item: AnalysisHistoryItem) => {
    // When loading from history, we treat it as a fresh view, no comparison
    setPreviousResults(null);
    setResults(item.result);
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleUpgrade = (plan: 'pro' | 'student', price: number) => {
    if (!user) {
      setCurrentView('login');
      return;
    }

    const planName = plan === 'pro' ? 'CareerPlus' : 'CareerCompass';

    processPayment(
      user,
      planName,
      price,
      () => {
        updatePlan(plan);
        alert(`Success! You've been upgraded to ${planName}.`);
      },
      (err) => {
        console.log(err); 
      }
    );
  };

  const handleStudentVerifyClick = () => {
    if (!user) {
      setCurrentView('login');
    } else {
      setIsVerifyOpen(true);
    }
  };

  // Render Login View
  if (currentView === 'login') {
    return <LoginPage onBack={() => setCurrentView('home')} />;
  }

  // Render Home View
  return (
    <div className="min-h-screen bg-transparent selection:bg-mint selection:text-primary relative isolate">
      <Background />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar 
          onLoginClick={() => setCurrentView('login')} 
          onHistoryClick={() => setIsHistoryOpen(true)}
        />
        <main className="flex-grow">
          <Hero onTryDemo={handleTryDemo} />
          
          <InputSection 
            resumeText={resumeText}
            setResumeText={setResumeText}
            jobDescText={jobDescText}
            setJobDescText={setJobDescText}
            onAnalyze={handleAnalyze}
          />
          
          {!user && !isDemoMode && guestCredits > 0 && guestCredits <= 2 && !isAnalyzing && (
             <div className="text-center mb-6 animate-fade-in">
               <span className="bg-mint/30 text-primary text-xs font-medium px-3 py-1 rounded-full border border-mint/40">
                 Guest Mode: {guestCredits} scans remaining today
               </span>
             </div>
          )}

          {isDemoMode && !isAnalyzing && (
             <div className="text-center mb-6 animate-fade-in">
               <span className="bg-brand/20 text-brand text-xs font-bold px-3 py-1 rounded-full border border-brand/30 flex items-center gap-2 w-fit mx-auto">
                 <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse"></span>
                 Demo Mode: Unlimited scans enabled
               </span>
             </div>
          )}

          {isAnalyzing && <AnalyzeOverlay />}

          {error && (
            <div className="max-w-4xl mx-auto px-6 mb-8 text-center animate-fade-in">
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}
          
          {results && (
            <>
              <div id="results">
                <ResultsSection 
                  result={results}
                  previousResult={previousResults}
                  originalResumeText={resumeText}
                  jobDescText={jobDescText} 
                />
              </div>
              {results.resumeRewrite && (
                 <RewriteSection 
                   rewriteData={results.resumeRewrite} 
                   analysisResult={results}
                 />
              )}
            </>
          )}
          
          <PricingSection 
            onUpgrade={handleUpgrade}
            onStudentVerify={handleStudentVerifyClick} 
            onLogin={() => setCurrentView('login')}
          />
        </main>
        <Footer />
        <ChatBot />

        {/* Modals */}
        <StudentVerifyModal isOpen={isVerifyOpen} onClose={() => setIsVerifyOpen(false)} />
        <HistoryModal 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
          history={user?.history || []}
          onSelect={handleLoadHistory}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <StackCVApp />
    </AuthProvider>
  );
};

export default App;
