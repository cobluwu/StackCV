
import React from 'react';
import { AnalysisResult } from '../types';

interface ScoreComparisonProps {
  current: AnalysisResult;
  previous: AnalysisResult;
  onDismiss: () => void;
}

const ScoreComparison: React.FC<ScoreComparisonProps> = ({ current, previous, onDismiss }) => {
  // 1. Calculate Score Delta
  const scoreDelta = current.score - previous.score;

  // 2. Red Flags Analysis
  // Fixed: In previous but not in current
  const fixedRedFlags = (previous.redFlags || []).filter(flag => !(current.redFlags || []).includes(flag));
  // New: In current but not in previous
  const newRedFlags = (current.redFlags || []).filter(flag => !(previous.redFlags || []).includes(flag));

  // 3. Keyword Analysis
  // Newly Found: Was missing or extracted, now found
  const newKeywords = current.foundKeywords.filter(k => !previous.foundKeywords.includes(k));

  // If no significant changes, don't render (or render a "No Change" message)
  if (scoreDelta === 0 && fixedRedFlags.length === 0 && newKeywords.length === 0 && newRedFlags.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-brand/20 rounded-[16px] shadow-lift p-6 mb-8 relative animate-slide-up overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-mint/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <button 
        onClick={onDismiss}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
        
        {/* Score Impact */}
        <div className="flex-shrink-0 text-center md:text-left min-w-[120px]">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Impact</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-display font-bold ${scoreDelta >= 0 ? 'text-brand' : 'text-red-500'}`}>
              {scoreDelta > 0 ? '+' : ''}{scoreDelta}
            </span>
            <span className="text-sm font-medium text-gray-500">Points</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {previous.score} <span className="mx-1">→</span> {current.score}
          </div>
        </div>

        {/* Changes Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          {/* Critical Fixes */}
          {(fixedRedFlags.length > 0 || newRedFlags.length > 0) && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                Critical Issues
              </h4>
              <div className="space-y-2">
                {fixedRedFlags.map((flag, i) => (
                  <div key={`fixed-${i}`} className="flex items-start gap-2 text-xs text-gray-600 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
                    <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span><span className="font-semibold text-green-700">Fixed:</span> {flag}</span>
                  </div>
                ))}
                {newRedFlags.map((flag, i) => (
                  <div key={`new-${i}`} className="flex items-start gap-2 text-xs text-gray-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                    <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <span><span className="font-semibold text-red-700">New Issue:</span> {flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Keyword Matches */}
          {newKeywords.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
                New Keyword Matches
              </h4>
              <div className="flex flex-wrap gap-2">
                {newKeywords.map((k, i) => (
                  <span key={i} className="px-2.5 py-1 bg-mint/40 border border-mint text-teal-800 text-[11px] font-medium rounded-md animate-fade-in">
                    + {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fallback if only score changed but no specific flags/keywords (rare but possible via formatting score) */}
          {fixedRedFlags.length === 0 && newKeywords.length === 0 && newRedFlags.length === 0 && (
             <div className="col-span-full flex items-center gap-3 text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
               <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               General optimization detected in formatting or clarity scoring.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreComparison;
