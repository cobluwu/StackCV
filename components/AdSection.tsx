import React from 'react';

const AdSection: React.FC = () => {
  return (
    <section className="py-8 bg-transparent flex justify-center w-full">
      <div className="w-full max-w-4xl px-6 flex flex-col items-center">
        {/* Subtle Label */}
        <span className="text-[10px] font-semibold tracking-widest text-gray-300 uppercase mb-3 select-none">
          Advertisement
        </span>
        
        {/* Ad Container */}
        <div className="w-full bg-white/50 backdrop-blur-sm border border-border/60 rounded-lg flex items-center justify-center relative overflow-hidden min-h-[120px] transition-all duration-300 hover:bg-white hover:shadow-soft group">
          
          {/* Subtle placeholder pattern (removes when ad loads over it) */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
          
          {/* Placeholder Text - Replace this block with your Ad Unit Code */}
          <div className="text-gray-300 text-xs font-medium z-10 flex flex-col items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
            <span className="uppercase tracking-wide text-[10px]">Sponsored Space</span>
            <span className="font-light">Place your ad code here</span>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AdSection;