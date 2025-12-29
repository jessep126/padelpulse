
import React, { useState } from 'react';
import { ChevronLeft, Save, Plus, Minus, Trophy, Edit2 } from 'lucide-react';

interface ManualScoreViewProps {
  homeName: string;
  opponentName: string;
  onBack: () => void;
  onSave: (score: string, teamAWon: boolean) => void;
}

const ManualScoreView: React.FC<ManualScoreViewProps> = ({ homeName, opponentName, onBack, onSave }) => {
  const [setsA, setSetsA] = useState([0, 0, 0]);
  const [setsB, setSetsB] = useState([0, 0, 0]);

  const adjustScore = (team: 'A' | 'B', index: number, delta: number) => {
    if (team === 'A') {
      const next = [...setsA];
      next[index] = Math.max(0, Math.min(7, next[index] + delta));
      setSetsA(next);
    } else {
      const next = [...setsB];
      next[index] = Math.max(0, Math.min(7, next[index] + delta));
      setSetsB(next);
    }
  };

  const handleSave = () => {
    const scoreStr = setsA.map((s, i) => `${s}-${setsB[i]}`).filter(s => s !== '0-0').join(', ');
    
    let winsA = 0;
    let winsB = 0;
    setsA.forEach((s, i) => {
      if (s > setsB[i]) winsA++;
      else if (setsB[i] > s) winsB++;
    });

    onSave(scoreStr || '0-0', winsA > winsB);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Manual Log</h2>
          <p className="text-slate-500 text-sm font-medium">Record match results manually</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-8 space-y-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-lime-400 opacity-50" />
        
        <div className="flex justify-between items-start px-2 gap-4">
          <div className="text-center flex-1 min-w-0">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">HOME</span>
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
              <span className="text-sm font-black text-lime-400 truncate block">{homeName}</span>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-600 font-black text-[10px] ring-4 ring-slate-950">VS</div>
          </div>

          <div className="text-center flex-1 min-w-0">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">AWAY</span>
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
               <span className="text-sm font-black text-white truncate block">{opponentName}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 bg-slate-950/30 p-5 rounded-[2.5rem] border border-white/5">
              <div className="flex flex-col items-center gap-1">
                <button onClick={() => adjustScore('A', i, 1)} className="p-3 bg-slate-800 rounded-xl text-white hover:bg-slate-700 active:scale-90 transition-all shadow-md"><Plus className="w-4 h-4" /></button>
                <span className="text-4xl font-black text-white tabular-nums py-2">{setsA[i]}</span>
                <button onClick={() => adjustScore('A', i, -1)} className="p-3 bg-slate-800 rounded-xl text-slate-500 hover:bg-slate-700 active:scale-90 transition-all"><Minus className="w-4 h-4" /></button>
              </div>
              
              <div className="flex-1 flex flex-col items-center">
                <div className="h-px w-full bg-white/5 mb-3" />
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Set {i + 1}</span>
                <div className="h-px w-full bg-white/5 mt-3" />
              </div>

              <div className="flex flex-col items-center gap-1">
                <button onClick={() => adjustScore('B', i, 1)} className="p-3 bg-slate-800 rounded-xl text-white hover:bg-slate-700 active:scale-90 transition-all shadow-md"><Plus className="w-4 h-4" /></button>
                <span className="text-4xl font-black text-white tabular-nums py-2">{setsB[i]}</span>
                <button onClick={() => adjustScore('B', i, -1)} className="p-3 bg-slate-800 rounded-xl text-slate-500 hover:bg-slate-700 active:scale-90 transition-all"><Minus className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-white text-slate-950 font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-lime-400 hover:scale-[1.02] transition-all shadow-2xl active:scale-95"
        >
          <Save className="w-6 h-6" /> SUBMIT RESULT
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 bg-slate-900/30 p-4 rounded-3xl border border-white/5">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">
          Results must be confirmed by your opponent to count.
        </p>
      </div>
    </div>
  );
};

export default ManualScoreView;
