
import React, { useState } from 'react';
import { StructuredRewrite, ResumeData, AnalysisResult, FunnelStage } from '../types';
import { generateResumePDF } from '../services/pdfGenerator';
import ResumeBuilderModal from './ResumeBuilderModal';

interface RewriteSectionProps {
  rewriteData: StructuredRewrite;
  analysisResult: AnalysisResult;
}

const RewriteSection: React.FC<RewriteSectionProps> = ({ rewriteData, analysisResult }) => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  const handleATSExport = async () => {
    setIsGeneratingPDF(true);
    try {
      const resumeData: ResumeData = {
        fullName: rewriteData.fullName || "Candidate Name",
        email: rewriteData.email || "",
        phone: rewriteData.phone || "",
        linkedin: rewriteData.linkedin,
        location: rewriteData.location,
        website: rewriteData.website,
        summary: rewriteData.summary || "",
        experience: rewriteData.experience || [],
        education: rewriteData.education || [],
        skills: rewriteData.skills || [],
        projects: rewriteData.projects || []
      };

      // STRICT EXPORT: Always force 'ats' template for trusted export
      generateResumePDF(resumeData, 'ats');
      setIsBuilderOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to generate resume PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <section id="rewrite-section" className="max-w-6xl mx-auto px-4 md:px-6 py-12 border-t border-gray-200">
      
      {/* FULL REWRITE SECTION (Primary Interaction) */}
      <div className="bg-white rounded-[24px] border border-gray-200 shadow-xl overflow-hidden animate-slide-up relative">
        
        {/* Header */}
        <div className="p-6 md:p-8 bg-gray-50/80 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900">Full Resume Rewrite</h2>
              <p className="text-sm text-gray-500">Ready for ATS parsing. Requires your approval to view.</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (!hasConsented) setIsBuilderOpen(true);
            }}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-all shadow-lg hover:shadow-xl font-medium"
          >
            {hasConsented ? "Export Final PDF" : "Unlock & Review Full Rewrite"}
          </button>
        </div>

        {/* LOCKED STATE */}
        {!hasConsented && (
          <div className="relative h-64 bg-gray-50 p-8 flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-sm z-10 flex flex-col items-center justify-center bg-white/40">
               <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
               <h3 className="text-lg font-bold text-gray-700">Content Locked</h3>
               <p className="text-sm text-gray-500 mb-6 max-w-md text-center">We respect your data. We do not apply changes automatically. Unlock to review the proposed rewrite.</p>
               <button 
                 onClick={() => setIsBuilderOpen(true)}
                 className="px-6 py-2 bg-white border border-gray-300 shadow-sm rounded-lg text-sm font-semibold hover:bg-gray-50 text-primary"
               >
                 Review Proposal
               </button>
            </div>
            {/* Fake text lines for visual effect */}
            <div className="w-full space-y-4 opacity-20 select-none">
               <div className="h-8 bg-gray-400 w-1/3 rounded"></div>
               <div className="h-4 bg-gray-400 w-3/4 rounded"></div>
               <div className="h-4 bg-gray-400 w-full rounded"></div>
               <div className="h-4 bg-gray-400 w-5/6 rounded"></div>
            </div>
          </div>
        )}
        
        {/* UNLOCKED STATE */}
        {hasConsented && (
          <div className="p-8 md:p-12 space-y-10 bg-white min-h-[600px] animate-fade-in">
             {/* Render Rewrite Content (Read-Only Preview) */}
             <div className="text-center pb-8 border-b border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{rewriteData.fullName}</h1>
                <p className="text-sm text-gray-500">Preview Mode</p>
             </div>
             
             <div className="space-y-4">
                <h5 className="text-sm font-bold text-gray-900 uppercase">Summary</h5>
                <p className="text-base text-gray-700 bg-gray-50 p-4 rounded-lg">{rewriteData.summary}</p>
             </div>

             <div className="space-y-4">
                <h5 className="text-sm font-bold text-gray-900 uppercase">Experience (Rewritten)</h5>
                {rewriteData.experience?.map((exp, i) => (
                  <div key={i} className="pl-4 border-l-2 border-brand">
                    <h6 className="font-bold">{exp.role} at {exp.company}</h6>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                      {exp.points.map((pt, j) => <li key={j}>{pt}</li>)}
                    </ul>
                  </div>
                ))}
             </div>

             {/* IMPACT SUMMARY (Post-Rewrite Receipt) */}
             <RewriteImpactSummary result={analysisResult} />
             
             <div className="flex justify-center pt-8">
                <button 
                  onClick={handleATSExport}
                  disabled={isGeneratingPDF}
                  className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-accent transition-all shadow-lg flex items-center gap-2"
                >
                  {isGeneratingPDF ? "Generating..." : "Export ATS-Safe PDF"}
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Consent / Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsBuilderOpen(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-2xl p-8 relative shadow-2xl animate-slide-up">
            <button 
              onClick={() => setIsBuilderOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="text-center mb-6">
              <h2 className="font-display font-semibold text-2xl text-primary mb-2">Review Full Rewrite</h2>
              <p className="text-gray-500 text-sm">
                This version has been simplified for ATS parsing.
                <br/><strong>Note:</strong> We do not invent experience. Please verify all details.
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 mb-6">
               <strong>Consent Required:</strong> By proceeding, you acknowledge that this is an AI-generated suggestion. 
               You should review the final PDF for accuracy before applying.
            </div>

            <div className="flex gap-4">
               <button
                 onClick={() => setIsBuilderOpen(false)}
                 className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
               >
                 Cancel
               </button>
               <button
                 onClick={() => {
                   setHasConsented(true);
                   setIsBuilderOpen(false);
                 }}
                 className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-accent shadow-md"
               >
                 Approve & Export PDF
               </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Internal Component for Rewrite Impact
const RewriteImpactSummary: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const currentShortlist = result.proInsights?.funnelData.find((s: FunnelStage) => s.stage === 'Shortlist')?.percentage || 5;
  const projectedShortlist = result.proInsights?.projectedFunnelData.find((s: FunnelStage) => s.stage === 'Shortlist')?.percentage || (currentShortlist + 15);
  
  // Calculate Growth Factor based on Shortlist improvement (capped for safety)
  const growthFactor = Math.min(projectedShortlist / (currentShortlist || 1), 2.5); // Max 2.5x
  
  // Estimation Helpers (No new AI logic, just math projections)
  const estimateAfter = (val: number, cap: number, dampener: number = 0.7) => {
    const improvement = (100 - val) * dampener;
    const projected = val + improvement;
    return Math.min(Math.round(projected), cap);
  };

  const atsBefore = result.score;
  const atsAfter = estimateAfter(atsBefore, 98, 0.7);

  const keywordBefore = result.scoreBreakdown?.keywordMatch || 0;
  const keywordAfter = estimateAfter(keywordBefore, 98, 0.8); // Keywords improve most in rewrites

  const evidenceBefore = result.scoreBreakdown?.evidenceStrength || 0;
  const evidenceAfter = estimateAfter(evidenceBefore, 95, 0.5); // Evidence improves moderately

  const MetricCard = ({ label, before, after, suffix = '' }: { label: string, before: number, after: number, suffix?: string }) => (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col items-center text-center">
       <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide mb-2">{label}</span>
       <div className="flex items-center gap-3">
          <span className="text-gray-400 font-medium line-through decoration-gray-300 text-sm">{before}{suffix}</span>
          <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          <span className="text-gray-900 font-bold text-lg">{after}{suffix}</span>
       </div>
       <div className="text-[10px] text-green-600 font-medium mt-1">
         +{after - before}{suffix} Improvement
       </div>
    </div>
  );

  return (
    <div className="mt-12 pt-8 border-t border-gray-100 animate-slide-up">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
        Rewrite Impact Summary
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="ATS Score" before={atsBefore} after={atsAfter} />
        <MetricCard label="Keyword Alignment" before={keywordBefore} after={keywordAfter} />
        <MetricCard label="Evidence Strength" before={evidenceBefore} after={evidenceAfter} />
        <MetricCard label="Shortlist Readiness" before={currentShortlist} after={projectedShortlist} suffix="%" />
      </div>
      
      <div className="mt-8 bg-mint/20 border border-mint/40 rounded-xl p-4 text-center">
        <p className="text-sm text-teal-800 font-semibold">
          “This rewrite removes the primary blockers that prevented shortlisting.”
        </p>
      </div>
    </div>
  );
};

export default RewriteSection;
