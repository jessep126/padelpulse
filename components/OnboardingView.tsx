
import React, { useState } from 'react';
import { Zap, ArrowRight, User } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (name: string) => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-12 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-lime-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-lime-400/20 mb-8">
            <Zap className="w-10 h-10 text-slate-950 fill-current" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Welcome to <span className="text-lime-400">PadelPulse</span></h1>
          <p className="text-slate-500 font-medium">Your AI-powered court companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">What's your name?</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-slate-600 group-focus-within:text-lime-400 transition-colors" />
              </div>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-slate-900 border border-white/5 rounded-[2rem] py-5 pl-16 pr-8 text-white text-lg font-bold placeholder:text-slate-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 outline-none transition-all"
              />
            </div>
          </div>

          <button
            disabled={!name.trim()}
            type="submit"
            className="w-full bg-lime-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            START PLAYING <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingView;
