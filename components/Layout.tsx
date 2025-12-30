
import React from 'react';
import { AppView } from '../types';
import { Home, Camera, Compass, Film, Trophy, Bell, LogOut, Circle, Search } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setView: (view: AppView) => void;
  hasNotifications?: boolean;
  onLogout?: () => void;
}

const BrandLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="racketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#bef264', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#65a30d', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Racket Frame */}
    <path 
      d="M50 12C32 12 18 26 18 46C18 60 28 72 40 78V94C40 96.2 41.8 98 44 98H56C58.2 98 60 96.2 60 94V78C72 72 82 60 82 46C82 26 68 12 50 12Z" 
      fill="url(#racketGradient)"
    />
    
    {/* Handle Detail */}
    <rect x="44" y="80" width="12" height="14" rx="1" fill="#020617" opacity="0.3" />
    <path d="M40 78H60" stroke="#020617" strokeWidth="2" opacity="0.2" />

    {/* The "Pulse" Wave - Blended look */}
    <path 
      d="M30 46H38L43 32L57 60L62 46H70" 
      stroke="#020617" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      opacity="0.8"
    />
    
    {/* Racket Texture (Holes) */}
    <g fill="#020617" opacity="0.15">
      <circle cx="50" cy="25" r="2" />
      <circle cx="35" cy="35" r="2" />
      <circle cx="65" cy="35" r="2" />
      <circle cx="35" cy="57" r="2" />
      <circle cx="65" cy="57" r="2" />
      <circle cx="50" cy="68" r="2" />
    </g>
  </svg>
);

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView, hasNotifications, onLogout }) => {
  const navItems = [
    { id: AppView.DASHBOARD, icon: Home, label: 'Home' },
    { id: AppView.RECORD, icon: Camera, label: 'Analyze' },
    { id: AppView.CREATE_TOURNAMENT, icon: Trophy, label: 'Tournament' },
    { id: AppView.HIGHLIGHTS, icon: Film, label: 'Highlights' },
    { id: AppView.DISCOVERY, icon: Search, label: 'Find' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      <header className="px-6 py-4 flex justify-between items-center bg-slate-950/50 backdrop-blur-xl border-b border-white/5 relative z-50">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>
            <div className="absolute inset-0 bg-lime-400/20 blur-xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-500" />
            <BrandLogo className="w-10 h-10 relative z-10" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-logo font-black tracking-tight text-white leading-none italic uppercase">
              Padel<span className="text-lime-400">Pulse</span>
            </h1>
            <div className="flex items-center gap-1">
              <span className="text-[7px] font-black tracking-[0.4em] text-slate-500 uppercase">AI Analytics</span>
              <Circle className="w-1 h-1 fill-lime-400 text-lime-400 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setView(AppView.NOTIFICATIONS)}
            className="relative p-2.5 hover:bg-slate-900 rounded-2xl transition-all group"
          >
            <Bell className={`w-5 h-5 ${hasNotifications ? 'text-lime-400' : 'text-slate-500 group-hover:text-white'}`} />
            {hasNotifications && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-lime-400 rounded-full ring-4 ring-slate-950" />
            )}
          </button>
          <button 
            onClick={onLogout}
            className="p-2.5 hover:bg-red-500/10 text-slate-700 hover:text-red-500 rounded-2xl transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 px-6 py-3 flex justify-around items-center z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeView === item.id ? 'text-lime-400 scale-110' : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeView === item.id ? 'bg-lime-400/10' : ''}`}>
              <item.icon className={`w-5 h-5 ${activeView === item.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.15em]">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
