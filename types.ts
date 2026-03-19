
export interface GrammarIssue {
  original: string;
  correction: string;
  reason: string;
  type: 'spelling' | 'grammar' | 'tone';
}

export interface PortfolioBlueprint {
  access: 'unlocked' | 'locked';
  projectName: string;
  businessProblem: string;
  projectObjective: string;
  whyThisProjectMatters: string;
  skillProof: string[];
  techStack: string[];
  deliverables: string[];
  resumeBullets: string[];
  interviewTalkingPoints: string[];
  difficultyLevel: string;
  timeToComplete: string;
}

export interface FunnelStage {
  stage: string; // 'ATS Pass', 'Recruiter Scan', 'Shortlist', 'Interview'
  percentage: number;
}

export interface FixAction {
  action: string;
  stageFixed: string;
  impact: string; // e.g., "+15% Shortlist"
}

export interface RoadmapItem {
  action: string;
  stageFixed: string;
  why: string;
}

export interface RoadmapPhases {
  phase1: RoadmapItem[]; // 0-14 Days
  phase2: RoadmapItem[]; // 15-45 Days
  phase3: RoadmapItem[]; // 45-90 Days
}

export interface FutureFitInsights {
  // Funnel Data
  funnelData: FunnelStage[];
  projectedFunnelData: FunnelStage[];
  dropOffStage: string;
  
  // Analysis
  whyDropHere: string[]; // 2-4 reasons for the drop
  
  // Fixes
  fixPriorities: FixAction[];
  
  // Proof Project (Rename of PortfolioBlueprint usage)
  proofProject?: PortfolioBlueprint;
  
  // Roadmap
  executionRoadmap?: RoadmapPhases;
}

export interface RewrittenExperience {
  role: string;
  company: string;
  duration: string;
  points: string[];
}

export interface StructuredRewrite {
  // Full Resume Structure
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  location?: string;
  website?: string;
  summary: string;
  experience: RewrittenExperience[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  skills: string[];
  projects?: {
    name: string;
    description: string;
  }[];
}

export interface ScoreBreakdown {
  keywordMatch: number;
  skillExperienceMatch: number;
  formattingCompliance: number;
  seniorityAlignment: number;
  educationMatch: number;
  languageClarity: number;
  evidenceStrength?: number;
}

export interface InterviewSTAR {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface InterviewQuestion {
  difficulty: string; // "Foundational Understanding" | "Applied Competency" | etc.
  question: string;
  answerSummary: string;
  STAR?: InterviewSTAR; // Optional for free tier, mandatory for Student/Pro
}

export interface InterviewSet {
  setNumber: number;
  questions: InterviewQuestion[];
}

export interface InterviewPrepResponse {
  tier: 'free' | 'student' | 'pro';
  setNumber?: number; // For flat structure if needed, or derived
  questions?: InterviewQuestion[]; // For flat structure return
  sets?: InterviewSet[]; // For legacy or multi-set return
  pdfExportText?: string;
  limitNote?: string;
  dailyQuota?: string;
  refreshHint?: string;
}

export interface RejectionReason {
  severity: 'Critical' | 'Moderate' | 'Minor';
  reason: string;
}

export interface AnalysisResult {
  score: number;
  scoreBreakdown?: ScoreBreakdown;
  summaryFeedback?: string; 
  redFlags?: string[];
  rejectionAnalysis?: RejectionReason[];
  extractedKeywords: string[];
  foundKeywords: string[];
  missingKeywords: string[];
  suggestedBullets: string[];
  resumeRewrite?: StructuredRewrite; 
  proInsights?: FutureFitInsights;   
  grammarAnalysis?: GrammarIssue[]; 
}

export interface AnalysisHistoryItem {
  id: string;
  date: string; // ISO String
  result: AnalysisResult;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export enum TabOption {
  EXTRACTED = 'Extracted',
  FOUND = 'Found',
  MISSING = 'Missing',
  SUGGESTED = 'Suggested',
  GRAMMAR = 'Grammar Check',
  REWRITE = 'Resume Rewrite',
  INSIGHTS = 'FutureFit',
  INTERVIEW = 'Interview Prep'
}

export type PlanType = 'free' | 'pro' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: PlanType;
  credits: {
    count: number;
    limit: number;
    period: 'day' | 'month';
    lastReset: string; // ISO String
  };
  isStudentVerified: boolean;
  history?: AnalysisHistoryItem[];
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  location?: string;
  website?: string;
  summary: string;
  experience: {
    role: string;
    company: string;
    duration: string;
    points: string[];
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  skills: string[];
  projects?: {
    name: string;
    description: string;
  }[];
}

export type TemplateType = 'modern' | 'minimalist' | 'creative' | 'ats';
