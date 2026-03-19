import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      
      {/* Soft Radial Glow - Pulsing */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(221,248,240,0.4),rgba(255,255,255,0)_70%)] opacity-50 blur-3xl animate-pulse-slow" />
      
      {/* Vector Graphics */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Grid Pattern */}
          <pattern id="grid-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
          </pattern>
          
          {/* Gradient for Lines */}
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E3E3E3" stopOpacity="0" />
              <stop offset="50%" stopColor="#CCCCCC" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E3E3E3" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mint-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DDF8F0" stopOpacity="0" />
              <stop offset="50%" stopColor="#99F6E4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#DDF8F0" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Background Grid with Fade Mask */}
        <rect 
          width="100%" 
          height="100%" 
          fill="url(#grid-pattern)" 
          style={{ 
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', 
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' 
          }} 
        />
        
        {/* Concentric Circles representing 'Targeting/Alignment' - Positioned relative to top */}
        <g className="opacity-60" transform="translate(0, -50)">
            {/* Rotating Dashed Circle */}
            <g className="origin-center animate-spin-slow" style={{ transformBox: 'fill-box' }}>
              <circle cx="50%" cy="50%" r="200" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="6 6" />
            </g>
            {/* Outer Pulse Circle */}
            <circle cx="50%" cy="50%" r="350" fill="none" stroke="#F3F4F6" strokeWidth="1" className="animate-pulse-slow" />
        </g>

        {/* Abstract Geometric shapes (Rounded squares representing documents) */}
        <g className="opacity-30">
          {/* Left shape */}
          <rect x="15%" y="20%" width="60" height="80" rx="12" stroke="#CBD5E1" strokeWidth="1.5" fill="transparent" transform="rotate(-15, 15%, 20%)" className="animate-float" style={{ animationDuration: '12s' }} />
          {/* Right shape */}
          <rect x="85%" y="25%" width="50" height="50" rx="10" stroke="#99F6E4" strokeWidth="1.5" fill="transparent" transform="rotate(10, 85%, 25%)" className="animate-float-reverse" style={{ animationDuration: '14s', animationDelay: '1s' }} />
        </g>

        {/* Plus accents for technical feel */}
        <g className="text-gray-200" fill="currentColor">
          <text x="20%" y="15%" fontSize="16" className="opacity-40">+</text>
          <text x="80%" y="10%" fontSize="20" className="opacity-30">+</text>
          <text x="10%" y="60%" fontSize="24" className="opacity-20">+</text>
          <text x="90%" y="50%" fontSize="16" className="opacity-40">+</text>
        </g>
        
        {/* Abstract Flow Curves with Float Animation */}
        <g className="opacity-70">
          {/* Main Flow Line - Floating */}
          <path 
            className="animate-float"
            d="M -100,120 C 200,220 400,80 800,180 S 1400,120 1600,220" 
            fill="none" 
            stroke="url(#line-gradient)" 
            strokeWidth="1.5"
            style={{ animationDuration: '10s' }}
          />
          {/* Secondary Mint Accent Line - Floating Reverse/Delayed */}
          <path 
            className="animate-float-reverse"
            d="M -100,280 C 300,380 500,180 900,280 S 1500,220 1700,320" 
            fill="none" 
            stroke="url(#mint-line-gradient)" 
            strokeWidth="2"
            style={{ animationDuration: '12s', animationDelay: '2s' }}
          />
        </g>

        {/* Decorative Nodes - Independent movement */}
        <g>
          <circle cx="15%" cy="22%" r="2" fill="#E3E3E3" className="animate-float" style={{ animationDuration: '6s' }} />
          <circle cx="85%" cy="28%" r="2" fill="#E3E3E3" className="animate-float-reverse" style={{ animationDuration: '7s' }} />
          <circle cx="50%" cy="18%" r="1.5" fill="#DDF8F0" className="animate-pulse-slow" />
        </g>
      </svg>
    </div>
  );
};

export default Background;