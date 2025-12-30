
import React from 'react';
import { AppView, UserStats, League } from '../types';
import { Trophy, Users, Zap, Calendar, Play, User as UserIcon, Plus, Target, ChevronRight } from 'lucide-react';

interface DashboardProps {
  onAction: (view: AppView) => void;
  userStats: UserStats;
  userName: string;
  leagues: League[];
  onSelectLeague: (id: string) => void;
  notificationCount: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onAction, userStats, userName, leagues, onSelectLeague }) => {
  const winRate = userStats.matches > 0 
    ? Math.round((userStats.wins / userStats.matches) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center border border-white/10 p-2 overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[9px] font-black text-lime-400 uppercase tracking-widest bg-lime-400/10 px-2 py-0.5 rounded-md w-fit mb-1">PRO LEVEL</p>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{userName}</h2>
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-br from-blue-600 to-blue-900 border border-blue-400/20 rounded-[3rem] p-8 relative overflow-hidden shadow-2xl shadow-blue-500/10">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-1 text-white uppercase tracking-tighter italic">Ready to Play?</h2>
          <p className="text-blue-100/60 text-sm mb-8 font-medium">Start professional AI match analysis & recording.</p>
          
          <button 
            onClick={() => onAction(AppView.MATCH_MODE_SELECT)}
            className="group w-full bg-lime-400 text-slate-950 font-black py-5 rounded-[2rem] flex items-center justify-center gap-4 shadow-xl shadow-lime-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <div className="w-10 h-10 bg-slate-950 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
               <Zap className="w-5 h-5 text-lime-400 fill-current" />
            </div>
            <span className="text-xl tracking-tight uppercase italic">New AI Match Analysis</span>
          </button>
        </div>
        
        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")` }} 
        />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-lime-400/20 blur-[80px] rounded-full" />
      </section>

      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Trophy, label: 'W/L Record', val: `${userStats.wins} - ${userStats.losses}`, color: 'bg-orange-500/10 text-orange-400' },
          { icon: Target, label: 'Smash Eff.', val: `${userStats.smashWinRate || 74}%`, color: 'bg-lime-400/10 text-lime-400' },
          { icon: Zap, label: 'Net Points', val: userStats.netPointsWon || 124, color: 'bg-blue-400/10 text-blue-400' },
          { icon: Users, label: 'Experience', val: `${userStats.matches} Matches`, color: 'bg-purple-400/10 text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] shadow-xl hover:bg-slate-900/60 transition-colors">
            <div className={`w-10 h-10 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
               <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-white tracking-tighter italic">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Official Leagues</h3>
          <button 
            onClick={() => onAction(AppView.CREATE_LEAGUE)}
            className="text-lime-400 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-lime-400/10 px-4 py-2 rounded-full border border-lime-400/20"
          >
            <Plus className="w-3 h-3" /> New Tournament
          </button>
        </div>
        
        {leagues.length === 0 ? (
          <div className="bg-slate-900/20 border-2 border-dashed border-white/5 p-12 rounded-[3rem] text-center">
            <Trophy className="w-12 h-12 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-600 text-sm font-bold italic">Join or create a tournament to rank up.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {leagues.map((league) => (
              <button 
                key={league.id}
                onClick={() => onSelectLeague(league.id)}
                className="bg-slate-900/50 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-lime-400/40 transition-all shadow-xl"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-lime-400 group-hover:scale-110 transition-transform relative">
                    <Trophy className="w-7 h-7" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-lime-400 rounded-full flex items-center justify-center">
                       <span className="text-[8px] text-slate-950 font-black">#1</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <h4 className="text-white text-lg font-black italic uppercase group-hover:text-lime-400 transition-colors">{league.name}</h4>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{league.members.length} Players • {league.matches.length} Official Games</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-lime-400 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
