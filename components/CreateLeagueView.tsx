
import React, { useState } from 'react';
import { Trophy, ChevronLeft, ArrowRight, Shield, CalendarDays } from 'lucide-react';

interface CreateLeagueViewProps {
  onSubmit: (name: string, type: 'league' | 'tournament') => void;
  onBack: () => void;
}

const CreateLeagueView: React.FC<CreateLeagueViewProps> = ({ onSubmit, onBack }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'league' | 'tournament'>('league');
  const [step, setStep] = useState<'type' | 'name'>('type');

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={step === 'type' ? onBack : () => setStep('type')} className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            {step === 'type' ? 'Select Format' : `Create ${type === 'league' ? 'League' : 'Tournament'}`}
          </h2>
          <p className="text-slate-500 text-sm font-medium">Setup your Padel competition</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-8 space-y-10 shadow-2xl relative overflow-hidden">
        {step === 'type' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setType('league')}
                className={`flex items-center gap-6 p-8 rounded-[2.5rem] border-2 text-left transition-all group ${
                  type === 'league' ? 'bg-lime-400 border-lime-400 text-slate-950 shadow-xl shadow-lime-400/20' : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'
                }`}
              >
                <div className={`p-4 rounded-2xl transition-colors ${type === 'league' ? 'bg-slate-950 text-lime-400' : 'bg-slate-900 text-slate-500 group-hover:text-white'}`}>
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-lg uppercase italic mb-1">Persistent League</h4>
                  <p className={`text-xs font-bold leading-relaxed ${type === 'league' ? 'text-slate-800' : 'text-slate-500'}`}>
                    Continuous season tracking with global leaderboards and rank progression.
                  </p>
                </div>
              </button>

              <button 
                onClick={() => setType('tournament')}
                className={`flex items-center gap-6 p-8 rounded-[2.5rem] border-2 text-left transition-all group ${
                  type === 'tournament' ? 'bg-blue-500 border-blue-500 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'
                }`}
              >
                <div className={`p-4 rounded-2xl transition-colors ${type === 'tournament' ? 'bg-slate-950 text-blue-500' : 'bg-slate-900 text-slate-500 group-hover:text-white'}`}>
                  <CalendarDays className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-lg uppercase italic mb-1">One-Time Tournament</h4>
                  <p className={`text-xs font-bold leading-relaxed ${type === 'tournament' ? 'text-blue-100/70' : 'text-slate-500'}`}>
                    Event-based competition with specific start dates and champion crowning.
                  </p>
                </div>
              </button>
            </div>

            <button 
              onClick={() => setStep('name')}
              className="w-full bg-white text-slate-950 font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl active:scale-95"
            >
              NEXT: ENTER NAME <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 ${type === 'league' ? 'bg-lime-400 shadow-lime-400/20' : 'bg-blue-500 shadow-blue-500/20'}`}>
                {type === 'league' ? <Shield className="w-10 h-10 text-slate-950" /> : <Trophy className="w-10 h-10 text-white" />}
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase italic">{type} Setup</h3>
              <p className="text-slate-500 text-sm max-w-[240px]">Give your {type} a name that players will recognize.</p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">{type} Name</label>
              <input 
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`e.g. ${type === 'league' ? 'London Padel Masters' : 'The Summer Open 2024'}`}
                className="w-full bg-slate-950 border border-white/10 rounded-[2rem] py-6 px-8 text-white text-lg font-black placeholder:text-slate-800 focus:border-lime-400 outline-none transition-all shadow-inner"
              />
            </div>

            <button 
              onClick={() => name.trim() && onSubmit(name, type)}
              disabled={!name.trim()}
              className={`w-full font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-95 ${
                type === 'league' 
                  ? 'bg-lime-400 text-slate-950 hover:bg-lime-300 shadow-lime-400/10' 
                  : 'bg-blue-500 text-white hover:bg-blue-400 shadow-blue-500/10'
              }`}
            >
              CREATE {type.toUpperCase()} <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateLeagueView;
