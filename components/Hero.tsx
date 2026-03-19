import React from 'react';

interface HeroProps {
  onTryDemo: () => void;
}

const Hero: React.FC<HeroProps> = ({ onTryDemo }) => {
  return (
    <section className="relative pt-20 pb-16 md:pt-24 md:pb-20 px-4 md:px-6 flex flex-col items-center text-center animate-fade-in overflow-hidden">
      {/* Content */}
      <h1 className="max-w-4xl font-display font-semibold text-3xl md:text-5xl lg:text-6xl leading-tight text-primary mb-6 relative z-10 tracking-tight">
        Boost your resume for the exact job you’re applying to
      </h1>
      
      <p className="max-w-2xl text-base md:text-lg text-gray-500 mb-8 font-light leading-relaxed relative z-10 px-2">
        Paste your resume and job description to explore keyword alignment for screening optimization.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
        <button 
          onClick={() => document.getElementById('product')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-primary text-white px-8 py-3.5 rounded-full font-medium hover:bg-accent transition-all duration-300 shadow-xl shadow-gray-200 hover:shadow-2xl hover:scale-105"
        >
          Get Started Free
        </button>
        <button 
          onClick={onTryDemo}
          className="bg-white text-primary border border-border px-8 py-3.5 rounded-full font-medium hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-brand" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Try Demo
        </button>
      </div>
    </section>
  );
};

export default Hero;