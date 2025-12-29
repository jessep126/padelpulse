
import React from 'react';
import { AppView } from '../types';
import { Home, Camera, Compass, Film, User, Trophy, Bell, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setView: (view: AppView) => void;
  hasNotifications?: boolean;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView, hasNotifications, onLogout }) => {
  const navItems = [
    { id: AppView.DASHBOARD, icon: Home, label: 'Home' },
    { id: AppView.RECORD, icon: Camera, label: 'Record' },
    { id: AppView.CREATE_TOURNAMENT, icon: Trophy, label: 'Tournament' },
    { id: AppView.HIGHLIGHTS, icon: Film, label: 'Highlights' },
    { id: AppView.DISCOVERY, icon: Compass, label: 'Explore' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      <header className="px-6 py-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md border-b border-slate-800 relative z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-slate-950 rounded-full" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">PadelPulse <span className="text-lime-400">AI</span></h1>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setView(AppView.NOTIFICATIONS)}
            className="relative p-2.5 hover:bg-slate-800 rounded-2xl transition-all"
          >
            <Bell className={`w-5 h-5 ${hasNotifications ? 'text-lime-400' : 'text-slate-400'}`} />
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-lime-400 rounded-full ring-4 ring-slate-950 animate-pulse" />
            )}
          </button>
          <button 
            onClick={onLogout}
            className="p-2.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-4 py-2 flex justify-around items-center z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeView === item.id ? 'text-lime-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <item.icon className={`w-6 h-6 ${activeView === item.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
