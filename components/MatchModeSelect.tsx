
import React from 'react';
import { Camera, FileEdit, ChevronLeft, Zap, Info } from 'lucide-react';
import { AppView } from '../types';

interface MatchModeSelectProps {
  onSelect: (view: AppView) => void;
  onBack: () => void;
}

const MatchModeSelect: React.FC<MatchModeSelectProps> = ({ onSelect, onBack }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white">SELECT MATCH MODE</h2>
          <p className="text-slate-500 text-sm font-medium">How would you like to track this match?</p>
        </div>
      </div>

      <div className="grid gap-4">
        <button 
          onClick={() => onSelect(AppView.RECORD)}
          className="group relative bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] text-left hover:border-lime-400/50 hover:bg-slate-900/80 transition-all shadow-xl overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-4 bg-lime-400 text-slate-950 rounded-3xl shadow-lg shadow-lime-400/20 group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8" />
            </div>
            <div className="bg-lime-400/10 text-lime-400 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" /> AI ENABLED
            </div>
          </div>
          <h3 className="text-xl font-black text-white mb-2">AI Match Recording</h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-[240px]">
            Mount your phone at the back of the court. AI automatically tracks points, announces scores, and saves highlights.
          </p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/5 blur-[40px] rounded-full group-hover:bg-lime-400/10 transition-all" />
        </button>

        <button 
          onClick={() => onSelect(AppView.MANUAL_SCORE)}
          className="group relative bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] text-left hover:border-blue-400/50 hover:bg-slate-900/80 transition-all shadow-xl overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-4 bg-blue-500 text-white rounded-3xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <FileEdit className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-xl font-black text-white mb-2">Manual Score Entry</h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-[240px]">
            Just play! Enter the final set scores yourself once the match is over to keep your stats updated.
          </p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full group-hover:bg-blue-500/10 transition-all" />
        </button>
      </div>

      <div className="bg-slate-900/30 border border-white/5 p-6 rounded-[2rem] flex items-start gap-4">
        <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          Matches recorded with <span className="text-lime-400 font-bold">AI</span> will automatically appear in your Highlights gallery. Manual scores only update your performance dashboard.
        </p>
      </div>
    </div>
  );
};

export default MatchModeSelect;
