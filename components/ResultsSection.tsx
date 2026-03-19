
import React, { useState, useEffect } from 'react';
import { AnalysisResult, TabOption, PlanType, PortfolioBlueprint, RoadmapPhases, RoadmapItem, FunnelStage, InterviewPrepResponse } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { regeneratePortfolioBlueprint, regenerateExecutionRoadmap, generateScoreExplanation, generateInterviewPrep } from '../services/geminiService';
import ScoreComparison from './ScoreComparison';

interface ResultsSectionProps {
  result: AnalysisResult;
  previousResult?: AnalysisResult | null;
  originalResumeText?: string;
  jobDescText?: string;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ result, previousResult, originalResumeText = '', jobDescText = '' }) => {
  const { user, isDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useState<TabOption>(TabOption.MISSING);
  
  // Comparison State
  const [showComparison, setShowComparison] = useState(!!previousResult);

  // Proof Project State
  const [activeProofProject, setActiveProofProject] = useState<PortfolioBlueprint | undefined>(result.proInsights?.proofProject);
  const [isRefreshingProof, setIsRefreshingProof] = useState(false);

  // Execution Roadmap State
  const [roadmapData, setRoadmapData] = useState<RoadmapPhases | undefined>(result.proInsights?.executionRoadmap);
  const [isRefreshingRoadmap, setIsRefreshingRoadmap] = useState(false);

  // Score Explanation State
  const [scoreExplanation, setScoreExplanation] = useState<string | null>(null);
  const [isExplainingScore, setIsExplainingScore] = useState(false);
  
  // Keyword Analysis State
  const [showDetectedSkills, setShowDetectedSkills] = useState(false);

  // Interview Prep State
  const [interviewData, setInterviewData] = useState<InterviewPrepResponse | null>(null);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);

  const plan: PlanType = user?.plan || 'free';

  // Prepare Radar Data - Core Signals Only
  const radarData = [
    { subject: 'Skill Fit', A: result.scoreBreakdown?.skillExperienceMatch || 0, fullMark: 100 },
    { subject: 'Keywords', A: result.scoreBreakdown?.keywordMatch || 0, fullMark: 100 },
    { subject: 'Seniority', A: result.scoreBreakdown?.seniorityAlignment || 0, fullMark: 100 },
    { subject: 'Evidence', A: result.scoreBreakdown?.evidenceStrength || 0, fullMark: 100 },
    { subject: 'Formatting', A: result.scoreBreakdown?.formattingCompliance || 0, fullMark: 100 },
  ];

  const getScoreStatus = (score: number) => {
    if (score >= 85) return { label: 'Strong Match', color: 'text-brand bg-mint/50 border-brand/20' };
    if (score >= 70) return { label: 'Competitive', color: 'text-blue-700 bg-blue-50 border-blue-100' };
    if (score >= 50) return { label: 'Borderline', color: 'text-yellow-700 bg-yellow-50 border-yellow-100' };
    return { label: 'High Rejection Risk', color: 'text-red-700 bg-red-50 border-red-100' };
  };

  const scoreStatus = getScoreStatus(result.score);

  const getQualitativeLabel = (val: number) => {
    if (val >= 80) return { text: "Strong", color: "text-brand" };
    if (val >= 60) return { text: "Moderate", color: "text-yellow-600" };
    return { text: "Below Expected", color: "text-red-500" };
  };

  const getImpactLabel = (text: string) => {
    if (text.includes('%')) {
      const num = parseInt(text.replace(/[^0-9]/g, ''));
      if (!isNaN(num)) {
         if (num >= 20) return "High Impact";
         if (num >= 10) return "Med Impact";
         return "Low Impact";
      }
    }
    return "Fix Required";
  };

  const signals = [
    { name: 'Skill & Experience', val: result.scoreBreakdown?.skillExperienceMatch || 0 },
    { name: 'Keyword Alignment', val: result.scoreBreakdown?.keywordMatch || 0 },
    { name: 'Seniority Match', val: result.scoreBreakdown?.seniorityAlignment || 0 },
    { name: 'Evidence Strength', val: result.scoreBreakdown?.evidenceStrength || 0 },
    { name: 'ATS Structure', val: result.scoreBreakdown?.formattingCompliance || 0 }
  ].sort((a, b) => b.val - a.val);

  const strongestSignal = signals[0];
  const weakestSignal = signals[signals.length - 1];

  // Reset states when result changes
  useEffect(() => {
    setActiveProofProject(result.proInsights?.proofProject);
    setRoadmapData(result.proInsights?.executionRoadmap);
    setScoreExplanation(null);
    setIsExplainingScore(false);
    setShowDetectedSkills(false);
    setActiveTab(TabOption.MISSING);
    setShowComparison(!!previousResult);
    setInterviewData(null);
    setIsGeneratingInterview(false);
  }, [result, previousResult]);

  const handleRegenerateProof = async () => {
    if (!activeProofProject) return;
    setIsRefreshingProof(true);
    try {
      const newProject = await regeneratePortfolioBlueprint(
        originalResumeText,
        jobDescText,
        activeProofProject.projectName
      );
      setActiveProofProject(newProject);
    } catch (e) {
      console.error(e);
      alert("Could not refresh project. Please try again.");
    } finally {
      setIsRefreshingProof(false);
    }
  };

  const handleRefreshRoadmap = async () => {
    if (plan !== 'pro' && !isDemoMode) return;
    setIsRefreshingRoadmap(true);
    try {
      const data = await regenerateExecutionRoadmap(originalResumeText, jobDescText);
      setRoadmapData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingRoadmap(false);
    }
  };

  const handleExplainScore = async () => {
    setIsExplainingScore(true);
    try {
      const explanation = await generateScoreExplanation(result);
      setScoreExplanation(explanation);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExplainingScore(false);
    }
  };

  const handleGenerateInterview = async () => {
    if (!originalResumeText || !jobDescText) {
      alert("Resume and Job Description are required to generate interview questions.");
      return;
    }
    setIsGeneratingInterview(true);
    try {
      const data = await generateInterviewPrep(originalResumeText, jobDescText, plan);
      setInterviewData(data);
    } catch (e) {
      console.error(e);
      alert("Failed to generate interview kit. Please try again.");
    } finally {
      setIsGeneratingInterview(false);
    }
  };
  
  const scrollToRewrite = () => {
    const element = document.getElementById('rewrite-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const tabContentClass = "animate-fade-in";

  const renderContent = () => {
    switch (activeTab) {
      case TabOption.MISSING:
        return (
          <div key="missing" className={`space-y-8 ${tabContentClass}`}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-red-100 text-red-600 rounded-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 className="text-sm font-bold text-gray-900">Missing (High Impact)</h3>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {result.missingKeywords.slice(0, 7).map((k, i) => (
                  <span key={i} className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition-transform hover:scale-105 cursor-default">
                    <span className="text-lg leading-none text-red-400">+</span> {k}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 font-medium">
                Adding these top keywords to your Summary or Experience can significantly boost your score.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <button 
                onClick={() => setShowDetectedSkills(!showDetectedSkills)}
                className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors group"
              >
                <svg className={`w-4 h-4 transition-transform duration-200 text-gray-400 group-hover:text-gray-600 ${showDetectedSkills ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                Show skills detected by ATS
              </button>

              {showDetectedSkills && (
                <div className="mt-6 pl-6 border-l-2 border-gray-100 space-y-6 animate-slide-up">
                   <div>
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Matched Successfully</h4>
                     <div className="flex flex-wrap gap-2">
                       {result.foundKeywords.length > 0 ? result.foundKeywords.map((k, i) => (
                         <span key={i} className="px-2.5 py-1 bg-mint/20 border border-mint/30 rounded text-xs text-teal-800 font-medium">
                           {k}
                         </span>
                       )) : <span className="text-xs text-gray-400 italic">No exact matches found.</span>}
                     </div>
                   </div>

                   <div>
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">All Detected Skills</h4>
                     <div className="flex flex-wrap gap-2">
                       {result.extractedKeywords.length > 0 ? result.extractedKeywords.map((k, i) => (
                         <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500">
                           {k}
                         </span>
                       )) : <span className="text-xs text-gray-400 italic">No skills extracted.</span>}
                     </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        );
      case TabOption.GRAMMAR:
        const issues = result.grammarAnalysis || [];
        if (issues.length === 0) {
           return (
             <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
               <svg className="w-10 h-10 mb-3 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <p className="font-medium">Clean Record!</p>
               <p className="text-sm">No major grammar or tone issues detected.</p>
             </div>
           );
        }
        return (
          <div key="grammar" className={`space-y-4 ${tabContentClass}`}>
            {issues.map((issue, i) => (
              <div key={i} className="p-4 bg-white border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex gap-2 items-center">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide
                       ${issue.type === 'spelling' ? 'bg-red-100 text-red-700' : 
                         issue.type === 'grammar' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                       {issue.type}
                     </span>
                   </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div className="p-3 bg-red-50 rounded-md border border-red-100">
                     <p className="text-xs text-red-500 font-semibold mb-1">Original</p>
                     <p className="text-sm text-gray-700 line-through decoration-red-300">{issue.original}</p>
                  </div>
                  <div className="p-3 bg-mint/20 rounded-md border border-mint/40">
                     <p className="text-xs text-brand font-semibold mb-1">Suggestion</p>
                     <p className="text-sm text-gray-800 font-medium">{issue.correction}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic"><span className="font-medium">Why:</span> {issue.reason}</p>
              </div>
            ))}
          </div>
        );
      case TabOption.INSIGHTS:
        const insights = result.proInsights;
        if (!insights) return (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
            <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="font-medium">No Insights Available</p>
            <p className="text-sm">We couldn't generate deep insights for this analysis.</p>
          </div>
        );

        const currentHireability = insights.funnelData[insights.funnelData.length - 1]?.percentage || 0;
        const targetHireability = insights.projectedFunnelData[insights.projectedFunnelData.length - 1]?.percentage || 0;

        return (
          <div key="insights" className={`${tabContentClass} max-w-2xl mx-auto space-y-12 pb-8`}>
            {/* Hireability Progress Bar */}
            <section className="bg-brand/5 border border-brand/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-brand uppercase tracking-widest">Hireability Progress</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold text-brand">{currentHireability}%</span>
                  <span className="text-xs text-gray-400 font-medium">/ 100%</span>
                </div>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-brand transition-all duration-1000 ease-out z-10"
                  style={{ width: `${currentHireability}%` }}
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-brand/30 transition-all duration-1000 delay-500 ease-out"
                  style={{ width: `${targetHireability}%` }}
                />
              </div>
              <div className="flex justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand rounded-full" />
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Current State</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand/30 rounded-full" />
                  <span className="text-[10px] text-brand uppercase font-bold tracking-wider">Target (Post-Fixes)</span>
                </div>
              </div>
            </section>

            {/* 1. Funnel Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-semibold text-gray-900">Hireability Funnel</h3>
                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 uppercase tracking-widest">
                  Drop-off at {insights.dropOffStage}
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-2 h-24 items-end">
                {insights.funnelData.map((stage, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group relative">
                    <div 
                      className="w-full bg-gray-100 rounded-t-lg transition-all duration-500 group-hover:bg-gray-200" 
                      style={{ height: `${stage.percentage}%` }}
                    >
                      <div 
                        className="absolute bottom-0 left-0 w-full bg-brand/40 rounded-t-lg transition-all duration-700 delay-300"
                        style={{ height: `${insights.projectedFunnelData[i]?.percentage || 0}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter text-center leading-none h-6 flex items-center">
                      {stage.stage}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Current: {stage.percentage}% | Projected: {insights.projectedFunnelData[i]?.percentage}%
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                <h4 className="text-xs font-bold text-red-800 uppercase tracking-widest mb-2">Why the drop-off?</h4>
                <ul className="space-y-2">
                  {insights.whyDropHere.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-red-700">
                      <span className="mt-1 w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 2. Fix Priorities */}
            <section className="space-y-4">
              <h3 className="text-lg font-display font-semibold text-gray-900">High-Impact Fixes</h3>
              <div className="grid gap-3">
                {insights.fixPriorities.map((fix, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand/10 text-brand rounded-lg flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{fix.action}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Fixes {fix.stageFixed}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-brand">{fix.impact}</span>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Est. Impact</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Proof Project */}
            {activeProofProject && (
              <section className="space-y-6 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-display font-semibold text-gray-900">Proof Project: {activeProofProject.projectName}</h3>
                  <button 
                    onClick={handleRegenerateProof}
                    disabled={isRefreshingProof}
                    className="text-[10px] font-bold text-brand hover:text-teal-700 uppercase tracking-widest flex items-center gap-1"
                  >
                    {isRefreshingProof ? 'Regenerating...' : 'Regenerate'}
                    <svg className={`w-3 h-3 ${isRefreshingProof ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  </button>
                </div>

                <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                     <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                   </div>
                   
                   <div className="relative z-10 space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-2">Business Problem</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{activeProofProject.businessProblem}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-2">Technical Proof</p>
                          <ul className="space-y-1.5">
                            {activeProofProject.skillProof.map((s, i) => (
                              <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                                <span className="w-1 h-1 bg-brand rounded-full" /> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-2">Deliverables</p>
                          <ul className="space-y-1.5">
                            {activeProofProject.deliverables.map((d, i) => (
                              <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                                <span className="w-1 h-1 bg-brand rounded-full" /> {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 text-center">Resume Bullets to Add After Completion</p>
                         <div className="space-y-2">
                            {activeProofProject.resumeBullets.map((b, i) => (
                              <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-gray-300 italic">
                                "{b}"
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              </section>
            )}

            {/* 4. Execution Roadmap */}
            {roadmapData && (
              <section className="space-y-6 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-display font-semibold text-gray-900">90-Day Execution Roadmap</h3>
                  <button 
                    onClick={handleRefreshRoadmap}
                    disabled={isRefreshingRoadmap}
                    className="text-[10px] font-bold text-brand hover:text-teal-700 uppercase tracking-widest flex items-center gap-1"
                  >
                    {isRefreshingRoadmap ? 'Regenerating...' : 'Regenerate'}
                    <svg className={`w-3 h-3 ${isRefreshingRoadmap ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  </button>
                </div>

                <div className="space-y-8 relative before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-100">
                  {/* Phase 1 */}
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold text-xs z-10 shadow-md">1</div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Phase 1: 0-14 Days (Unblock Funnel)</h4>
                    <div className="grid gap-3">
                      {roadmapData.phase1.map((item, i) => <RoadmapCard key={i} item={item} />)}
                    </div>
                  </div>

                  {/* Phase 2 */}
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs z-10 shadow-md">2</div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Phase 2: 15-45 Days (Strengthen Proof)</h4>
                    <div className="grid gap-3">
                      {roadmapData.phase2.map((item, i) => <RoadmapCard key={i} item={item} />)}
                    </div>
                  </div>

                  {/* Phase 3 */}
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-xs z-10 shadow-md">3</div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Phase 3: 45-90 Days (Optimization)</h4>
                    <div className="grid gap-3">
                      {roadmapData.phase3.map((item, i) => <RoadmapCard key={i} item={item} />)}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        );

      case TabOption.INTERVIEW:
        return (
          <div key="interview" className={`${tabContentClass} space-y-8`}>
            {!interviewData && !isGeneratingInterview && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </div>
                <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">Interview Intelligence</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                  Generate 4 high-signal interview questions tailored to your resume and the target job description.
                </p>
                <button 
                  onClick={handleGenerateInterview}
                  className="px-8 py-3 bg-brand text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center gap-2"
                >
                  Generate Interview Kit
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </button>
              </div>
            )}

            {isGeneratingInterview && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium text-gray-600">Simulating Recruiter Logic...</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Analyzing Seniority & JD Fit</p>
              </div>
            )}

            {interviewData && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-lg font-display font-semibold text-gray-900">Interview Prep Kit</h3>
                    <p className="text-xs text-gray-500">{interviewData.limitNote || "Tailored for your seniority level."}</p>
                  </div>
                  {plan === 'pro' && (
                    <button 
                      onClick={handleGenerateInterview}
                      className="text-xs font-bold text-brand hover:text-teal-700 flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                      Refresh Questions
                    </button>
                  )}
                </div>

                <div className="grid gap-6">
                  {interviewData.questions?.map((q, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-brand/20 transition-all group">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-widest">
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-bold text-gray-300">#{idx + 1}</span>
                      </div>
                      
                      <h4 className="text-base font-bold text-gray-900 mb-4 leading-snug group-hover:text-brand transition-colors">
                        {q.question}
                      </h4>

                      <div className="space-y-4 pt-4 border-t border-gray-50">
                        {/* Answer Summary */}
                        <div className={(plan === 'free' && !isDemoMode) ? 'filter blur-[3px] select-none pointer-events-none opacity-50' : ''}>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Recruiter-Aligned Answer</p>
                          <p className="text-sm text-gray-700 leading-relaxed font-medium">
                            {q.answerSummary}
                          </p>
                        </div>

                        {/* STAR Breakdown for Pro */}
                        {(plan === 'pro' || isDemoMode) && q.STAR && (
                          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                            <div className="space-y-3">
                              <div>
                                <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-1">Situation</p>
                                <p className="text-xs text-gray-600">{q.STAR.situation}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-1">Task</p>
                                <p className="text-xs text-gray-600">{q.STAR.task}</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-1">Action</p>
                                <p className="text-xs text-gray-600">{q.STAR.action}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-1">Result</p>
                                <p className="text-xs text-gray-600">{q.STAR.result}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Upgrade CTA for Free */}
                        {plan === 'free' && !isDemoMode && (
                          <div className="mt-2 text-center">
                            <button 
                              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                              className="text-xs font-bold text-brand hover:underline underline-offset-4"
                            >
                              Unlock Answer & STAR Guide
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {interviewData.dailyQuota && (
                  <div className="text-center pt-4">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                      Daily Quota: {interviewData.dailyQuota}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 animate-slide-up">
      {isDemoMode && (
        <div className="mb-8 flex justify-center">
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-bold flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            Demo Mode: Using Simulated Analysis Results
          </div>
        </div>
      )}
      
      {showComparison && previousResult && (
        <ScoreComparison 
          current={result} 
          previous={previousResult} 
          onDismiss={() => setShowComparison(false)} 
        />
      )}

      {/* Red Flags Alert */}
      {result.redFlags && result.redFlags.length > 0 && !result.rejectionAnalysis && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4 animate-fade-in shadow-sm">
           <div className="p-2 bg-red-100 text-red-600 rounded-full flex-shrink-0">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
           </div>
           <div className="flex-1">
             <h4 className="text-red-800 font-semibold text-sm">Critical Issues Detected</h4>
             <ul className="mt-1 list-disc list-inside text-xs text-red-700 space-y-0.5">
               {result.redFlags.map((flag, idx) => (
                 <li key={idx}>{flag}</li>
               ))}
             </ul>
           </div>
        </div>
      )}

      {/* NEW: ATS Radar Overview Section */}
      <div className="bg-white rounded-[16px] border border-gray-200 shadow-soft p-6 mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-display font-semibold text-gray-900">ATS Match Score</h2>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">Recruiter-aligned score based on role fit, evidence, and seniority.</p>
          </div>
          <div className={`px-4 py-2 rounded-xl border flex items-center justify-center gap-3 ${scoreStatus.color} md:self-start`}>
             <span className="text-sm font-bold uppercase tracking-wide">{scoreStatus.label}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Radar Chart */}
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                cx="50%" 
                cy="50%" 
                outerRadius="60%" 
                data={radarData}
                margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
              >
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="ATS Score"
                  dataKey="A"
                  stroke="#00C4A7"
                  strokeWidth={2}
                  fill="#00C4A7"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-2xl font-bold text-brand">{result.score}</span>
              <span className="text-[10px] text-gray-400 block">SCORE</span>
            </div>
          </div>

          {/* Breakdown & Upgrade Box */}
          <div className="flex flex-col h-full space-y-4">
            
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">What’s Helping / Holding Back</h4>
               <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-700">{strongestSignal.name}</span>
                  </div>
                  <span className={`text-xs font-bold ${getQualitativeLabel(strongestSignal.val).color}`}>
                    {getQualitativeLabel(strongestSignal.val).text}
                  </span>
               </div>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                    <span className="text-sm font-medium text-gray-700">{weakestSignal.name}</span>
                  </div>
                  <span className={`text-xs font-bold ${getQualitativeLabel(weakestSignal.val).color}`}>
                    {getQualitativeLabel(weakestSignal.val).text}
                  </span>
               </div>
            </div>

             <button
               onClick={scrollToRewrite}
               className="w-full group relative flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
             >
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/10 rounded-lg">
                   <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                 </div>
                 <div className="text-left">
                   <div className="text-sm font-bold">View AI Resume Rewrite</div>
                   <div className="text-[10px] text-gray-300">Recruiter-ready version</div>
                 </div>
               </div>
               <svg className="w-5 h-5 text-gray-400 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
             </button>

            {!scoreExplanation && !isExplainingScore && (
              <div className="text-center md:text-right pt-2">
                <button 
                  onClick={handleExplainScore}
                  className="text-xs font-medium text-brand hover:text-teal-700 underline decoration-dashed underline-offset-4"
                >
                  Ask Coach to explain score
                </button>
              </div>
            )}

            {isExplainingScore && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center gap-2">
                 <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-xs text-gray-500 font-medium">Analyzing factors...</span>
              </div>
            )}

            {scoreExplanation && (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative animate-fade-in">
                 <div className="absolute -top-2 left-4 w-4 h-4 bg-indigo-50 border-t border-l border-indigo-100 transform rotate-45"></div>
                 <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-1 flex items-center gap-1">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   Coach's Insight
                 </h4>
                 <p className="text-xs text-indigo-900 leading-relaxed">
                   {scoreExplanation}
                 </p>
                 <button 
                   onClick={() => setScoreExplanation(null)}
                   className="absolute top-2 right-2 text-indigo-300 hover:text-indigo-500"
                 >
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
              </div>
            )}

            {plan === 'free' && !isDemoMode && (
              <div className="mt-auto bg-[#DFF8F4] border border-[#A5E6D8] rounded-[16px] p-6 text-center">
                <h3 className="font-semibold text-gray-800 text-sm mb-1">Unlock Hireability Funnel</h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  See where you drop off and get a 90-day execution roadmap.
                </p>
                <button 
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[#00C4A7] hover:bg-[#00A088] text-white rounded-xl py-2.5 w-full text-sm font-medium transition-colors shadow-sm"
                >
                  Upgrade for Funnel Analysis
                </button>
                <p className="text-[10px] text-gray-400 mt-2">Try once before upgrading (Student Plan)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {result.rejectionAnalysis && result.rejectionAnalysis.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-[16px] p-6 mb-8 md:mb-12 shadow-sm animate-fade-in relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
             <svg className="w-32 h-32 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
           </div>

           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2.5 bg-red-100 text-red-600 rounded-full">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               </div>
               <div>
                 <h2 className="text-lg md:text-xl font-display font-semibold text-gray-900">Why This Resume Gets Rejected</h2>
                 <p className="text-xs md:text-sm text-gray-500">Recruiter perspective on disqualifying factors.</p>
               </div>
             </div>

             <div className="grid gap-3">
               {result.rejectionAnalysis.map((item, idx) => (
                 <div key={idx} className="flex items-start gap-4 p-4 bg-white border border-red-100/50 rounded-xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                        ${item.severity === 'Critical' ? 'bg-red-100 text-red-700' : 
                          item.severity === 'Moderate' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.severity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">{item.reason}</p>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      )}

      {/* Tabs Section */}
      <div className="bg-white rounded-[16px] border border-gray-200 shadow-soft min-h-[400px] flex flex-col">
        <div className="flex border-b border-gray-100 px-4 md:px-6 pt-4 overflow-x-auto no-scrollbar">
          {Object.values(TabOption)
            .filter(tab => tab !== TabOption.EXTRACTED && tab !== TabOption.FOUND && tab !== TabOption.REWRITE && tab !== TabOption.SUGGESTED)
            .map((tab) => {
            let displayLabel = tab as string;
            if (tab === TabOption.INSIGHTS) displayLabel = "FutureFit";

            return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 md:px-6 text-sm font-medium transition-all duration-300 relative whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
                activeTab === tab ? 'text-brand' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {displayLabel}
              <span 
                className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-brand transform transition-transform duration-300 ease-out ${
                  activeTab === tab ? 'scale-x-100' : 'scale-x-0'
                }`} 
              />
            </button>
          )})}
        </div>
        <div className="p-6 md:p-8 flex-1">
          {renderContent()}
        </div>
      </div>
    </section>
  );
};

// Helper Component for Roadmap Items
const RoadmapCard: React.FC<{ item: RoadmapItem }> = ({ item }) => (
   <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start mb-2">
         <h5 className="text-sm font-semibold text-gray-900">{item.action}</h5>
         <span className="text-[10px] font-bold bg-mint/30 text-teal-800 px-2 py-0.5 rounded border border-mint/50">
            Fixes {item.stageFixed}
         </span>
      </div>
      <p className="text-xs text-gray-500">{item.why}</p>
   </div>
);

export default ResultsSection;
