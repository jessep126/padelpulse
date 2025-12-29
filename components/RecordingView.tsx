
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, StopCircle, RefreshCcw, Activity, ShieldAlert, Plus, Minus, Volume2, Trophy, Save, Edit3, ChevronRight, Zap } from 'lucide-react';
import { padelAI } from '../services/geminiService';
import { MatchPoint, TournamentMatch } from '../types';

// Helper for Audio Decoding
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const PADEL_SCORES = ['0', '15', '30', '40', 'Ad', 'Game'];

interface RecordingViewProps {
  tournamentMatch?: TournamentMatch | null;
  homeName: string;
  opponentName: string;
  onFinish: (score: string, teamAWon: boolean) => void;
}

const RecordingView: React.FC<RecordingViewProps> = ({ tournamentMatch, homeName, opponentName, onFinish }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [scoreA, setScoreA] = useState(0); 
  const [scoreB, setScoreB] = useState(0); 
  const [gamesA, setGamesA] = useState(0);
  const [gamesB, setGamesB] = useState(0);
  const [logs, setLogs] = useState<MatchPoint[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGameCelebration, setShowGameCelebration] = useState(false);
  const [gameWinnerName, setGameWinnerName] = useState('');

  const teamAName = tournamentMatch ? tournamentMatch.sideA.join(' & ') : homeName;
  const teamBName = tournamentMatch ? tournamentMatch.sideB.join(' & ') : opponentName;

  const getScoreString = useCallback((sA: number, sB: number) => {
    return `${PADEL_SCORES[sA]}-${PADEL_SCORES[sB]}`;
  }, []);

  const announceScore = async (winner: string, newScore: string, type: 'point' | 'game' = 'point') => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const winName = winner === "Team A" ? teamAName : teamBName;
    const text = type === 'game' 
      ? `Game set! ${winName} wins the game. The set score is ${gamesA} to ${gamesB}.`
      : winner !== "none" ? `Point to ${winName}. Score is ${newScore}.` : `Score is ${newScore}.`;
    
    const base64Audio = await padelAI.generateSpeech(text);
    if (base64Audio && audioCtxRef.current) {
      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioCtxRef.current, 24000, 1);
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtxRef.current.destination);
      source.start();
    }
  };

  const handlePoint = (team: 'A' | 'B') => {
    let nextA = scoreA;
    let nextB = scoreB;

    if (team === 'A') {
      if (scoreA === 3 && scoreB < 3) nextA = 5; // 40-0, 40-15, 40-30 -> Game
      else if (scoreA === 3 && scoreB === 3) nextA = 4; // Deuce -> Ad
      else if (scoreA === 4) nextA = 5; // Ad -> Game
      else if (scoreA === 3 && scoreB === 4) { nextA = 3; nextB = 3; } // Opponent Ad -> Deuce
      else nextA = scoreA + 1;
    } else {
      if (scoreB === 3 && scoreA < 3) nextB = 5;
      else if (scoreB === 3 && scoreA === 3) nextB = 4;
      else if (scoreB === 4) nextB = 5;
      // Fixed typo 'i' to 'scoreA' to correctly handle Team A Advantage losing to Team B point
      else if (scoreB === 3 && scoreA === 4) { nextB = 3; nextA = 3; }
      else if (scoreB === 3 && scoreA === 4) { nextB = 3; nextA = 3; }
      else nextB = scoreB + 1;
    }

    if (nextA === 5) {
      const newGamesA = gamesA + 1;
      setGamesA(newGamesA);
      setGameWinnerName(teamAName);
      setShowGameCelebration(true);
      announceScore("Team A", "Game", "game");
      setScoreA(0); setScoreB(0);
    } else if (nextB === 5) {
      const newGamesB = gamesB + 1;
      setGamesB(newGamesB);
      setGameWinnerName(teamBName);
      setShowGameCelebration(true);
      announceScore("Team B", "Game", "game");
      setScoreA(0); setScoreB(0);
    } else {
      setScoreA(nextA);
      setScoreB(nextB);
      announceScore(team === 'A' ? "Team A" : "Team B", getScoreString(nextA, nextB));
    }
  };

  const runAnalysis = async () => {
    if (!isRecording || showGameCelebration) return;
    const frame = captureFrame();
    if (!frame) return;
    setIsAnalyzing(true);
    try {
      const result = await padelAI.analyzeMatchFrame(frame, getScoreString(scoreA, scoreB));
      if (result && result.winner !== "none") {
        handlePoint(result.winner === "Team A" ? 'A' : 'B');
        setLogs(prev => [{
          timestamp: Date.now(),
          score: getScoreString(scoreA, scoreB),
          description: result.description,
          isHighlight: result.isHighlight,
          frame: `data:image/jpeg;base64,${frame}`
        }, ...prev.slice(0, 19)]);
      }
    } catch (err) { console.error(err); } finally { setIsAnalyzing(false); }
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return null;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    return canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
  }, []);

  useEffect(() => {
    let interval: number;
    if (isRecording) interval = window.setInterval(runAnalysis, 12000);
    return () => clearInterval(interval);
  }, [isRecording, scoreA, scoreB, showGameCelebration]);

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { setError("Camera access denied."); }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-24 relative min-h-[80vh]">
      {showGameCelebration && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in zoom-in duration-500 text-center">
           <div className="w-24 h-24 bg-lime-400 rounded-full flex items-center justify-center shadow-2xl shadow-lime-500/30 mb-8">
              <Trophy className="w-12 h-12 text-slate-950" />
           </div>
           <h2 className="text-4xl font-black text-white mb-2">GAME WON!</h2>
           <p className="text-lime-400 text-2xl font-black mb-12">{gameWinnerName.toUpperCase()}</p>
           
           <div className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] w-full max-w-xs mb-12">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Set Progression</p>
              <div className="flex items-center justify-center gap-8">
                 <div className="text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase mb-1 truncate max-w-[80px]">{teamAName}</p>
                    <p className="text-5xl font-black text-white">{gamesA}</p>
                 </div>
                 <div className="h-10 w-px bg-white/10" />
                 <div className="text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase mb-1 truncate max-w-[80px]">{teamBName}</p>
                    <p className="text-5xl font-black text-white">{gamesB}</p>
                 </div>
              </div>
           </div>

           <button 
             onClick={() => setShowGameCelebration(false)}
             className="w-full max-w-xs bg-white text-slate-950 font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
           >
             NEXT GAME <ChevronRight className="w-6 h-6" />
           </button>
        </div>
      )}

      <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />
        
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {isRecording && <div className="bg-red-600 text-white px-3 py-1 rounded-full text-[8px] font-black tracking-widest animate-pulse">LIVE TRACKING</div>}
          {isAnalyzing && <div className="bg-lime-400 text-slate-950 px-3 py-1 rounded-full text-[8px] font-black tracking-widest">AI SYNCING...</div>}
        </div>

        <div className="absolute inset-x-0 top-6 flex justify-center">
           <div className="bg-slate-950/80 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 flex gap-6 items-center shadow-2xl">
              <div className="text-center">
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-0.5 truncate max-w-[60px]">{teamAName}</p>
                <div className="flex items-center gap-2">
                   <span className="text-2xl font-black text-white tabular-nums">{gamesA}</span>
                   <span className="text-[10px] text-lime-400 font-black px-1.5 py-0.5 bg-lime-400/10 rounded-lg">{PADEL_SCORES[scoreA]}</span>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-0.5 truncate max-w-[60px]">{teamBName}</p>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-lime-400 font-black px-1.5 py-0.5 bg-lime-400/10 rounded-lg">{PADEL_SCORES[scoreB]}</span>
                   <span className="text-2xl font-black text-white tabular-nums">{gamesB}</span>
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-6 text-center space-y-4">
           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block truncate">{teamAName}</span>
           <div className="text-6xl font-black text-white tabular-nums py-2">{PADEL_SCORES[scoreA]}</div>
           <button 
             onClick={() => handlePoint('A')}
             className="w-full py-6 bg-lime-400 text-slate-950 font-black rounded-3xl flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
           >
             <Plus className="w-5 h-5" /> WIN POINT
           </button>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-6 text-center space-y-4">
           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block truncate">{teamBName}</span>
           <div className="text-6xl font-black text-white tabular-nums py-2">{PADEL_SCORES[scoreB]}</div>
           <button 
             onClick={() => handlePoint('B')}
             className="w-full py-6 bg-white text-slate-950 font-black rounded-3xl flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
           >
             <Plus className="w-5 h-5" /> WIN POINT
           </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`flex-1 py-6 rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all ${isRecording ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-slate-800 text-white border border-white/5'}`}
        >
          {isRecording ? <StopCircle className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
          {isRecording ? 'STOP AI' : 'START AI'}
        </button>
        <button 
          onClick={() => onFinish(`${gamesA}-${gamesB}`, gamesA > gamesB)}
          className="flex-1 py-6 bg-lime-400 text-slate-950 font-black rounded-[2rem] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
        >
          <Save className="w-6 h-6" /> FINISH MATCH
        </button>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Live Point Timeline</h3>
            <Activity className="w-4 h-4 text-lime-400 animate-pulse" />
         </div>
         <div className="grid gap-3">
            {logs.length === 0 ? (
               <div className="text-center py-12 text-slate-700 bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-[2.5rem]">
                  <p className="font-bold text-xs italic">Awaiting first point detection...</p>
               </div>
            ) : (
               logs.map((log, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-3xl border ${log.isHighlight ? 'bg-lime-500/5 border-lime-500/20' : 'bg-slate-900/40 border-white/5'}`}>
                     {log.frame && <img src={log.frame} className="w-16 h-12 rounded-xl object-cover ring-1 ring-white/5" />}
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-black text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-lg">{log.score}</span>
                           <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium truncate">{log.description}</p>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
};

export default RecordingView;
