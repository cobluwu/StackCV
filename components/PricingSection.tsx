
import React from 'react';
import { useAuth } from '../context/AuthContext';

interface PricingSectionProps {
  onUpgrade: (plan: 'pro' | 'student', price: number) => void;
  onStudentVerify: () => void;
  onLogin: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onUpgrade, onStudentVerify, onLogin }) => {
  const { user } = useAuth();
  
  const isStudentVerified = user?.isStudentVerified;
  const currentPlan = user?.plan || 'free';

  // Pricing Constants
  const PRICING = {
    compass: {
      standard: 149,
      student: 59,
      save: 58 // percentage
    },
    plus: {
      standard: 349,
      student: 149,
      save: 58 // percentage
    }
  };

  const getPrice = (tier: 'compass' | 'plus') => {
    return isStudentVerified ? PRICING[tier].student : PRICING[tier].standard;
  };

  return (
    <section id="pricing" className="py-16 md:py-24 px-4 md:px-6 bg-paper border-t border-border scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Banner */}
        <div className="w-full bg-mint/20 border border-mint rounded-lg p-3 text-center mb-8 animate-fade-in">
          <p className="text-sm font-medium text-teal-800 flex items-center justify-center gap-2">
            <span className="bg-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-mint shadow-sm">Student Offer</span>
            Get <span className="font-bold">58% off</span> CareerCompass & CareerPlus with your college email ID.
          </p>
        </div>

        <div className="text-center mb-12 md:mb-16">
          <p className="font-display text-primary font-medium tracking-wide text-sm uppercase mb-3 opacity-60">
            Professional tools for every stage of your journey
          </p>
          <h2 className="font-display font-semibold text-3xl md:text-4xl mb-4 text-primary">
            Simple, transparent pricing
          </h2>
          <p className="text-base text-gray-500 max-w-lg mx-auto">
            Invest in your career with tools that work. No hidden fees.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          
          {/* 1. Essential (Free) */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-border shadow-soft flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary mb-2">Essential</h3>
              <p className="text-3xl font-display font-bold text-primary">Free</p>
              <p className="text-xs text-gray-400 mt-2">For casual exploration</p>
            </div>
            
            <div className="space-y-4 mb-8 flex-1">
              <FeatureItem text="Basic ATS Score & Evaluation" />
              <FeatureItem text="1 Resume Rewrite Suggestion / day" />
              <FeatureItem text="Hireability Funnel (Preview)" />
              <FeatureItem text="Interview: 3 Sample Questions (No Answers)" />
              <FeatureItem text="Watermarked PDF Exports" muted />
              <FeatureItem text="Proof Generator Locked" locked />
            </div>

            <button 
              onClick={onLogin}
              disabled={user && currentPlan !== 'free'}
              className={`w-full py-3 rounded-xl text-sm font-medium border transition-all ${
                !user || currentPlan === 'free' 
                  ? 'bg-white border-primary text-primary hover:bg-gray-50' 
                  : 'bg-gray-50 border-gray-100 text-gray-400 cursor-default'
              }`}
            >
              {user && currentPlan === 'free' ? 'Current Plan' : 'Start with Basics'}
            </button>
          </div>

          {/* 2. CareerCompass (Student Plan) */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-mint shadow-lift relative flex flex-col h-full transform md:-translate-y-2 z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-mint text-teal-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white shadow-sm">
              Most Popular
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary mb-2">CareerCompass</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-primary">₹{getPrice('compass')}</span>
                <span className="text-sm font-normal text-gray-400">/mo</span>
              </div>
              {!isStudentVerified && (
                <div className="mt-2 text-xs text-gray-400">
                  <span>Students pay </span>
                  <span className="line-through">₹149</span>
                  <span className="font-bold text-teal-600"> ₹59</span>
                </div>
              )}
               {isStudentVerified && (
                <div className="mt-2 text-xs font-medium text-teal-600 bg-mint/20 inline-block px-2 py-0.5 rounded">
                  Student Verified Price
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <FeatureItem text="Full ATS Breakdown" highlighted />
              <FeatureItem text="Daily Resume Rewrites" />
              <FeatureItem text="Full Hireability Funnel" />
              <FeatureItem text="Phase 1 Execution Roadmap" />
              <FeatureItem text="Interview: 5 Sets / day" />
              <FeatureItem text="Proof Generator Preview" />
              <FeatureItem text="Watermarked PDF Exports" muted />
            </div>

            {currentPlan === 'student' ? (
              <button disabled className="w-full py-3 bg-gray-100 text-gray-400 font-medium rounded-xl cursor-default text-sm">
                Current Plan
              </button>
            ) : (
              <div className="space-y-3">
                 <button 
                  onClick={() => onUpgrade('student', getPrice('compass'))}
                  className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-accent transition-all shadow-md hover:shadow-xl text-sm"
                >
                  Start Your CareerPath
                </button>
                {!isStudentVerified && (
                   <button 
                     onClick={onStudentVerify}
                     className="w-full text-xs text-gray-500 hover:text-primary underline decoration-gray-300 underline-offset-2"
                   >
                     Verify ID to save 58%
                   </button>
                )}
              </div>
            )}
          </div>

          {/* 3. CareerPlus (Pro Plan) */}
          <div className="bg-primary text-white p-6 md:p-8 rounded-2xl border border-gray-800 shadow-soft flex flex-col h-full hover:shadow-2xl transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">CareerPlus</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-white">₹{getPrice('plus')}</span>
                <span className="text-sm font-normal text-gray-400">/mo</span>
              </div>
              {!isStudentVerified && (
                <div className="mt-2 text-xs text-gray-500">
                  <span>Students pay </span>
                  <span className="line-through">₹349</span>
                  <span className="font-bold text-gray-300"> ₹149</span>
                </div>
              )}
              {isStudentVerified && (
                <div className="mt-2 text-xs font-medium text-gray-300 bg-white/10 inline-block px-2 py-0.5 rounded">
                  Student Verified Price
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <FeatureItem text="Unlimited ATS & JD Matching" dark />
              <FeatureItem text="Unlimited Interview Sets" dark />
              <FeatureItem text="Full 90-Day Execution Roadmap" dark />
              <FeatureItem text="Proof Generator Unlocked" dark />
              <FeatureItem text="Clean PDF Exports (No Watermark)" dark />
              <FeatureItem text="Weekly Gap Analysis" dark />
            </div>

            {currentPlan === 'pro' ? (
               <button disabled className="w-full py-3 bg-white/10 text-gray-400 font-medium rounded-xl cursor-default text-sm">
                Current Plan
              </button>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => onUpgrade('pro', getPrice('plus'))}
                  className="w-full py-3 bg-white text-primary font-medium rounded-xl hover:bg-gray-100 transition-all shadow-lg text-sm"
                >
                  Unlock CareerPlus
                </button>
                 {!isStudentVerified && (
                   <button 
                     onClick={onStudentVerify}
                     className="w-full text-xs text-gray-500 hover:text-gray-300 underline decoration-gray-700 underline-offset-2"
                   >
                     Verify ID to save 58%
                   </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

const FeatureItem = ({ text, highlighted = false, muted = false, locked = false, dark = false }: { text: string, highlighted?: boolean, muted?: boolean, locked?: boolean, dark?: boolean }) => (
  <div className={`flex items-start gap-3 text-sm ${muted || locked ? 'opacity-60' : ''}`}>
    <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center 
      ${locked 
        ? (dark ? 'bg-white/10 text-gray-500' : 'bg-gray-100 text-gray-400') 
        : (highlighted 
            ? 'bg-mint text-teal-800' 
            : (dark ? 'bg-white text-primary' : 'bg-primary text-white')
          )
      }`}
    >
      {locked ? (
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
      ) : (
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
      )}
    </div>
    <span className={`${dark ? 'text-gray-300' : 'text-gray-600'} ${highlighted ? 'font-medium text-gray-900' : ''}`}>{text}</span>
  </div>
);

export default PricingSection;
