
import React from 'react';
import { AppView, UserStats } from '../types';
import { Trophy, Users, Zap, Calendar, Play, User as UserIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onAction: (view: AppView) => void;
  userStats: UserStats;
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onAction, userStats, userName }) => {
  const winRate = userStats.matches > 0 
    ? Math.round((userStats.wins / userStats.matches) * 100) 
    : 0;

  return (
    <div className="space-y-6">
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

      <section className="bg-gradient-to-br from-lime-500/20 to-emerald-500/5 border border-lime-500/20 rounded-[2.5rem] p-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 text-white uppercase tracking-tight">Match Ready?</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-[240px]">Start tracking your performance and climbing the local ranks.</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => onAction(AppView.MATCH_MODE_SELECT)}
              className="bg-lime-400 text-slate-950 font-black px-8 py-5 rounded-[2rem] hover:bg-lime-300 transition-all flex items-center justify-center gap-3 shadow-lg shadow-lime-500/20 group"
            >
              <div className="w-8 h-8 bg-slate-950 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 text-lime-400 fill-current ml-0.5" />
              </div>
              <span className="text-lg tracking-tight">QUICK MATCH</span>
            </button>
            <button 
              onClick={() => onAction(AppView.CREATE_TOURNAMENT)}
              className="bg-white/5 backdrop-blur-md text-white border border-white/10 font-black px-8 py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
              Tournament Maker
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

      <section className="bg-slate-900/50 border border-white/5 p-6 rounded-[2.5rem]">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-8">Performance History</h3>
        <div className="h-48 w-full flex items-center justify-center">
          {userStats.matches === 0 ? (
            <p className="text-slate-600 text-sm font-bold italic">Play a match to see your trends</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: 'Start', win: 0 },
                { name: 'Now', win: userStats.wins }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="win" stroke="#a3e635" strokeWidth={4} dot={{ fill: '#a3e635', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
