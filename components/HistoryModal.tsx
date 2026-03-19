
import React from 'react';
import { AnalysisHistoryItem } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisHistoryItem[];
  onSelect: (item: AnalysisHistoryItem) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onSelect }) => {
  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-mint text-primary';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-50 text-red-600';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative shadow-2xl animate-slide-up flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-display font-semibold text-xl text-primary">Scan History</h2>
            <p className="text-sm text-gray-500">Access your previous 20 resume analyses.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 -mx-2 px-2 space-y-3">
          {history && history.length > 0 ? (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="w-full text-left bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 p-4 rounded-xl transition-all duration-200 hover:shadow-md group flex items-center justify-between"
              >
                <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className="font-medium text-gray-800 text-sm group-hover:text-primary transition-colors">Resume Analysis</span>
                   </div>
                   <p className="text-xs text-gray-400 font-medium">{formatDate(item.date)}</p>
                </div>
                
                <div className="flex items-center gap-4">
                   <div className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreColor(item.result.score)}`}>
                     {item.result.score}%
                   </div>
                   <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="text-sm">No history found yet.</p>
              <p className="text-xs mt-1">Start scanning to build your history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
