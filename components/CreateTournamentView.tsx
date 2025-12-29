
import React, { useState } from 'react';
import { AppView, TournamentType, TournamentMatch } from '../types';
import { Trophy, Users, User, Plus, X, ChevronRight, Camera, FileEdit, Trash2, CheckCircle2, PlayCircle } from 'lucide-react';

interface CreateTournamentViewProps {
  matches: TournamentMatch[];
  setMatches: (matches: TournamentMatch[]) => void;
  onStartRecording: (match: TournamentMatch) => void;
}

const CreateTournamentView: React.FC<CreateTournamentViewProps> = ({ matches, setMatches, onStartRecording }) => {
  const [step, setStep] = useState<'config' | 'players' | 'matches'>(matches.length > 0 ? 'matches' : 'config');
  const [type, setType] = useState<TournamentType>('Doubles');
  const [playerInputs, setPlayerInputs] = useState<string[]>(['', '', '', '']);

  const handleAddPlayer = () => {
    setPlayerInputs([...playerInputs, '']);
  };

  const handleRemovePlayer = (index: number) => {
    const next = [...playerInputs];
    next.splice(index, 1);
    setPlayerInputs(next);
  };

  const handlePlayerChange = (index: number, val: string) => {
    const next = [...playerInputs];
    next[index] = val;
    setPlayerInputs(next);
  };

  const generateMatches = () => {
    const players = playerInputs.filter(p => p.trim() !== '');
    if (players.length < (type === 'Singles' ? 2 : 4)) {
      alert("Not enough players for this type!");
      return;
    }

    const generated: TournamentMatch[] = [];
    if (type === 'Singles') {
      for (let i = 0; i < players.length; i += 2) {
        if (players[i+1]) {
          generated.push({
            id: Math.random().toString(36).substr(2, 9),
            sideA: [players[i]],
            sideB: [players[i+1]],
            score: '0-0',
            completed: false
          });
        }
      }
    } else {
      for (let i = 0; i < players.length; i += 4) {
        if (players[i+3]) {
          generated.push({
            id: Math.random().toString(36).substr(2, 9),
            sideA: [players[i], players[i+1]],
            sideB: [players[i+2], players[i+3]],
            score: '0-0',
            completed: false
          });
        }
      }
    }
    setMatches(generated);
    setStep('matches');
  };

  const updateMatchScoreManual = (id: string) => {
    const score = prompt("Enter final score (e.g. 6-4, 6-2):");
    if (score) {
      setMatches(matches.map(m => m.id === id ? { ...m, score, completed: true } : m));
    }
  };

  const resetTournament = () => {
    if (confirm("Reset tournament and clear all matches?")) {
      setMatches([]);
      setStep('config');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white">TOURNAMENT MAKER</h2>
          <p className="text-slate-500 text-sm">Organize your local bracket</p>
        </div>
        {matches.length > 0 && (
          <button 
            onClick={resetTournament}
            className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-3 py-1 rounded-full hover:bg-red-500/20 transition-all"
          >
            Reset
          </button>
        )}
      </div>

      {step === 'config' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setType('Singles')}
              className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${type === 'Singles' ? 'bg-lime-400 border-lime-400 text-slate-950' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'}`}
            >
              <User className="w-10 h-10" />
              <span className="font-black uppercase tracking-widest text-xs">Singles</span>
            </button>
            <button 
              onClick={() => setType('Doubles')}
              className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${type === 'Doubles' ? 'bg-lime-400 border-lime-400 text-slate-950' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'}`}
            >
              <Users className="w-10 h-10" />
              <span className="font-black uppercase tracking-widest text-xs">Doubles</span>
            </button>
          </div>
          
          <button 
            onClick={() => setStep('players')}
            className="w-full bg-white text-slate-950 font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl"
          >
            NEXT: ADD PLAYERS <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 'players' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Participating Players</h3>
            <div className="space-y-3">
              {playerInputs.map((p, i) => (
                <div key={i} className="flex gap-2 group">
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      value={p}
                      onChange={(e) => handlePlayerChange(i, e.target.value)}
                      placeholder={`Player ${i + 1}`}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-slate-700 focus:border-lime-400 transition-all outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => handleRemovePlayer(i)}
                    className="p-4 bg-slate-950 border border-white/10 rounded-2xl text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={handleAddPlayer}
              className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 font-bold hover:border-lime-400/50 hover:text-lime-400 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Player
            </button>
          </div>

          <button 
            onClick={generateMatches}
            className="w-full bg-lime-400 text-slate-950 font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl"
          >
            CREATE BRACKET <Trophy className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 'matches' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="grid gap-4">
            {matches.map((match, i) => (
              <div key={match.id} className={`bg-slate-900 border rounded-[2.5rem] overflow-hidden transition-all ${match.completed ? 'border-lime-500/20' : 'border-white/5'}`}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Match {i + 1}</span>
                    {match.completed ? (
                      <span className="bg-lime-400/10 text-lime-400 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border border-lime-400/20">
                        <CheckCircle2 className="w-3 h-3" /> COMPLETED
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" /> PENDING
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-6 text-center">
                    <div className="flex-1">
                      <p className="text-white font-black truncate text-sm">{match.sideA.join(' & ')}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border tabular-nums min-w-[80px] ${match.completed ? 'bg-lime-400 text-slate-950 border-lime-400' : 'bg-slate-950 border-white/10 text-lime-400'}`}>
                      <span className="font-black text-xl">{match.score}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-black truncate text-sm">{match.sideB.join(' & ')}</p>
                    </div>
                  </div>
                </div>

                {!match.completed && (
                  <div className="flex p-2 gap-2 bg-slate-950/50">
                    <button 
                      onClick={() => onStartRecording(match)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-slate-950 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all shadow-lg"
                    >
                      <Camera className="w-4 h-4" /> AI TRACK
                    </button>
                    <button 
                      onClick={() => updateMatchScoreManual(match.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-2xl font-black text-xs hover:bg-slate-700 transition-all"
                    >
                      <FileEdit className="w-4 h-4" /> MANUAL
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {matches.every(m => m.completed) && (
             <div className="bg-lime-400/10 border border-lime-400/30 rounded-[2.5rem] p-10 text-center space-y-4">
                <Trophy className="w-16 h-16 text-lime-400 mx-auto animate-bounce" />
                <h3 className="text-2xl font-black text-white">TOURNAMENT FINISHED!</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">Great matches! You can view the final highlights in the gallery.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-lime-400 text-slate-950 px-8 py-3 rounded-2xl font-black text-sm"
                >
                  Start New Season
                </button>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateTournamentView;
