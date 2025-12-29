
import React, { useState } from 'react';
import { Trophy, ChevronLeft, ArrowRight } from 'lucide-react';

interface CreateLeagueViewProps {
  onSubmit: (name: string) => void;
  onBack: () => void;
}

const CreateLeagueView: React.FC<CreateLeagueViewProps> = ({ onSubmit, onBack }) => {
  const [name, setName] = useState('');

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Create League</h2>
          <p className="text-slate-500 text-sm font-medium">Start your own Padel community</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-8 space-y-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center text-center py-8">
           <div className="w-20 h-20 bg-lime-400 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-lime-400/20 mb-6">
             <Trophy className="w-10 h-10 text-slate-950" />
           </div>
           <h3 className="text-xl font-black text-white mb-2">Build Your Bracket</h3>
           <p className="text-slate-500 text-sm max-w-[240px]">As Admin, you can record official match results and manage members.</p>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">League Name</label>
          <input 
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. London Padel Masters"
            className="w-full bg-slate-950 border border-white/10 rounded-[2rem] py-6 px-8 text-white text-lg font-black placeholder:text-slate-800 focus:border-lime-400 outline-none transition-all shadow-inner"
          />
        </div>

        <button 
          onClick={() => name.trim() && onSubmit(name)}
          disabled={!name.trim()}
          className="w-full bg-lime-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-lime-300 transition-all shadow-2xl shadow-lime-500/10 active:scale-95"
        >
          START LEAGUE <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default CreateLeagueView;
