
import React, { useState } from 'react';
import { TemplateType } from '../types';

interface ResumeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (template: TemplateType) => Promise<void>;
  isGenerating: boolean;
}

const ResumeBuilderModal: React.FC<ResumeBuilderModalProps> = ({ 
  isOpen, 
  onClose, 
  onGenerate, 
  isGenerating 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');

  if (!isOpen) return null;

  const templates: {id: TemplateType, name: string, color: string, desc: string}[] = [
    { 
      id: 'modern', 
      name: 'Modern', 
      color: 'bg-blue-50 border-blue-200',
      desc: 'Clean layout with a sidebar and blue accents. Best for tech and corporate roles.'
    },
    { 
      id: 'minimalist', 
      name: 'Minimalist', 
      color: 'bg-gray-50 border-gray-200',
      desc: 'Classic black & white, single column. ATS-friendly and academic.'
    },
    { 
      id: 'creative', 
      name: 'Creative', 
      color: 'bg-mint/20 border-mint',
      desc: 'Bold header with teal accents. Great for design, marketing, and startups.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-2xl rounded-2xl p-8 relative shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="font-display font-semibold text-2xl text-primary mb-2">Build Your Resume</h2>
          <p className="text-gray-500 text-sm">Select a professional template. We'll auto-fill it with your optimized content using AI.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {templates.map((t) => (
            <div 
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`
                cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 flex flex-col h-full
                ${selectedTemplate === t.id ? `border-primary ring-1 ring-primary shadow-lg scale-[1.02]` : 'border-transparent bg-gray-50 hover:bg-gray-100'}
              `}
            >
              <div className={`w-full h-32 mb-4 rounded-md ${t.color} relative overflow-hidden`}>
                 {/* Abstract visual of template */}
                 {t.id === 'modern' && (
                   <div className="w-full h-full flex">
                     <div className="w-1/3 h-full bg-blue-100/50"></div>
                     <div className="w-2/3 h-full bg-white"></div>
                   </div>
                 )}
                 {t.id === 'minimalist' && (
                   <div className="w-full h-full bg-white flex flex-col items-center justify-start pt-4 px-4">
                     <div className="w-1/2 h-2 bg-gray-200 mb-2"></div>
                     <div className="w-3/4 h-1 bg-gray-100 mb-4"></div>
                     <div className="w-full h-px bg-gray-200"></div>
                   </div>
                 )}
                 {t.id === 'creative' && (
                   <div className="w-full h-full bg-white">
                      <div className="w-full h-8 bg-mint/40"></div>
                   </div>
                 )}
                 
                 {selectedTemplate === t.id && (
                   <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                     <div className="bg-white rounded-full p-1 shadow-sm">
                       <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                     </div>
                   </div>
                 )}
              </div>
              <h3 className="font-semibold text-sm mb-1">{t.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => onGenerate(selectedTemplate)}
          disabled={isGenerating}
          className={`
            w-full py-4 rounded-xl font-medium text-white shadow-lg transition-all flex items-center justify-center gap-2
            ${isGenerating ? 'bg-gray-400 cursor-wait' : 'bg-primary hover:bg-accent hover:scale-[1.01]'}
          `}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Structuring Data & Generating PDF...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>Download Resume PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResumeBuilderModal;
