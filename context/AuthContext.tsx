
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PlanType, AnalysisResult, AnalysisHistoryItem } from '../types';

interface AuthContextType {
  user: User | null;
  guestCredits: number;
  isLoading: boolean;
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  login: (method: 'google' | 'email', email?: string, password?: string, name?: string, isSignUp?: boolean) => Promise<void>;
  logout: () => void;
  updatePlan: (plan: PlanType) => void;
  decrementCredit: () => boolean;
  decrementGuestCredit: () => boolean;
  verifyStudent: () => Promise<void>;
  processAnalysisCompletion: (result: AnalysisResult) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DB_SESSION_KEY = 'resume_align_session'; 
const DB_USERS_KEY = 'resume_align_users';
const GUEST_USAGE_KEY = 'resume_align_guest_usage';
const IP_ACCOUNTS_KEY = 'resume_align_ip_accounts'; // Stores account count per IP

// Helper to check if date is today
const isToday = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [guestCredits, setGuestCredits] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialize Guest Credits & User Session
  useEffect(() => {
    // 1. Guest Logic (2 free scans per day)
    const guestData = localStorage.getItem(GUEST_USAGE_KEY);
    const todayStr = new Date().toISOString();
    
    if (guestData) {
      const parsed = JSON.parse(guestData);
      if (isToday(parsed.date)) {
        setGuestCredits(parsed.count);
      } else {
        // Reset for new day
        setGuestCredits(2);
        localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify({ date: todayStr, count: 2 }));
      }
    } else {
      // First time
      setGuestCredits(2);
      localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify({ date: todayStr, count: 2 }));
    }

    // 2. User Logic
    const storedSession = localStorage.getItem(DB_SESSION_KEY);
    if (storedSession) {
      const parsedUser: User = JSON.parse(storedSession);
      
      if (!parsedUser.history) parsedUser.history = [];
      
      const now = new Date().toISOString();
      let updatedUser = { ...parsedUser };
      let hasChanges = false;

      // Fix missing history
      if (!updatedUser.history) {
        updatedUser.history = [];
        hasChanges = true;
      }

      // RESET LOGIC: All plans now reset DAILY
      if (!isToday(parsedUser.credits.lastReset)) {
         let limit = 5; // Default Free Tier
         if (parsedUser.plan === 'student') limit = 15;
         if (parsedUser.plan === 'pro') limit = 30; // Updated to 30

         updatedUser.credits = { 
           count: limit, 
           limit: limit, 
           period: 'day', 
           lastReset: now 
         };
         hasChanges = true;
      }

      setUser(updatedUser);
      if (hasChanges) {
        updateUserSession(updatedUser);
      }
    }
    setIsLoading(false);
  }, []);

  const updateUserSession = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(DB_SESSION_KEY, JSON.stringify(updatedUser));
    
    const usersMap = JSON.parse(localStorage.getItem(DB_USERS_KEY) || '{}');
    if (usersMap[updatedUser.email]) {
      usersMap[updatedUser.email].user = updatedUser;
      localStorage.setItem(DB_USERS_KEY, JSON.stringify(usersMap));
    }
  };

  // Helper to fetch IP Address
  const getIpAddress = async (): Promise<string> => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch (e) {
      console.warn("IP Fetch failed, defaulting to browser-session fallback");
      return 'browser_session_fallback';
    }
  };

  const checkIpAccountLimit = async () => {
    const ip = await getIpAddress();
    
    const ipMap = JSON.parse(localStorage.getItem(IP_ACCOUNTS_KEY) || '{}');
    const createdCount = ipMap[ip] || 0;

    // Strict limit: Max 2 accounts per IP
    if (createdCount >= 2) {
      throw new Error(`Security Alert: Maximum account limit (2) reached for IP ${ip}. To prevent exploitation of free tier limits, new account creation is blocked.`);
    }
  };

  const incrementIpAccountCount = async () => {
    const ip = await getIpAddress();
    const ipMap = JSON.parse(localStorage.getItem(IP_ACCOUNTS_KEY) || '{}');
    ipMap[ip] = (ipMap[ip] || 0) + 1;
    localStorage.setItem(IP_ACCOUNTS_KEY, JSON.stringify(ipMap));
  };

  const login = async (
    method: 'google' | 'email', 
    email?: string, 
    password?: string, 
    name?: string,
    isSignUp?: boolean
  ) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const usersMap = JSON.parse(localStorage.getItem(DB_USERS_KEY) || '{}');
      let finalUser: User;

      if (method === 'google') {
        const googleEmail = 'aditya.k@gmail.com'; 
        if (usersMap[googleEmail]) {
          finalUser = usersMap[googleEmail].user;
        } else {
          // Creating new Google User
          await checkIpAccountLimit(); 
          finalUser = createNewUser(googleEmail, 'Aditya Kumar');
          usersMap[googleEmail] = { user: finalUser, password: 'google_oauth_user' };
          localStorage.setItem(DB_USERS_KEY, JSON.stringify(usersMap));
          await incrementIpAccountCount();
        }
      } else {
        if (!email || !password) throw new Error("Email and password required");

        if (isSignUp) {
          await checkIpAccountLimit(); 
          if (usersMap[email]) {
            throw new Error("User already exists with this email.");
          }
          finalUser = createNewUser(email, name || email.split('@')[0]);
          usersMap[email] = { user: finalUser, password: password }; 
          localStorage.setItem(DB_USERS_KEY, JSON.stringify(usersMap));
          await incrementIpAccountCount();
        } else {
          const record = usersMap[email];
          if (!record) throw new Error("User not found. Please sign up.");
          if (record.password !== password) throw new Error("Invalid password.");
          finalUser = record.user;
        }
      }

      // Reset logic check on login
      if (!isToday(finalUser.credits.lastReset)) {
          let limit = 5;
          if (finalUser.plan === 'student') limit = 15;
          if (finalUser.plan === 'pro') limit = 30; // Updated to 30
          finalUser.credits = { count: limit, limit: limit, period: 'day', lastReset: new Date().toISOString() };
      }

      if (!finalUser.history) finalUser.history = [];

      setUser(finalUser);
      localStorage.setItem(DB_SESSION_KEY, JSON.stringify(finalUser));
    
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createNewUser = (email: string, name: string): User => {
    return {
      id: 'usr_' + Date.now(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      plan: 'free',
      credits: {
        count: 5, // Logged in Free tier starts with 5
        limit: 5,
        period: 'day',
        lastReset: new Date().toISOString()
      },
      isStudentVerified: false,
      history: []
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(DB_SESSION_KEY);
  };

  const updatePlan = (plan: PlanType) => {
    if (!user) return;
    
    let newCredits = { ...user.credits };
    const now = new Date().toISOString();

    if (plan === 'pro') {
      newCredits = { count: 30, limit: 30, period: 'day', lastReset: now }; // Updated to 30
    } else if (plan === 'student') {
      newCredits = { count: 15, limit: 15, period: 'day', lastReset: now };
    } else {
      newCredits = { count: 5, limit: 5, period: 'day', lastReset: now };
    }

    const updatedUser = { ...user, plan, credits: newCredits };
    updateUserSession(updatedUser);
  };

  const verifyStudent = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (!user) return;
    const updatedUser = { ...user, isStudentVerified: true };
    updateUserSession(updatedUser);
  };

  // Deprecated for direct usage in App.tsx, prefer processAnalysisCompletion
  const decrementCredit = (): boolean => {
    if (isDemoMode) return true;
    if (!user) return false;
    if (user.credits.count > 0) {
      const updatedUser = {
        ...user,
        credits: { ...user.credits, count: user.credits.count - 1 }
      };
      updateUserSession(updatedUser);
      return true;
    }
    return false;
  };

  const decrementGuestCredit = (): boolean => {
    if (isDemoMode) return true;
    if (guestCredits > 0) {
      const newCount = guestCredits - 1;
      setGuestCredits(newCount);
      localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify({ 
        date: new Date().toISOString(), 
        count: newCount 
      }));
      return true;
    }
    return false;
  };

  // Atomic function to handle credit decrement AND history saving
  const processAnalysisCompletion = (result: AnalysisResult): boolean => {
    if (isDemoMode) return true;
    if (!user) return false;
    if (user.credits.count <= 0) return false;

    // 1. Decrement Credit
    const newCredits = { ...user.credits, count: user.credits.count - 1 };

    // 2. Add History
    const newHistoryItem: AnalysisHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      result: result
    };
    const newHistory = [newHistoryItem, ...(user.history || [])].slice(0, 20);

    // 3. Update State Atomically
    const updatedUser = {
      ...user,
      credits: newCredits,
      history: newHistory
    };

    updateUserSession(updatedUser);
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      guestCredits, 
      isLoading, 
      isDemoMode,
      setDemoMode: setIsDemoMode,
      login, 
      logout, 
      updatePlan, 
      decrementCredit, 
      decrementGuestCredit, 
      verifyStudent, 
      processAnalysisCompletion 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
