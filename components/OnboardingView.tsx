
import React, { useState } from 'react';
import { Zap, ArrowRight, User, Mail, ShieldCheck, Trophy, Target, Star } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (data: { name: string, email: string, level: string }) => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'identity' | 'level'>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState('Intermediate');

  const handleNext = () => {
    if (step === 'welcome') setStep('identity');
    else if (step === 'identity') {
      if (name.trim() && email.trim()) setStep('level');
    } else {
      onComplete({ name, email, level });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center p-8 overflow-y-auto">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in duration-700">
        
        {step === 'welcome' && (
          <div className="flex flex-col items-center text-center space-y-12 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-lime-400 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-lime-400/20 rotate-3">
              <Zap className="w-12 h-12 text-slate-950 fill-current" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight mb-4">PadelPulse <span className="text-lime-400">AI</span></h1>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                Smart tracking. Real highlights.<br/>Zero manual effort.
              </p>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-white text-slate-950 font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-lg"
            >
              CREATE ACCOUNT <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {step === 'identity' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Identify Yourself</h2>
              <p className="text-slate-500 font-medium">This is how friends find you in leagues</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-4">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-lime-400 transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ale Galán"
                    className="w-full bg-slate-900 border border-white/5 rounded-[2rem] py-5 pl-16 pr-8 text-white font-bold outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-4">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-lime-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ale@worldpadel.com"
                    className="w-full bg-slate-900 border border-white/5 rounded-[2rem] py-5 pl-16 pr-8 text-white font-bold outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={!name.trim() || !email.trim()}
              onClick={handleNext}
              className="w-full bg-lime-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              CONTINUE <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 'level' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Skill Level</h2>
              <p className="text-slate-500 font-medium">Helps us find the right matches</p>
            </div>

            <div className="grid gap-4">
              {[
                { id: 'Beginner', icon: Target, desc: 'New to the game' },
                { id: 'Intermediate', icon: Star, desc: 'Regular social player' },
                { id: 'Pro', icon: Trophy, desc: 'Tournament competitor' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setLevel(lvl.id)}
                  className={`flex items-center gap-4 p-6 rounded-[2rem] border-2 text-left transition-all ${
                    level === lvl.id 
                      ? 'bg-lime-400 border-lime-400 text-slate-950 shadow-xl shadow-lime-400/20' 
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${level === lvl.id ? 'bg-slate-950 text-lime-400' : 'bg-slate-950 text-slate-600'}`}>
                    <lvl.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-widest text-xs mb-0.5">{lvl.id}</p>
                    <p className="text-[10px] font-bold opacity-80">{lvl.desc}</p>
                  </div>
                  {level === lvl.id && <ShieldCheck className="w-6 h-6 ml-auto" />}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-lime-400 text-slate-950 font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              FINISH SETUP <Zap className="w-5 h-5 fill-current" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default OnboardingView;
