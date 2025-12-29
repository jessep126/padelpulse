
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, StopCircle, RefreshCcw, Activity, ShieldAlert, Plus, Minus, Volume2, RotateCcw, Trophy, Save, Edit3 } from 'lucide-react';
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
  onFinish: (score: string, teamAWon: boolean) => void;
}

const RecordingView: React.FC<RecordingViewProps> = ({ tournamentMatch, homeName, onFinish }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [scoreA, setScoreA] = useState(0); 
  const [scoreB, setScoreB] = useState(0); 
  const [logs, setLogs] = useState<MatchPoint[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customOpponent, setCustomOpponent] = useState('Opponent');

  const teamAName = tournamentMatch ? tournamentMatch.sideA.join(' & ') : homeName;
  const teamBName = tournamentMatch ? tournamentMatch.sideB.join(' & ') : customOpponent;

  const getScoreString = useCallback((sA: number, sB: number) => {
    return `${PADEL_SCORES[sA]}-${PADEL_SCORES[sB]}`;
  }, []);

  const announceScore = async (winner: string, newScore: string) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const winName = winner === "Team A" ? teamAName : (winner === "Team B" ? teamBName : "");
    const text = winner !== "none" ? `Point to ${winName}. Score is ${newScore}.` : `Current score is ${newScore}.`;
    const base64Audio = await padelAI.generateSpeech(text);
    if (base64Audio && audioCtxRef.current) {
      const audioBuffer = await decodeAudioData(
        decodeBase64(base64Audio),
        audioCtxRef.current,
        24000,
        1
      );
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtxRef.current.destination);
      source.start();
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied. Please enable permissions.");
      console.error(err);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

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
    if (!isRecording) return;
    const frame = captureFrame();
    if (!frame) return;

    setIsAnalyzing(true);
    try {
      const currentScoreStr = getScoreString(scoreA, scoreB);
      const result = await padelAI.analyzeMatchFrame(frame, currentScoreStr);
      
      if (result) {
        let win = result.winner;
        let nextA = scoreA;
        let nextB = scoreB;

        if (win === "Team A") {
          nextA = Math.min(scoreA + 1, 5);
          setScoreA(nextA);
        } else if (win === "Team B") {
          nextB = Math.min(scoreB + 1, 5);
          setScoreB(nextB);
        }

        const newScoreStr = getScoreString(nextA, nextB);

        setLogs(prev => [{
          timestamp: Date.now(),
          score: newScoreStr,
          description: result.description,
          isHighlight: result.isHighlight,
          frame: `data:image/jpeg;base64,${frame}`
        }, ...prev.slice(0, 19)]);

        if (win !== "none") {
          announceScore(win, newScoreStr);
        }
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const manualAdjust = (team: 'A' | 'B', direction: 1 | -1) => {
    let nextA = scoreA;
    let nextB = scoreB;

    if (team === 'A') {
      nextA = Math.max(0, Math.min(scoreA + direction, 5));
      setScoreA(nextA);
    } else {
      nextB = Math.max(0, Math.min(scoreB + direction, 5));
      setScoreB(nextB);
    }

    const newScore = getScoreString(nextA, nextB);
    announceScore("none", newScore);
    
    setLogs(prev => [{
      timestamp: Date.now(),
      score: newScore,
      description: `Manual adjustment for ${team === 'A' ? teamAName : teamBName}`,
      isHighlight: false,
    }, ...prev.slice(0, 19)]);
  };

  const handleSaveAndExit = () => {
    if (confirm("Finish match and save score?")) {
      onFinish(getScoreString(scoreA, scoreB), scoreA > scoreB);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(runAnalysis, 12000); 
    }
    return () => clearInterval(interval);
  }, [isRecording, scoreA, scoreB]);

  const toggleRecording = () => {
    const nextState = !isRecording;
    setIsRecording(nextState);
    if (nextState) {
      setLogs([]);
      setScoreA(0);
      setScoreB(0);
      announceScore("none", "0-0");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24 animate-in fade-in duration-500">
      <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover opacity-90"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
        
        {/* Top Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {isRecording && (
            <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest animate-pulse shadow-lg ring-1 ring-white/20">
              <Activity className="w-3 h-3" /> LIVE TRACKING
            </div>
          )}
          {isAnalyzing && (
            <div className="flex items-center gap-2 bg-lime-400/90 backdrop-blur-md text-slate-950 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-lg">
              <RefreshCcw className="w-3 h-3 animate-spin" /> ANALYZING FRAME
            </div>
          )}
        </div>

        {/* HUD Scoreboard */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 flex items-center gap-4 shadow-2xl min-w-[180px]">
          <div className="flex flex-col items-center flex-1 min-w-0">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter truncate w-full text-center">{teamAName}</span>
             <span className="text-2xl font-black text-white tabular-nums leading-none mt-1">{PADEL_SCORES[scoreA]}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center flex-1 min-w-0">
             {!tournamentMatch ? (
               <input 
                 type="text" 
                 value={customOpponent} 
                 onChange={(e) => setCustomOpponent(e.target.value)}
                 className="text-[8px] font-black text-slate-500 uppercase tracking-tighter truncate w-full text-center bg-transparent border-none outline-none focus:text-lime-400"
               />
             ) : (
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter truncate w-full text-center">{teamBName}</span>
             )}
             <span className="text-2xl font-black text-white tabular-nums leading-none mt-1">{PADEL_SCORES[scoreB]}</span>
          </div>
        </div>

        {error && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-20">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
            <h3 className="text-xl font-bold text-white mb-2 uppercase">Camera Required</h3>
            <p className="text-slate-400 max-w-xs mb-8 text-sm">Mount your phone at the back of the court for optimal AI point tracking.</p>
            <button onClick={startCamera} className="bg-white text-slate-950 px-10 py-4 rounded-2xl font-black uppercase text-xs hover:bg-slate-200 transition-all shadow-xl">Enable Permissions</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-5 items-center shadow-xl">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 truncate w-full text-center px-2">{teamAName}</span>
          <div className="flex flex-col items-center gap-2 w-full">
            <button onClick={() => manualAdjust('A', 1)} className="w-full aspect-square flex items-center justify-center bg-lime-400 text-slate-950 rounded-3xl shadow-lg active:scale-95 transition-transform">
              <Plus className="w-10 h-10 stroke-[3]" />
            </button>
            <div className="py-4"><span className="text-6xl font-black text-white tabular-nums">{PADEL_SCORES[scoreA]}</span></div>
            <button onClick={() => manualAdjust('A', -1)} className="w-full py-4 flex items-center justify-center bg-slate-800 text-slate-500 rounded-3xl active:scale-95 transition-transform">
              <Minus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-5 items-center shadow-xl">
          <div className="flex items-center gap-1 mb-4 w-full justify-center px-2">
            {!tournamentMatch ? (
               <div className="flex items-center gap-2 group">
                 <input 
                   type="text" 
                   value={customOpponent} 
                   onChange={(e) => setCustomOpponent(e.target.value)}
                   className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-transparent border-none outline-none focus:text-white transition-colors text-center max-w-[80px]"
                 />
                 <Edit3 className="w-3 h-3 text-slate-700 group-hover:text-slate-500" />
               </div>
            ) : (
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] truncate text-center">{teamBName}</span>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 w-full">
            <button onClick={() => manualAdjust('B', 1)} className="w-full aspect-square flex items-center justify-center bg-lime-400 text-slate-950 rounded-3xl shadow-lg active:scale-95 transition-transform">
              <Plus className="w-10 h-10 stroke-[3]" />
            </button>
            <div className="py-4"><span className="text-6xl font-black text-white tabular-nums">{PADEL_SCORES[scoreB]}</span></div>
            <button onClick={() => manualAdjust('B', -1)} className="w-full py-4 flex items-center justify-center bg-slate-800 text-slate-500 rounded-3xl active:scale-95 transition-transform">
              <Minus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggleRecording}
          className={`flex-1 py-6 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 ${
            isRecording ? 'bg-red-500/10 border border-red-500/30 text-red-500' : 'bg-white text-slate-950 hover:bg-slate-200'
          }`}
        >
          {isRecording ? <StopCircle className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
          {isRecording ? 'STOP AI' : 'START AI'}
        </button>
        
        <button 
          onClick={handleSaveAndExit}
          className="flex-1 py-6 rounded-[2rem] bg-lime-400 text-slate-950 font-black flex items-center justify-center gap-3 shadow-xl hover:bg-lime-300 transition-all active:scale-95"
        >
          <Save className="w-6 h-6" /> SAVE & FINISH
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-lime-400" /> AI Game Log
          </h3>
          <span className="text-[10px] text-slate-700 font-bold uppercase tracking-tighter">Live Timeline</span>
        </div>
        <div className="grid gap-3">
          {logs.length === 0 ? (
            <div className="text-center py-16 text-slate-700 bg-slate-900/10 border-2 border-dashed border-slate-900 rounded-[3rem]">
              <p className="font-bold text-sm italic opacity-50">Match events will appear here as the AI detects points</p>
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={log.timestamp + i} className={`group flex items-center gap-4 p-4 rounded-3xl border transition-all ${log.isHighlight ? 'bg-lime-500/10 border-lime-500/30 shadow-lg scale-[1.02]' : 'bg-slate-900/40 border-white/5'}`}>
                {log.frame ? (
                  <div className="w-20 h-14 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 shadow-inner ring-1 ring-white/10 relative">
                    <img src={log.frame} className="w-full h-full object-cover" />
                    {log.isHighlight && <div className="absolute top-1 right-1 bg-yellow-400 w-2 h-2 rounded-full shadow-lg" />}
                  </div>
                ) : (
                  <div className="w-20 h-14 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 border border-white/5"><Activity className="w-4 h-4 text-slate-700" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lime-400 font-black text-xs tabular-nums tracking-tighter bg-slate-950 px-2 py-0.5 rounded-lg ring-1 ring-white/5">{log.score}</span>
                    <span className="text-[9px] font-black text-slate-600 uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold leading-tight line-clamp-2">{log.description}</p>
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
