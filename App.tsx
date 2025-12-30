
import React, { useState, useEffect } from 'react';
import { AppView, TournamentMatch, UserStats, League, AppNotification, UserProfile, LeagueMatch } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RecordingView from './components/RecordingView';
import DiscoveryView from './components/DiscoveryView';
import HighlightsGallery from './components/HighlightsGallery';
import CreateTournamentView from './components/CreateTournamentView';
import MatchModeSelect from './components/MatchModeSelect';
import ManualScoreView from './components/ManualScoreView';
import OnboardingView from './components/OnboardingView';
import LeagueDashboardView from './components/LeagueDashboardView';
import CreateLeagueView from './components/CreateLeagueView';
import NotificationCenter from './components/NotificationCenter';
import PlayerSelectorView from './components/PlayerSelectorView';
import EmailSimulator, { EmailMessage } from './components/EmailSimulator';
import { padelAI } from './services/geminiService';
import { KeyRound, Zap, ShieldCheck, AlertCircle, Loader2, ExternalLink, CheckCircle2, ChevronRight } from 'lucide-react';

// Fix: Define AIStudio interface to match system expectations and resolve identical modifier errors
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio: AIStudio;
  }
}

const MOCK_GLOBAL_USERS: UserProfile[] = [
  { id: 'u1', name: 'Ale Galán', email: 'ale@padelpuls.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ale', level: 'Pro', verified: true },
  { id: 'u2', name: 'Paula Josemaría', email: 'paula@padelpuls.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Paula', level: 'Pro', verified: true },
  { id: 'u3', name: 'Juan Lebrón', email: 'juan@padelpuls.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan', level: 'Pro', verified: true },
  { id: 'u4', name: 'Marta Ortega', email: 'marta@padelpuls.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marta', level: 'Advanced', verified: true }
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isAiConnected, setIsAiConnected] = useState<boolean | null>(null);
  const [pendingMatchMode, setPendingMatchMode] = useState<AppView | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<UserProfile | null>(null);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('padel_user_name'));
  const [userId, setUserId] = useState(() => {
    let id = localStorage.getItem('padel_user_id');
    if (!id) {
      id = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('padel_user_id', id);
    }
    return id;
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('padel_user_stats');
    return saved ? JSON.parse(saved) : { wins: 0, losses: 0, matches: 0, points: 0, smashWinRate: 74, netPointsWon: 124 };
  });
  
  const [leagues, setLeagues] = useState<League[]>(() => {
    const saved = localStorage.getItem('padel_leagues');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`padel_notifs_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('padel_global_users');
    return saved ? JSON.parse(saved) : MOCK_GLOBAL_USERS;
  });

  const [activeTournamentMatch, setActiveTournamentMatch] = useState<TournamentMatch | null>(null);
  const [tournamentMatches, setTournamentMatches] = useState<TournamentMatch[]>([]);

  useEffect(() => {
    checkAiConnection();
  }, []);

  const checkAiConnection = async () => {
    try {
      // Fix: Use typed window.aistudio instead of any cast
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsAiConnected(hasKey);
    } catch (e) {
      setIsAiConnected(true);
    }
  };

  const handleConnectAi = async () => {
    try {
      // Fix: Use typed window.aistudio instead of any cast
      await window.aistudio.openSelectKey();
      setIsAiConnected(true);
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  useEffect(() => {
    if (!userName && isAiConnected) setActiveView(AppView.ONBOARDING);
  }, [userName, isAiConnected]);

  const handleCompleteOnboarding = (data: { name: string, email: string, level: string, existingId?: string }) => {
    const finalId = data.existingId || Math.random().toString(36).substr(2, 9);
    const newProfile: UserProfile = {
      id: finalId,
      name: data.name,
      email: data.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      level: data.level,
      verified: true
    };
    setUserName(data.name);
    setUserId(finalId);
    setAllUsers(prev => [...prev.filter(u => u.id !== finalId), newProfile]);
    localStorage.setItem('padel_user_name', data.name);
    localStorage.setItem('padel_user_id', finalId);
    setActiveView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    localStorage.removeItem('padel_user_name');
    setUserName(null);
    setActiveView(AppView.ONBOARDING);
  };

  const handleMatchFinish = async (score: string, teamAWon: boolean) => {
    if (!selectedOpponent) return;
    const matchId = Math.random().toString(36).substr(2, 9);
    const newMatch: LeagueMatch = {
      id: matchId,
      date: new Date().toLocaleDateString(),
      playerA: userId,
      playerB: selectedOpponent.id,
      playerAName: userName || 'Me',
      playerBName: selectedOpponent.name,
      score,
      winnerId: teamAWon ? userId : selectedOpponent.id,
      status: 'pending',
      confirmedBy: [userId]
    };

    const notif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'match_confirmation',
      fromName: userName || 'Player',
      matchId: matchId,
      timestamp: Date.now(),
      status: 'pending'
    };

    localStorage.setItem(`padel_match_data_${matchId}`, JSON.stringify(newMatch));
    const targetNotifsKey = `padel_notifs_${selectedOpponent.id}`;
    const existing = JSON.parse(localStorage.getItem(targetNotifsKey) || '[]');
    localStorage.setItem(targetNotifsKey, JSON.stringify([notif, ...existing]));

    if (selectedOpponent.id === userId) setNotifications(prev => [notif, ...prev]);

    try {
      const emailData = await padelAI.composeEmail('invite', { 
        name: selectedOpponent.name, 
        sender: userName,
        leagueName: 'Match Confirmation'
      });
      setEmails(prev => [{ id: Math.random().toString(36).substr(2, 9), subject: emailData.subject, body: emailData.body, timestamp: Date.now() }, ...prev]);
    } catch (e) {
      if (e instanceof Error && e.message.includes("Requested entity was not found")) setIsAiConnected(false);
    }
    setSelectedOpponent(null);
    setActiveView(AppView.DASHBOARD);
  };

  if (isAiConnected === null) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-lime-400 animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Initializing AI Engine...</p>
      </div>
    );
  }

  if (isAiConnected === false) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center p-6 overflow-y-auto">
        <div className="w-full max-w-xl mx-auto space-y-10 py-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-lime-400/10 rounded-[2rem] flex items-center justify-center mb-6 relative">
               <Zap className="w-10 h-10 text-lime-400 fill-current" />
               <div className="absolute -top-1 -right-1 bg-red-500 p-1.5 rounded-full border-4 border-slate-950">
                  <AlertCircle className="w-3 h-3 text-white" />
               </div>
            </div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">AI Engine Offline</h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              PadelPulse needs a Professional Gemini Key. Follow this guide to activate your courtside commentator.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              { 
                step: 1, 
                title: "Enable Paid Billing", 
                desc: "Go to Google Cloud Console and ensure your 'PadelPulse' project is linked to a Paid account.",
                link: "https://console.cloud.google.com/billing",
                icon: ShieldCheck
              },
              { 
                step: 2, 
                title: "Turn on AI Engine", 
                desc: "Search for 'Generative Language API' in your project and click ENABLE.",
                link: "https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com",
                icon: Zap
              },
              { 
                step: 3, 
                title: "Get Secret Key", 
                desc: "Go to AI Studio, select 'Create API key in existing project', choose PadelPulse, and copy the code.",
                link: "https://aistudio.google.com/app/apikey",
                icon: KeyRound
              }
            ].map((s) => (
              <div key={s.step} className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] flex items-start gap-5 group hover:border-lime-400/30 transition-all">
                <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-lime-400 transition-colors font-black text-xs shrink-0 border border-white/5">
                  0{s.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-black uppercase text-sm italic group-hover:text-lime-400 transition-colors">{s.title}</h3>
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-950 rounded-lg text-slate-600 hover:text-white transition-all">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-slate-500 text-xs leading-snug">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6 pt-4">
            <button 
              onClick={handleConnectAi}
              className="w-full bg-lime-400 text-slate-950 font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(163,230,53,0.2)] hover:bg-lime-300 active:scale-95 transition-all text-lg"
            >
              <CheckCircle2 className="w-6 h-6" /> READY: CONNECT ENGINE
            </button>
            <p className="text-center text-[10px] font-black text-slate-700 uppercase tracking-widest">
              You must select the key in the popup after clicking
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    if (activeView === AppView.ONBOARDING) {
      return (
        <OnboardingView 
          existingUsers={allUsers} 
          onComplete={handleCompleteOnboarding} 
          onSendEmail={(s, b) => setEmails(prev => [{ id: Math.random().toString(36).substr(2, 9), subject: s, body: b, timestamp: Date.now() }, ...prev])} 
          onAiFailure={() => setIsAiConnected(false)}
        />
      );
    }

    switch (activeView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard 
            onAction={setActiveView} 
            userStats={userStats} 
            userName={userName || 'Player'} 
            leagues={leagues}
            onSelectLeague={(id) => { setActiveLeagueId(id); setActiveView(AppView.LEAGUE_DASHBOARD); }}
            notificationCount={notifications.length}
          />
        );
      case AppView.SELECT_OPPONENT:
        return (
          <PlayerSelectorView 
            allUsers={allUsers.filter(u => u.id !== userId)} 
            onSelect={(opponent) => {
               setSelectedOpponent(opponent);
               setActiveView(pendingMatchMode || AppView.RECORD);
            }} 
            onBack={() => setActiveView(AppView.MATCH_MODE_SELECT)}
          />
        );
      case AppView.RECORD:
        return (
          <RecordingView 
            tournamentMatch={activeTournamentMatch} 
            homeName={userName || 'Home Team'}
            opponentName={selectedOpponent?.name || 'Opponent'}
            onFinish={handleMatchFinish}
            onAiFailure={() => setIsAiConnected(false)}
          />
        );
      case AppView.DISCOVERY: 
        return (
          <DiscoveryView 
            allUsers={allUsers.filter(u => u.id !== userId)} 
            onChallenge={(opponent) => {
              setSelectedOpponent(opponent);
              setActiveView(AppView.MATCH_MODE_SELECT);
            }} 
            onAiFailure={() => setIsAiConnected(false)}
          />
        );
      case AppView.MATCH_MODE_SELECT:
        return <MatchModeSelect onSelect={(view) => {
          setPendingMatchMode(view);
          setActiveView(AppView.SELECT_OPPONENT);
        }} onBack={() => setActiveView(AppView.DASHBOARD)} />;
      case AppView.MANUAL_SCORE:
        return <ManualScoreView homeName={userName || 'Home Team'} opponentName={selectedOpponent?.name || 'Opponent'} onBack={() => setActiveView(AppView.MATCH_MODE_SELECT)} onSave={handleMatchFinish} />;
      default:
        return <Dashboard onAction={setActiveView} userStats={userStats} userName={userName || 'Player'} leagues={leagues} onSelectLeague={(id) => { setActiveLeagueId(id); setActiveView(AppView.LEAGUE_DASHBOARD); }} notificationCount={notifications.length} />;
    }
  };

  return (
    <>
      <EmailSimulator emails={emails} onClose={(id) => setEmails(prev => prev.filter(e => e.id !== id))} />
      <Layout activeView={activeView} setView={setActiveView} hasNotifications={notifications.length > 0} onLogout={handleLogout}>
        {renderView()}
      </Layout>
    </>
  );
};

export default App;
