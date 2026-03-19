import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onLoginClick: () => void;
  onHistoryClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onHistoryClick }) => {
  const { user, logout, isDemoMode, setDemoMode } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div 
            className="font-display font-semibold text-lg tracking-tight text-primary flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            StackCV
            {user?.plan === 'student' && (
               <span className="text-[10px] bg-mint text-primary px-2 py-0.5 rounded-full font-medium tracking-wide uppercase border border-mint/20">Student</span>
            )}
          </div>

          {/* Demo Mode Toggle */}
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <button 
              onClick={() => setDemoMode(!isDemoMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                isDemoMode 
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105' 
                  : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
              {isDemoMode ? 'Demo Active' : 'Demo Mode'}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
          <button onClick={() => scrollToSection('product')} className="hover:text-primary transition-colors duration-200">Product</button>
          <button onClick={() => scrollToSection('pricing')} className="hover:text-primary transition-colors duration-200">Pricing</button>
          
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
              <div className="flex flex-col items-end mr-2">
                <span className="text-xs font-semibold text-primary">{user.credits.count} scans left</span>
                <span className="text-[10px] text-gray-400 capitalize">{user.plan} Plan</span>
              </div>
              <div className="group relative">
                <button className="flex items-center gap-2 focus:outline-none">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </button>
                {/* Desktop Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                   <div className="px-4 py-3 border-b border-border">
                     <p className="text-sm font-medium text-primary truncate">{user.name}</p>
                     <p className="text-xs text-gray-500 truncate">{user.email}</p>
                   </div>
                   <div className="py-1">
                     <button onClick={onHistoryClick} className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        History
                     </button>
                     <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Sign out
                     </button>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-primary text-white px-5 py-2 rounded-full text-xs font-medium hover:bg-accent transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-xl hover:scale-105"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center gap-4">
           {user && (
              <div className="text-xs font-semibold text-primary bg-gray-100 px-2 py-1 rounded-md">
                {user.credits.count} left
              </div>
           )}
           <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-primary transition-colors p-1"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-white border-b border-border shadow-lg animate-fade-in py-4 px-4 flex flex-col space-y-4">
           <button onClick={() => scrollToSection('product')} className="text-sm font-medium text-gray-600 hover:text-primary text-left py-2 border-b border-gray-100">Product</button>
           <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-gray-600 hover:text-primary text-left py-2 border-b border-gray-100">Pricing</button>
           
           {user ? (
             <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-primary">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-[10px] text-mint-700 font-medium uppercase mt-0.5">{user.plan} Plan</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    onHistoryClick();
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full text-left py-2 text-sm text-gray-600 hover:text-primary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  View History
                </button>
                <button 
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full text-left py-2 text-sm text-red-500 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Sign Out
                </button>
             </div>
           ) : (
             <button 
               onClick={() => {
                 onLoginClick();
                 setIsMobileMenuOpen(false);
               }}
               className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium shadow-md"
             >
               Login
             </button>
           )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;