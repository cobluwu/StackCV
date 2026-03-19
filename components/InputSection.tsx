
import React, { useRef, useState, useEffect } from 'react';
import { parseFile, validateResumeContent, validateJDContent, ResumeMetadata, JDMetadata } from '../services/fileParser';
import { SAMPLE_RESUME, SAMPLE_JD } from '../constants/sampleData';
import { useAuth } from '../context/AuthContext';

interface InputSectionProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescText: string;
  setJobDescText: (text: string) => void;
  onAnalyze: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  resumeText,
  setResumeText,
  jobDescText,
  setJobDescText,
  onAnalyze
}) => {
  const { isDemoMode } = useAuth();
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const jdInputRef = useRef<HTMLInputElement>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isParsingJD, setIsParsingJD] = useState(false);
  
  const [resumeMeta, setResumeMeta] = useState<ResumeMetadata | null>(null);
  const [jdMeta, setJdMeta] = useState<JDMetadata | null>(null);

  const handleUseSampleData = () => {
    setResumeText(SAMPLE_RESUME);
    setJobDescText(SAMPLE_JD);
  };

  // Validate on text change
  useEffect(() => {
    if (resumeText) {
      setResumeMeta(validateResumeContent(resumeText));
    } else {
      setResumeMeta(null);
    }
  }, [resumeText]);

  useEffect(() => {
    if (jobDescText) {
      setJdMeta(validateJDContent(jobDescText));
    } else {
      setJdMeta(null);
    }
  }, [jobDescText]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'jd') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setParsing = type === 'resume' ? setIsParsingResume : setIsParsingJD;
    const setText = type === 'resume' ? setResumeText : setJobDescText;

    setParsing(true);
    try {
      const text = await parseFile(file);
      setText(text);
    } catch (error: any) {
      alert(error.message || "Error reading file.");
      console.error(error);
    } finally {
      setParsing(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAnalyzeClick = () => {
    if (resumeMeta && !resumeMeta.isValid) {
      alert("Please fix resume issues before analyzing.");
      return;
    }
    if (jdMeta && !jdMeta.isValid) {
      alert("Please check job description content.");
      return;
    }
    onAnalyze();
  };

  const UploadButton = ({ onClick, isLoading }: { onClick: () => void, isLoading: boolean }) => (
    <button 
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary transition-colors bg-white px-3 py-1.5 rounded-md border border-gray-200 hover:border-gray-300 shadow-sm"
    >
      {isLoading ? (
        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
      )}
      <span>Import File</span>
    </button>
  );

  return (
    <section id="product" className="max-w-6xl mx-auto px-4 md:px-6 py-8 animate-slide-up delay-100">
      <div className="flex justify-between items-center mb-6">
        {isDemoMode && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-medium animate-pulse">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            Demo Mode Active
          </div>
        )}
        <div className="flex-1"></div>
        <button 
          onClick={handleUseSampleData}
          className="flex items-center gap-2 text-xs font-semibold text-brand hover:text-brand/80 transition-all bg-brand/5 px-4 py-2 rounded-full border border-brand/20 hover:border-brand/40 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Use Sample Data for Prototype
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-start">
        {/* Resume Input */}
        <div className="group">
          <div className="flex justify-between items-center mb-3 px-1">
            <label className="text-sm font-semibold text-primary flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Your Resume
            </label>
            <input 
              type="file" 
              ref={resumeInputRef} 
              onChange={(e) => handleFileUpload(e, 'resume')} 
              className="hidden" 
              accept=".pdf,.docx,.txt" 
            />
            <UploadButton onClick={() => resumeInputRef.current?.click()} isLoading={isParsingResume} />
          </div>
          <div className="relative">
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here..."
              className={`w-full h-80 p-5 rounded-xl border bg-white outline-none transition-all resize-none shadow-soft text-sm leading-relaxed text-gray-700 placeholder-gray-400 group-hover:shadow-lift
                ${resumeMeta && !resumeMeta.isValid ? 'border-red-300 ring-1 ring-red-100' : 'border-border focus:ring-2 focus:ring-mint/50 focus:border-mint'}
              `}
              spellCheck="false"
            />
             <div className="absolute bottom-4 right-4 text-xs text-gray-300 pointer-events-none font-medium">
               {resumeText.length > 0 ? `${resumeText.length} chars` : 'PDF / DOCX / TXT'}
             </div>
          </div>
          
          {/* Resume Preview / Validation Feedback */}
          {resumeMeta && (
            <div className={`mt-3 p-3 rounded-lg border text-xs ${resumeMeta.isValid ? 'bg-mint/10 border-mint/20 text-teal-800' : 'bg-red-50 border-red-100 text-red-700'}`}>
               <div className="flex justify-between items-start mb-2">
                 <span className="font-bold uppercase tracking-wide">Resume Check</span>
                 <span className="font-bold">{resumeMeta.isValid ? 'PASS' : 'ISSUES DETECTED'}</span>
               </div>
               
               {resumeMeta.issues.length > 0 && (
                 <ul className="list-disc list-inside mb-2 space-y-0.5">
                   {resumeMeta.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                 </ul>
               )}
               
               {resumeMeta.isValid && (
                 <div className="flex gap-4 text-gray-600">
                    <div>
                      <span className="block font-bold text-gray-900">{resumeMeta.sections.length}</span>
                      Sections
                    </div>
                    <div>
                      <span className="block font-bold text-gray-900">{resumeMeta.metricsCount}</span>
                      Metrics
                    </div>
                    <div>
                      <span className="block font-bold text-gray-900">{resumeMeta.bulletCount}</span>
                      Bullets
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Job Description Input */}
        <div className="group">
          <div className="flex justify-between items-center mb-3 px-1">
            <label className="text-sm font-semibold text-primary flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Job Description
            </label>
            <input 
              type="file" 
              ref={jdInputRef} 
              onChange={(e) => handleFileUpload(e, 'jd')} 
              className="hidden" 
              accept=".pdf,.docx,.txt" 
            />
            <UploadButton onClick={() => jdInputRef.current?.click()} isLoading={isParsingJD} />
          </div>
          <div className="relative">
            <textarea
              value={jobDescText}
              onChange={(e) => setJobDescText(e.target.value)}
              placeholder="Paste the job description here..."
              className={`w-full h-80 p-5 rounded-xl border bg-white outline-none transition-all resize-none shadow-soft text-sm leading-relaxed text-gray-700 placeholder-gray-400 group-hover:shadow-lift
                ${jdMeta && !jdMeta.isValid ? 'border-red-300 ring-1 ring-red-100' : 'border-border focus:ring-2 focus:ring-mint/50 focus:border-mint'}
              `}
              spellCheck="false"
            />
             <div className="absolute bottom-4 right-4 text-xs text-gray-300 pointer-events-none font-medium">
               {jobDescText.length > 0 ? `${jobDescText.length} chars` : 'Paste Job Details'}
             </div>
          </div>

          {/* JD Preview / Validation Feedback */}
          {jdMeta && (
            <div className={`mt-3 p-3 rounded-lg border text-xs ${jdMeta.isValid ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-red-50 border-red-100 text-red-700'}`}>
               <div className="flex justify-between items-start mb-2">
                 <span className="font-bold uppercase tracking-wide">Job Check</span>
                 <span className="font-bold">{jdMeta.isValid ? 'PASS' : 'ISSUES DETECTED'}</span>
               </div>
               
               {jdMeta.issues.length > 0 && (
                 <ul className="list-disc list-inside mb-2 space-y-0.5">
                   {jdMeta.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                 </ul>
               )}
               
               {jdMeta.isValid && (
                 <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
                    {jdMeta.roleDetected && <div>Role: <span className="font-semibold text-gray-900">{jdMeta.roleDetected}</span></div>}
                    <div>Seniority: <span className="font-semibold text-gray-900">{jdMeta.seniorityDetected}</span></div>
                    <div>Reqs Detected: <span className="font-semibold text-gray-900">{jdMeta.coreRequirementsCount}</span></div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleAnalyzeClick}
          disabled={!resumeText || !jobDescText || (resumeMeta && !resumeMeta.isValid) || (jdMeta && !jdMeta.isValid)}
          className={`
            relative overflow-hidden group px-10 py-4 rounded-full font-medium text-white shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95
            ${(!resumeText || !jobDescText || (resumeMeta && !resumeMeta.isValid) || (jdMeta && !jdMeta.isValid)) ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-primary hover:shadow-2xl'}
          `}
        >
          <span className="relative z-10 flex items-center gap-2">
            Analyze Alignment
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
          {/* Button Shine Effect */}
          {resumeText && jobDescText && (
             <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-[shine_1s_infinite]" />
          )}
        </button>
      </div>
    </section>
  );
};

export default InputSection;
