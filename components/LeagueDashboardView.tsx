
import React, { useState } from 'react';
import { League, LeagueMember, LeagueMatch, UserProfile } from '../types';
import { Trophy, Users, History, Plus, ChevronLeft, ShieldCheck, UserPlus, Share2, Search, ArrowRight, Check } from 'lucide-react';

interface LeagueDashboardViewProps {
  league: League;
  userId: string;
  allPlatformUsers: UserProfile[];
  onSendInvite: (targetUserId: string) => void;
  onUpdateLeague: (league: League) => void;
  onBack: () => void;
}

const LeagueDashboardView: React.FC<LeagueDashboardViewProps> = ({ league, userId, allPlatformUsers, onSendInvite, onUpdateLeague, onBack }) => {
  const [activeTab, setActiveTab] = useState<'standings' | 'matches' | 'members'>('standings');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  const isAdmin = league.members.find(m => m.id === userId)?.role === 'admin';

  const filteredUsers = searchQuery.length > 1 
    ? allPlatformUsers.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !league.members.some(m => m.id === u.id)
      ) 
    : [];

  const handleShareInvite = async () => {
    const shareText = `Join my Padel league "${league.name}" on PadelPulse AI! Track matches, climb the standings, and see your highlights.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Padel League Invite',
          text: shareText,
          url: window.location.href
        });
      } catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Invite message copied to clipboard!");
    }
  };

  const invitePlayer = (u: UserProfile) => {
    onSendInvite(u.id);
    setInvitedIds(prev => new Set(prev).add(u.id));
  };

  const addManualMatch = () => {
    if (!isAdmin) return;
    const p1 = prompt("Enter Home Player Name:");
    const p2 = prompt("Enter Away Player Name:");
    const score = prompt("Enter Score (e.g. 6-4, 6-2):");
    const winner = prompt("Enter Winner's Name:");
    
    if (!p1 || !p2 || !score || !winner) return;

    // Fixed: Added missing properties to satisfy LeagueMatch interface
    const newMatch: LeagueMatch = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(),
      playerA: p1,
      playerB: p2,
      playerAName: p1,
      playerBName: p2,
      score,
      winnerId: winner,
      status: 'confirmed',
      confirmedBy: [userId]
    };

    const updatedMembers = league.members.map(m => {
      if (m.name === p1 || m.name === p2) {
        return {
          ...m,
          matches: m.matches + 1,
          wins: m.name === winner ? m.wins + 1 : m.wins
        };
      }
      return m;
    });

    onUpdateLeague({ ...league, matches: [newMatch, ...league.matches], members: updatedMembers });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white">{league.name.toUpperCase()}</h2>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-lime-400" />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">League Admin: You</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-900 rounded-[1.5rem] border border-slate-800">
        {[
          { id: 'standings', label: 'Standings', icon: Trophy },
          { id: 'matches', label: 'Matches', icon: History },
          { id: 'members', label: 'Members', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setIsSearching(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-bold text-xs ${
              activeTab === tab.id && !isSearching ? 'bg-lime-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {isSearching ? (
        <div className="space-y-6 animate-in fade-in duration-300">
           <div className="flex items-center gap-3">
             <button onClick={() => setIsSearching(false)} className="text-slate-500 hover:text-white"><ChevronLeft /></button>
             <h3 className="text-sm font-black text-white uppercase tracking-widest">Find Players</h3>
           </div>
           
           <div className="relative">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
             <input 
               autoFocus
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search by name..."
               className="w-full bg-slate-900 border border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-white outline-none focus:border-lime-400 transition-all"
             />
           </div>

           <div className="grid gap-3">
             {searchQuery.length > 1 && filteredUsers.length === 0 && (
               <p className="text-center text-slate-600 text-sm italic py-12">No users found matching "{searchQuery}"</p>
             )}
             {filteredUsers.map(u => (
               <div key={u.id} className="bg-slate-900/50 border border-white/5 p-4 rounded-[2rem] flex items-center justify-between animate-in slide-in-from-bottom-2">
                 <div className="flex items-center gap-4">
                    <img src={u.avatar} className="w-12 h-12 rounded-2xl bg-slate-800" />
                    <div>
                       <p className="text-white font-black">{u.name}</p>
                       <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{u.level}</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => invitePlayer(u)}
                   disabled={invitedIds.has(u.id)}
                   className={`p-3 rounded-xl transition-all ${invitedIds.has(u.id) ? 'bg-slate-800 text-lime-400' : 'bg-lime-400 text-slate-950 hover:scale-105 active:scale-95'}`}
                 >
                   {invitedIds.has(u.id) ? <Check className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                 </button>
               </div>
             ))}
           </div>

           <div className="bg-slate-950 border border-dashed border-slate-800 p-8 rounded-[2.5rem] text-center">
              <p className="text-slate-500 text-xs font-bold mb-4 italic">Player not on PadelPulse yet?</p>
              <button 
                onClick={handleShareInvite}
                className="inline-flex items-center gap-2 bg-white/5 text-white border border-white/10 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10"
              >
                <Share2 className="w-4 h-4" /> Share Invite Link
              </button>
           </div>
        </div>
      ) : (
        <>
          {activeTab === 'standings' && (
            <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rank</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Player</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[...league.members].sort((a,b) => b.wins - a.wins).map((m, i) => (
                    <tr key={m.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black ${i < 3 ? 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-400/20' : 'bg-slate-800 text-slate-400'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} className="w-8 h-8 rounded-lg bg-slate-800" />
                          <div>
                             <p className="text-white font-black text-sm">{m.name}</p>
                             {m.role === 'admin' && <span className="text-[8px] text-lime-400 font-bold uppercase tracking-widest">Admin</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white font-black tabular-nums">{m.wins * 3}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-4">
              {isAdmin && (
                <button onClick={addManualMatch} className="w-full py-5 bg-lime-400 text-slate-950 font-black rounded-3xl flex items-center justify-center gap-3 shadow-xl shadow-lime-500/10">
                  <Plus className="w-5 h-5" /> ADD MATCH RESULT
                </button>
              )}
              {league.matches.length === 0 ? (
                <div className="text-center py-24 text-slate-700 bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-[3rem]">
                  <p className="font-bold text-sm italic">No matches recorded in this league yet.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {league.matches.map(m => (
                    <div key={m.id} className="bg-slate-900/50 border border-white/5 p-5 rounded-[2.5rem] shadow-xl">
                      <div className="flex justify-between items-center mb-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        <span>{m.date}</span>
                        <span className="text-lime-400">LEAGUE MATCH</span>
                      </div>
                      <div className="flex items-center justify-between text-center gap-4">
                        <p className={`flex-1 text-sm font-black truncate ${m.winnerId === m.playerA ? 'text-lime-400' : 'text-white'}`}>{m.playerA}</p>
                        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-white/5 min-w-[80px]">
                          <span className="text-white font-black tabular-nums">{m.score}</span>
                        </div>
                        <p className={`flex-1 text-sm font-black truncate ${m.winnerId === m.playerB ? 'text-lime-400' : 'text-white'}`}>{m.playerB}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              {isAdmin && (
                <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => setIsSearching(true)}
                     className="py-4 bg-white/5 border border-white/10 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                   >
                     <UserPlus className="w-4 h-4" /> FIND USERS
                   </button>
                   <button 
                     onClick={handleShareInvite}
                     className="py-4 bg-lime-400/10 border border-lime-400/20 text-lime-400 font-black text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-lime-400/20 transition-all"
                   >
                     <Share2 className="w-4 h-4" /> SHARE LINK
                   </button>
                </div>
              )}
              <div className="grid gap-3">
                {league.members.map(m => (
                  <div key={m.id} className="bg-slate-900/50 border border-white/5 p-4 rounded-[2rem] flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-4">
                      <img src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} className="w-12 h-12 rounded-2xl bg-slate-950" />
                      <div>
                        <h4 className="text-white font-black">{m.name}</h4>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{m.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5">
                      <Trophy className="w-3 h-3" /> {m.wins} WINS
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LeagueDashboardView;
