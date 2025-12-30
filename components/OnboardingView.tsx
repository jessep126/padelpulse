
import React, { useState } from 'react';
import { Zap, ArrowRight, User, Mail, ShieldCheck, Trophy, Target, Star, Lock, RefreshCcw, Loader2, ChevronLeft, UserCheck } from 'lucide-react';
import { padelAI } from '../services/geminiService';
import { UserProfile } from '../types';

interface OnboardingViewProps {
  existingUsers: UserProfile[];
  onComplete: (data: { name: string, email: string, level: string, existingId?: string }) => void;
  onSendEmail: (subject: string, body: string) => void;
}

const BigBrandLogo = ({ className = "w-32 h-32" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="onboardingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#bef264', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#65a30d', stopOpacity: 1 }} />
      </linearGradient>
      <pattern id="racketMesh" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="1" fill="#020617" opacity="0.1" />
      </pattern>
      <filter id="outerGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <circle cx="50" cy="45" r="40" fill="#a3e635" opacity="0.1" filter="url(#outerGlow)" />
    <path d="M50 8C25 8 8 25 8 50C8 68 20 82 40 88V96C40 98.2 41.8 100 44 100H56C58.2 100 60 98.2 60 96V88C80 82 92 68 92 50C92 25 75 8 50 8Z" fill="url(#onboardingGradient)" />
    <path d="M50 8C25 8 8 25 8 50C8 68 20 82 40 88V96C40 98.2 41.8 100 44 100H56C58.2 100 60 98.2 60 96V88C80 82 92 68 92 50C92 25 75 8 50 8Z" fill="url(#racketMesh)" />
    <path d="M25 50H35L42 32L58 68L65 50H75" stroke="#020617" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <path d="M35 85L50 78L65 85" fill="#020617" opacity="0.2" />
    <rect x="44" y="90" width="12" height="8" rx="1.5" fill="#020617" opacity="0.4" />
    <circle cx="85" cy="25" r="10" fill="#a3e635" opacity="0.5" className="animate-pulse" />
    <circle cx="85" cy="25" r="6" fill="#f8fafc" />
  </svg>
);

const OnboardingView: React.FC<OnboardingViewProps> = ({ existingUsers, onComplete, onSendEmail }) => {
  const [step, setStep] = useState<'welcome' | 'email' | 'verification' | 'identity' | 'level'>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [accountFound, setAccountFound] = useState<UserProfile | null>(null);

  const lookupAndSendCode = async () => {
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    setError('');
    
    // Check if account exists
    const existing = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    setAccountFound(existing || null);

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    
    try {
      const emailContent = await padelAI.composeEmail('welcome', { 
        name: existing ? existing.name : 'New Player', 
        code: newCode 
      });
      onSendEmail(emailContent.subject, emailContent.body);
      setStep('verification');
    } catch (e) {
      setError('System busy. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = () => {
    if (code === generatedCode) {
      if (accountFound) {
        // Sign in existing user immediately
        onComplete({ 
          name: accountFound.name, 
          email: accountFound.email, 
          level: accountFound.level,
          existingId: accountFound.id 
        });
      } else {
        // Proceed with registration for new user
        setStep('identity');
      }
    } else {
      setError('Invalid code. Check your simulated inbox.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center p-8 overflow-y-auto">
      <div className="w-full max-w-sm space-y-12 animate-in fade-in duration-700">
        
        {step === 'welcome' && (
          <div className="flex flex-col items-center text-center space-y-12 animate-in zoom-in duration-500">
            <div className="relative group">
              <div className="absolute inset-0 bg-lime-400/20 blur-[80px] rounded-full scale-150 animate-pulse" />
              <BigBrandLogo className="w-48 h-48 relative z-10 drop-shadow-[0_0_30px_rgba(163,230,53,0.3)] transition-transform duration-1000 hover:rotate-6" />
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl ring-4 ring-slate-950">
                <Zap className="w-6 h-6 text-slate-950 fill-current" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-logo font-black text-white tracking-tighter mb-4 leading-tight uppercase italic">
                Padel<span className="text-lime-400">Pulse</span>
              </h1>
              <p className="text-slate-400 font-medium text-lg leading-relaxed px-4">
                Professional match intelligence for the next generation of padel athletes.
              </p>
            </div>
            <button
              onClick={() => setStep('email')}
              className="w-full bg-lime-400 text-slate-950 font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(163,230,53,0.2)] hover:bg-lime-300 active:scale-95 transition-all text-lg"
            >
              START SESSION <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {step === 'email' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">Sign In</h2>
              <p className="text-slate-500 font-medium">Enter your email to resume progress or create an account</p>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-lime-400 transition-colors" />
                <input
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="player@padelpulse.com"
                  className="w-full bg-slate-900 border border-white/5 rounded-[2rem] py-5 pl-16 pr-8 text-white font-bold outline-none focus:border-lime-400 transition-all shadow-inner"
                />
              </div>
              {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
            </div>

            <button
              disabled={!email.includes('@') || isSending}
              onClick={lookupAndSendCode}
              className="w-full bg-lime-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 shadow-xl transition-all"
            >
              {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <>SEND CODE <Zap className="w-5 h-5 fill-current" /></>}
            </button>
            <button onClick={() => setStep('welcome')} className="w-full text-slate-600 text-xs font-black uppercase tracking-widest">Back</button>
          </div>
        )}

        {step === 'verification' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="text-center">
               <div className="inline-flex items-center gap-2 bg-blue-400/10 px-4 py-1.5 rounded-full border border-blue-400/20 mb-4">
                 <Lock className="w-3 h-3 text-blue-400" />
                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Verify Email</span>
               </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">Verification</h2>
              <p className="text-slate-500 text-sm">We sent a 6-digit code to <b>{email}</b>. Check your simulated inbox.</p>
            </div>

            <div className="space-y-4">
              <input
                autoFocus
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-slate-900 border border-white/5 rounded-[2rem] py-6 px-8 text-white text-center text-4xl font-black tracking-[0.5em] outline-none focus:border-lime-400 transition-all"
              />
              {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
            </div>

            <button
              onClick={handleVerify}
              className="w-full bg-lime-400 text-slate-950 font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
            >
              {accountFound ? 'SIGN IN NOW' : 'NEXT: SETUP PROFILE'} <ArrowRight className="w-6 h-6" />
            </button>
            <button onClick={() => setStep('email')} className="w-full text-slate-600 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <RefreshCcw className="w-3 h-3" /> Use Different Email
            </button>
          </div>
        )}

        {step === 'identity' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">New Profile</h2>
              <p className="text-slate-500 font-medium">Let's set up your player identification</p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-4">Display Name</label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-lime-400 transition-colors" />
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Juan Lebrón"
                  className="w-full bg-slate-900 border border-white/5 rounded-[2rem] py-5 pl-16 pr-8 text-white font-bold outline-none focus:border-lime-400 transition-all"
                />
              </div>
            </div>

            <button
              disabled={!name.trim()}
              onClick={() => setStep('level')}
              className="w-full bg-lime-400 disabled:bg-slate-800 text-slate-950 font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 transition-all"
            >
              CHOOSE SKILL LEVEL <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        )}

        {step === 'level' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">Level</h2>
              <p className="text-slate-500 font-medium">How experienced are you at the 20x10?</p>
            </div>

            <div className="grid gap-3">
              {[
                { id: 'Beginner', icon: Target, desc: 'Learning the basics' },
                { id: 'Intermediate', icon: Star, desc: 'Regular club player' },
                { id: 'Pro', icon: Trophy, desc: 'Tournament competitor' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setLevel(lvl.id)}
                  className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 text-left transition-all ${
                    level === lvl.id ? 'bg-lime-400 border-lime-400 text-slate-950 shadow-lg' : 'bg-slate-900 border-white/5 text-slate-400'
                  }`}
                >
                  <lvl.icon className="w-5 h-5" />
                  <div>
                    <p className="font-black uppercase tracking-widest text-xs">{lvl.id}</p>
                    <p className="text-[9px] opacity-70">{lvl.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => onComplete({ name, email, level })}
              className="w-full bg-lime-400 text-slate-950 font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 shadow-2xl transition-all"
            >
              FINISH SETUP <ShieldCheck className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default OnboardingView;
