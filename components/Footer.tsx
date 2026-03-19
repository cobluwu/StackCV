import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 bg-white border-t border-border">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-gray-400 text-sm font-light">
          Designed for Indian students applying to internships, fresher roles and off-campus opportunities.
        </p>
        <div className="mt-6 flex justify-center space-x-6">
           <a href="#" className="text-gray-300 hover:text-gray-500 text-xs">Terms</a>
           <a href="#" className="text-gray-300 hover:text-gray-500 text-xs">Privacy</a>
           <a href="#" className="text-gray-300 hover:text-gray-500 text-xs">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;