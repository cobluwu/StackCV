import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AnalyzeOverlay: React.FC = () => {
  const { isDemoMode } = useAuth();
  const [nodes, setNodes] = useState<{id: number, x: number, y: number}[]>([]);

  useEffect(() => {
    // Generate random nodes
    const newNodes = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setNodes(newNodes);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
      {isDemoMode && (
        <div className="mb-6 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-semibold animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
          Demo Analysis In Progress
        </div>
      )}
      <div className="relative w-64 h-64 mb-8">
        {/* Simple connecting lines */}
        <svg className="absolute inset-0 w-full h-full text-gray-200" viewBox="0 0 100 100" preserveAspectRatio="none">
           {nodes.map((node, i) => 
             nodes.slice(i + 1, i + 3).map((target, j) => (
               <line 
                 key={`${i}-${j}`}
                 x1={node.x} 
                 y1={node.y} 
                 x2={target.x} 
                 y2={target.y} 
                 stroke="currentColor" 
                 strokeWidth="0.5"
                 className="animate-pulse"
               />
             ))
           )}
        </svg>
        
        {/* Glowing Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute w-2 h-2 bg-accent rounded-full animate-pulse-slow shadow-[0_0_10px_rgba(221,248,240,0.8)]"
            style={{ 
              left: `${node.x}%`, 
              top: `${node.y}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      <p className="font-display text-gray-500 font-medium tracking-wide animate-pulse">
        Analyzing keyword density...
      </p>
    </div>
  );
};

export default AnalyzeOverlay;