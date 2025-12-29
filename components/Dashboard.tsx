
import React from 'react';
import { AppView, UserStats, League } from '../types';
import { Trophy, Users, Zap, Calendar, Play, User as UserIcon, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onAction: (view: AppView) => void;
  userStats: UserStats;
  userName: string;
  leagues: League[];
  onSelectLeague: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAction, userStats, userName, leagues, onSelectLeague }) => {
  const winRate = userStats.matches > 0 
    ? Math.round((userStats.wins / userStats.matches) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5">
            <UserIcon className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Back on court</p>
            <h2 className="text-xl font-black text-white">{userName}</h2>
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-br from-lime-500/20 to-emerald-500/5 border border-lime-500/20 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 text-white uppercase tracking-tight">Quick Play</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-[240px]">Start an AI-tracked session with point-by-point live analysis.</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => onAction(AppView.MATCH_MODE_SELECT)}
              className="bg-lime-400 text-slate-950 font-black px-8 py-5 rounded-[2rem] hover:bg-lime-300 transition-all flex items-center justify-center gap-3 shadow-lg shadow-lime-500/20 group"
            >
              <div className="w-8 h-8 bg-slate-950 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 text-lime-400 fill-current ml-0.5" />
              </div>
              <span className="text-lg tracking-tight">START MATCH</span>
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/10 blur-[100px] rounded-full" />
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Trophy, label: 'Win Rate', val: `${winRate}%`, color: 'text-yellow-400' },
          { icon: Zap, label: 'Points', val: userStats.points.toLocaleString(), color: 'text-lime-400' },
          { icon: Users, label: 'Matches', val: userStats.matches.toString(), color: 'text-blue-400' },
          { icon: Calendar, label: 'Record', val: `${userStats.wins}W - ${userStats.losses}L`, color: 'text-orange-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl shadow-xl">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-white">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Your Leagues</h3>
          <button 
            onClick={() => onAction(AppView.CREATE_LEAGUE)}
            className="text-lime-400 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-lime-400/10 px-3 py-1.5 rounded-full"
          >
            <Plus className="w-3 h-3" /> New League
          </button>
        </div>
        {leagues.length === 0 ? (
          <div className="bg-slate-900/30 border border-dashed border-white/10 p-8 rounded-[2rem] text-center">
            <p className="text-slate-500 text-xs font-bold italic">No leagues joined. Create one to play with friends!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {leagues.map((league) => (
              <button 
                key={league.id}
                onClick={() => onSelectLeague(league.id)}
                className="bg-slate-900/50 border border-white/5 p-5 rounded-[2rem] flex items-center justify-between group hover:border-lime-400/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-lime-400 group-hover:scale-110 transition-transform">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-black group-hover:text-lime-400 transition-colors">{league.name}</h4>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{league.members.length} Members • {league.matches.length} Matches</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl text-slate-500">
                  <Play className="w-4 h-4 fill-current" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
