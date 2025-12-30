
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, StopCircle, Activity, Trophy, Save, Zap, GripHorizontal, Settings2, Volume2, Plus } from 'lucide-react';
import { padelAI } from '../services/geminiService';
import { MatchPoint, TournamentMatch, CourtEnd } from '../types';

// Audio decoding helpers for TTS playback
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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
  const [courtEnd, setCourtEnd] = useState<CourtEnd>('Side A');
  const [scoreA, setScoreA] = useState(0); 
  const [scoreB, setScoreB] = useState(0); 
  const [gamesA, setGamesA] = useState(0);
  const [gamesB, setGamesB] = useState(0);
  const [logs, setLogs] = useState<MatchPoint[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGameCelebration, setShowGameCelebration] = useState(false);
  const [gameWinnerName, setGameWinnerName] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const teamAName = tournamentMatch ? tournamentMatch.sideA.join(' & ') : homeName;
  const teamBName = tournamentMatch ? tournamentMatch.sideB.join(' & ') : opponentName;

  // Initialize AudioContext for TTS
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const announceScore = async (customText?: string) => {
    if (isMuted) return;
    const text = customText || `Score is ${PADEL_SCORES[scoreA]} ${PADEL_SCORES[scoreB]}`;
    const base64Audio = await padelAI.generateSpeech(text);
    if (base64Audio && audioCtxRef.current) {
      const audioData = decodeBase64(base64Audio);
      const buffer = await decodeAudioData(audioData, audioCtxRef.current, 24000, 1);
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtxRef.current.destination);
      source.start();
    }
  };

  const handlePoint = (team: 'A' | 'B') => {
    let nextA = scoreA;
    let nextB = scoreB;

    if (team === 'A') {
      if (scoreA < 3) {
        nextA = scoreA + 1;
      } else if (scoreA === 3) { // 40
        if (scoreB < 3) nextA = 5; // 40-0/15/30 -> Game
        else if (scoreB === 3) nextA = 4; // 40-40 -> Ad A
        else if (scoreB === 4) nextB = 3; // Ad B -> Deuce
      } else if (scoreA === 4) { // Ad A
        nextA = 5; // Game
      }
    } else {
      if (scoreB < 3) {
        nextB = scoreB + 1;
      } else if (scoreB === 3) { // 40
        if (scoreA < 3) nextB = 5; // 0/15/30-40 -> Game
        else if (scoreA === 3) nextB = 4; // 40-40 -> Ad B
        else if (scoreA === 4) nextA = 3; // Ad A -> Deuce
      } else if (scoreB === 4) { // Ad B
        nextB = 5; // Game
      }
    }

    // Check for Game win
    if (nextA === 5) {
      setGamesA(prev => prev + 1);
      setGameWinnerName(teamAName);
      setShowGameCelebration(true);
      setScoreA(0);
      setScoreB(0);
      announceScore(`Game for ${teamAName}`);
    } else if (nextB === 5) {
      setGamesB(prev => prev + 1);
      setGameWinnerName(teamBName);
      setShowGameCelebration(true);
      setScoreA(0);
      setScoreB(0);
      announceScore(`Game for ${teamBName}`);
    } else {
      setScoreA(nextA);
      setScoreB(nextB);
      announceScore(`${PADEL_SCORES[nextA]} ${PADEL_SCORES[nextB]}`);
    }
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

  const runAnalysis = async () => {
    if (!isRecording || showGameCelebration || isAnalyzing) return;
    const frame = captureFrame();
    if (!frame) return;

    setIsAnalyzing(true);
    try {
      const currentScoreString = `${PADEL_SCORES[scoreA]}-${PADEL_SCORES[scoreB]}`;
      const result = await padelAI.analyzeMatchFrame(frame, currentScoreString, courtEnd);
      
      if (result && result.winner !== "none") {
        const winningTeam = result.winner === "Team A" ? 'A' : 'B';
        handlePoint(winningTeam);
        
        setLogs(prev => [{
          timestamp: Date.now(),
          score: `${PADEL_SCORES[scoreA]}-${PADEL_SCORES[scoreB]}`,
          description: result.description,
          isHighlight: result.isHighlight,
          frame: `data:image/jpeg;base64,${frame}`
        }, ...prev.slice(0, 15)]);
      }
    } catch (e) {
      console.error("AI Analysis error:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(runAnalysis, 10000); // Analyze every 10s for point detection
    }
    return () => clearInterval(interval);
  }, [isRecording, scoreA, scoreB, showGameCelebration, courtEnd, isAnalyzing]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true })
      .then(stream => { 
        if (videoRef.current) videoRef.current.srcObject = stream; 
      });
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-24 relative min-h-[80vh]">
      {showGameCelebration && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-10 animate-in zoom-in duration-500 text-center">
           <Trophy className="w-20 h-20 text-lime-400 mb-6 animate-bounce" />
           <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">Game Secured!</h2>
           <p className="text-lime-400 text-2xl font-black mb-12 uppercase">{gameWinnerName}</p>
           <button 
             onClick={() => setShowGameCelebration(false)} 
             className="w-full max-w-xs bg-lime-400 text-slate-950 font-black py-6 rounded-3xl shadow-2xl active:scale-95 transition-all text-xl"
           >
             CONTINUE MATCH
           </button>
        </div>
      )}

      {/* Viewfinder with Padel Court Guide */}
      <div className="relative aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl ring-2 ring-white/5 group">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Alignment Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
           <div className="absolute inset-x-0 bottom-[15%] h-px bg-white" /> {/* Back service line */}
           <div className="absolute inset-y-0 left-1/2 w-px bg-white" /> {/* Center line */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-white uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full border border-white/10">Align Service 'T' & Net</div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />
        
        <div className="absolute top-6 left-6 flex items-center gap-2">
           <button 
             onClick={() => setCourtEnd(prev => prev === 'Side A' ? 'Side B' : 'Side A')}
             className="bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-[10px] font-black text-white flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg"
           >
             <Settings2 className="w-3 h-3 text-lime-400" /> SIDE: {courtEnd}
           </button>
           <button 
             onClick={() => setIsMuted(!isMuted)}
             className={`p-2 rounded-2xl border transition-all ${isMuted ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-slate-950/80 border-white/10 text-white'}`}
           >
             <Volume2 className="w-4 h-4" />
           </button>
        </div>

        <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
          {isRecording && (
            <div className="bg-red-600 text-white px-3 py-1.5 rounded-full text-[8px] font-black tracking-widest animate-pulse flex items-center gap-2 shadow-lg">
              <Activity className="w-2.5 h-2.5" /> LIVE TRACKING
            </div>
          )}
          {isAnalyzing && (
            <div className="bg-lime-400 text-slate-950 px-3 py-1.5 rounded-full text-[8px] font-black tracking-widest shadow-lg flex items-center gap-2">
              <Zap className="w-2.5 h-2.5 fill-current" /> ANALYZING SHOT...
            </div>
          )}
        </div>

        {/* Real-time Floating Scoreboard */}
        <div className="absolute inset-x-0 bottom-8 flex justify-center scale-90 sm:scale-100">
           <div className="bg-slate-950/90 backdrop-blur-2xl px-12 py-5 rounded-[2.5rem] border border-white/10 flex gap-12 items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 truncate max-w-[90px]">{teamAName}</p>
                <div className="flex items-center gap-3">
                   <span className="text-4xl font-black text-white italic">{gamesA}</span>
                   <span className="text-[12px] text-lime-400 font-black px-2.5 py-1 bg-lime-400/10 rounded-xl border border-lime-400/20 tabular-nums">
                     {PADEL_SCORES[scoreA]}
                   </span>
                </div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 truncate max-w-[90px]">{teamBName}</p>
                <div className="flex items-center gap-3">
                   <span className="text-[12px] text-lime-400 font-black px-2.5 py-1 bg-lime-400/10 rounded-xl border border-lime-400/20 tabular-nums">
                     {PADEL_SCORES[scoreB]}
                   </span>
                   <span className="text-4xl font-black text-white italic">{gamesB}</span>
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[ 
          { team: 'A', name: teamAName, score: scoreA }, 
          { team: 'B', name: teamBName, score: scoreB } 
        ].map((t) => (
          <div key={t.team} className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-6 text-center space-y-4 shadow-xl">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block truncate px-4">{t.name}</span>
             <div className="text-7xl font-black text-white italic tabular-nums py-2">{PADEL_SCORES[t.score]}</div>
             <button 
               onClick={() => handlePoint(t.team as 'A'|'B')} 
               className="w-full py-6 bg-lime-400 text-slate-950 font-black rounded-3xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all hover:bg-lime-300"
             >
               <Plus className="w-5 h-5" /> WIN POINT
             </button>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => setIsRecording(!isRecording)} 
          className={`flex-1 py-6 rounded-[2.5rem] font-black flex items-center justify-center gap-3 transition-all ${
            isRecording 
              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
              : 'bg-slate-900 text-white border border-white/10 shadow-2xl'
          }`}
        >
          {isRecording ? <StopCircle className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
          {isRecording ? 'STOP SESSION' : 'START AI TRACK'}
        </button>
        <button 
          onClick={() => onFinish(`${gamesA}-${gamesB}`, gamesA > gamesB)} 
          className="flex-1 py-6 bg-white text-slate-950 font-black rounded-[2.5rem] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all hover:bg-slate-100"
        >
          <Save className="w-6 h-6" /> FINAL SCORE
        </button>
      </div>

      <div className="space-y-4 pt-4">
         <div className="flex items-center justify-between px-4">
            <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">Live Match Engine</h3>
            <GripHorizontal className="w-4 h-4 text-slate-800" />
         </div>
         <div className="grid gap-3">
            {logs.length === 0 ? (
               <div className="text-center py-20 text-slate-700 bg-slate-950 border-2 border-dashed border-white/5 rounded-[3rem] px-8">
                  <Activity className="w-8 h-8 mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-xs italic">Awaiting technical detection... Align camera with the back glass for optimal Bandeja & Smash tracking.</p>
               </div>
            ) : (
               logs.map((log, i) => (
                  <div key={i} className={`flex items-center gap-5 p-5 rounded-[2.5rem] border animate-in slide-in-from-bottom-4 duration-500 ${
                    log.isHighlight ? 'bg-lime-400/5 border-lime-400/20 shadow-[0_10px_30px_rgba(163,230,53,0.05)]' : 'bg-slate-900/40 border-white/5 shadow-xl'
                  }`}>
                     {log.frame && (
                       <div className="relative w-24 h-16 shrink-0">
                         <img src={log.frame} className="w-full h-full rounded-2xl object-cover ring-2 ring-white/5 shadow-inner" />
                         {log.isHighlight && <div className="absolute inset-0 ring-2 ring-lime-400/50 rounded-2xl" />}
                       </div>
                     )}
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                           <span className="text-[10px] font-black text-lime-400 bg-lime-400/10 px-3 py-1 rounded-lg italic tabular-nums">{log.score}</span>
                           {log.isHighlight && (
                             <span className="flex items-center gap-1.5 text-[10px] font-black text-lime-400 uppercase tracking-widest">
                               <Zap className="w-3 h-3 fill-current" /> HIGHLIGHT
                             </span>
                           )}
                        </div>
                        <p className="text-[13px] text-slate-300 font-medium leading-snug">{log.description}</p>
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
