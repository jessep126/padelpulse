
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ChevronLeft, Search, User, ArrowRight, Star } from 'lucide-react';

interface PlayerSelectorViewProps {
  allUsers: UserProfile[];
  onSelect: (user: UserProfile) => void;
  onBack: () => void;
}

const PlayerSelectorView: React.FC<PlayerSelectorViewProps> = ({ allUsers, onSelect, onBack }) => {
  const [query, setQuery] = useState('');

  const filtered = allUsers.filter(u => 
    u.name.toLowerCase().includes(query.toLowerCase()) || 
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Select Opponent</h2>
          <p className="text-slate-500 text-sm font-medium">Matches require a registered player</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
        <input 
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-slate-900 border border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-white outline-none focus:border-lime-400 transition-all shadow-xl"
        />
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-700 bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-[3rem]">
            <p className="font-bold text-sm italic">No users found.</p>
          </div>
        ) : (
          filtered.map(u => (
            <button 
              key={u.id}
              onClick={() => onSelect(u)}
              className="bg-slate-900/50 border border-white/5 p-4 rounded-[2rem] flex items-center justify-between group hover:border-lime-400/50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                 <img src={u.avatar} className="w-14 h-14 rounded-2xl bg-slate-800 ring-1 ring-white/5 shadow-lg group-hover:scale-110 transition-transform" />
                 <div>
                    <h4 className="text-white font-black group-hover:text-lime-400 transition-colors">{u.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[9px] font-black text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-lg uppercase tracking-widest">{u.level}</span>
                       <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">{u.email.split('@')[0]}</span>
                    </div>
                 </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl text-slate-600 group-hover:text-lime-400 group-hover:bg-lime-400/10 transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          ))
        )}
      </div>

      <div className="bg-slate-900/30 border border-white/5 p-6 rounded-[2rem] flex items-start gap-4">
        <Star className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          Can't find your partner? Tell them to download <span className="text-white font-bold">PadelPulse AI</span> and create an account!
        </p>
      </div>
    </div>
  );
};

export default PlayerSelectorView;
