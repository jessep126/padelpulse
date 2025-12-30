
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
import { KeyRound, Zap, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

// Using any to resolve conflict with pre-existing AIStudio global type in the environment
declare global {
  interface Window {
    aistudio: any;
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
      // Cast to any to bypass potential strict global type checks on aistudio
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setIsAiConnected(hasKey);
    } catch (e) {
      // Fallback if not in AI Studio environment or API is missing
      setIsAiConnected(true);
    }
  };

  const handleConnectAi = async () => {
    try {
      // Cast to any to bypass potential strict global type checks on aistudio
      await (window as any).aistudio.openSelectKey();
      // Assume selection was successful per race condition guidelines
      setIsAiConnected(true);
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  useEffect(() => {
    if (!userName && isAiConnected) setActiveView(AppView.ONBOARDING);
  }, [userName, isAiConnected]);

  useEffect(() => {
    localStorage.setItem('padel_user_stats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('padel_leagues', JSON.stringify(leagues));
  }, [leagues]);

  useEffect(() => {
    localStorage.setItem(`padel_notifs_${userId}`, JSON.stringify(notifications));
  }, [notifications, userId]);

  useEffect(() => {
    localStorage.setItem('padel_global_users', JSON.stringify(allUsers));
  }, [allUsers]);

  const sendSimulatedEmail = (subject: string, body: string) => {
    const newEmail: EmailMessage = {
      id: Math.random().toString(36).substr(2, 9),
      subject,
      body,
      timestamp: Date.now()
    };
    setEmails(prev => [newEmail, ...prev]);
  };

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
    
    setAllUsers(prev => {
      const filtered = prev.filter(u => u.id !== finalId);
      return [...filtered, newProfile];
    });
    
    localStorage.setItem('padel_user_name', data.name);
    localStorage.setItem('padel_user_id', finalId);
    localStorage.setItem('padel_user_email', data.email);
    localStorage.setItem('padel_user_level', data.level);
    
    setActiveView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    localStorage.removeItem('padel_user_name');
    localStorage.removeItem('padel_user_email');
    localStorage.removeItem('padel_user_level');
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

    const matchStoreKey = `padel_match_data_${matchId}`;
    localStorage.setItem(matchStoreKey, JSON.stringify(newMatch));

    const targetNotifsKey = `padel_notifs_${selectedOpponent.id}`;
    const existingTargetNotifs = JSON.parse(localStorage.getItem(targetNotifsKey) || '[]');
    localStorage.setItem(targetNotifsKey, JSON.stringify([notif, ...existingTargetNotifs]));

    if (selectedOpponent.id === userId) {
      setNotifications(prev => [notif, ...prev]);
    }

    try {
      const emailData = await padelAI.composeEmail('invite', { 
        name: selectedOpponent.name, 
        sender: userName,
        leagueName: 'Match Confirmation'
      });
      
      sendSimulatedEmail(emailData.subject, `[SENT TO ${selectedOpponent.email}]\n\n${emailData.body}`);

      if (navigator.share) {
        if (confirm(`Match finished! Internal notification sent. Would you like to nudge ${selectedOpponent.name} on WhatsApp or other platforms to confirm the result?`)) {
          try {
            await navigator.share({
              title: 'Padel Match Result Confirmation',
              text: emailData.share_text,
              url: window.location.origin + "/match/" + matchId
            });
          } catch (e) { console.error(e); }
        }
      } else {
        alert(`Match finished! Result sent for confirmation. Opponent notified.`);
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("Requested entity was not found")) {
        setIsAiConnected(false);
      }
      alert(`Match finished internally, but AI notification failed.`);
    }

    setSelectedOpponent(null);
    setActiveView(AppView.DASHBOARD);
  };

  const handleConfirmMatch = (matchId: string) => {
    const matchStoreKey = `padel_match_data_${matchId}`;
    const matchDataRaw = localStorage.getItem(matchStoreKey);
    if (!matchDataRaw) return;

    const matchData: LeagueMatch = JSON.parse(matchDataRaw);
    if (!matchData.confirmedBy.includes(userId)) {
      matchData.confirmedBy.push(userId);
    }

    if (matchData.confirmedBy.length >= 2) {
      matchData.status = 'confirmed';
      const isWin = matchData.winnerId === userId;
      updateStats(isWin);
    }

    localStorage.setItem(matchStoreKey, JSON.stringify(matchData));
    setNotifications(prev => prev.filter(n => n.matchId !== matchId));
    setActiveView(AppView.DASHBOARD);
  };

  const updateStats = (isWin: boolean, pointsEarned: number = 25) => {
    setUserStats(prev => ({
      ...prev,
      matches: prev.matches + 1,
      wins: isWin ? prev.wins + 1 : prev.wins,
      losses: isWin ? prev.losses : prev.losses + 1,
      points: prev.points + pointsEarned
    }));
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
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-lime-400/10 rounded-[2.5rem] flex items-center justify-center mb-8 relative">
           <Zap className="w-12 h-12 text-lime-400 fill-current" />
           <div className="absolute -top-2 -right-2 bg-red-500 p-2 rounded-full border-4 border-slate-950">
              <AlertCircle className="w-4 h-4 text-white" />
           </div>
        </div>
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">AI Engine Offline</h1>
        <p className="text-slate-400 max-w-sm mb-12 text-sm leading-relaxed">
          PadelPulse requires a connected <span className="text-white font-bold">Google Gemini API Key</span> from a paid GCP project to analyze your match logic and generate commentary.
        </p>
        <button 
          onClick={handleConnectAi}
          className="w-full max-w-xs bg-lime-400 text-slate-950 font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl shadow-lime-500/20 active:scale-95 transition-all"
        >
          <KeyRound className="w-6 h-6" /> CONNECT AI ENGINE
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors underline"
        >
          View Billing Documentation
        </a>
      </div>
    );
  }

  const renderView = () => {
    if (activeView === AppView.ONBOARDING) {
      return (
        <OnboardingView 
          existingUsers={allUsers} 
          onComplete={handleCompleteOnboarding} 
          onSendEmail={sendSimulatedEmail} 
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
      case AppView.NOTIFICATIONS:
        return (
          <NotificationCenter 
            notifications={notifications} 
            onAccept={(notif) => {
              if (notif.type === 'league_invite') {
                setNotifications(prev => prev.filter(n => n.id !== notif.id));
                setLeagues(prevLeagues => prevLeagues.map(l => {
                  if (l.id === notif.leagueId) {
                    if (l.members.some(m => m.id === userId)) return l;
                    return {
                      ...l,
                      members: [...l.members, { id: userId, name: userName || 'Me', role: 'member', wins: 0, matches: 0, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}` }]
                    };
                  }
                  return l;
                }));
              } else if (notif.type === 'match_confirmation') {
                handleConfirmMatch(notif.matchId!);
              }
            }}
            onDecline={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
            onBack={() => setActiveView(AppView.DASHBOARD)}
          />
        );
      case AppView.LEAGUE_DASHBOARD:
        const league = leagues.find(l => l.id === activeLeagueId);
        return league ? (
          <LeagueDashboardView 
            league={league} 
            userId={userId} 
            allPlatformUsers={allUsers}
            onSendInvite={async (targetId) => {
              const league = leagues.find(l => l.id === activeLeagueId);
              if (!league) return;
              const target = allUsers.find(u => u.id === targetId);
              if (!target) return;

              const newNotif: AppNotification = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'league_invite',
                fromName: userName || 'Player',
                leagueId: league.id,
                leagueName: league.name,
                timestamp: Date.now(),
                status: 'pending'
              };
              
              const targetNotifsKey = `padel_notifs_${targetId}`;
              const existingTargetNotifs = JSON.parse(localStorage.getItem(targetNotifsKey) || '[]');
              localStorage.setItem(targetNotifsKey, JSON.stringify([newNotif, ...existingTargetNotifs]));
              if (targetId === userId) setNotifications(prev => [newNotif, ...prev]);

              try {
                const emailData = await padelAI.composeEmail('invite', { 
                  name: target.name, 
                  sender: userName,
                  leagueName: league.name
                });
                
                sendSimulatedEmail(emailData.subject, `[SENT TO ${target.email}]\n\n${emailData.body}`);
                
                if (navigator.share && confirm(`Invite sent to internal platform. Nudge ${target.name} on other apps?`)) {
                  try {
                    await navigator.share({
                      title: 'Padel League Invitation',
                      text: emailData.share_text,
                      url: window.location.href
                    });
                  } catch (e) { console.error(e); }
                } else {
                  alert(`Invite sent!`);
                }
              } catch (e) {
                if (e instanceof Error && e.message.includes("Requested entity was not found")) {
                  setIsAiConnected(false);
                }
                alert(`Invite sent internally, AI template failed.`);
              }
            }}
            onUpdateLeague={(updated) => setLeagues(leagues.map(l => l.id === updated.id ? updated : l))}
            onBack={() => setActiveView(AppView.DASHBOARD)}
          />
        ) : null;
      case AppView.CREATE_LEAGUE:
        return <CreateLeagueView onSubmit={(name, type) => {
          const newLeague: League = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            type,
            adminId: userId,
            members: [{ id: userId, name: userName || 'Me', role: 'admin', wins: 0, matches: 0, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}` }],
            matches: []
          };
          setLeagues([...leagues, newLeague]);
          setActiveLeagueId(newLeague.id);
          setActiveView(AppView.LEAGUE_DASHBOARD);
        }} onBack={() => setActiveView(AppView.DASHBOARD)} />;
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
      case AppView.HIGHLIGHTS: return <HighlightsGallery />;
      case AppView.CREATE_TOURNAMENT: return <CreateTournamentView matches={tournamentMatches} setMatches={setTournamentMatches} onStartRecording={(m) => { setActiveTournamentMatch(m); setActiveView(AppView.RECORD); }} />;
      case AppView.MATCH_MODE_SELECT: return <MatchModeSelect onSelect={(view) => {
        setPendingMatchMode(view);
        setActiveView(AppView.SELECT_OPPONENT);
      }} onBack={() => setActiveView(AppView.DASHBOARD)} />;
      case AppView.MANUAL_SCORE: return <ManualScoreView homeName={userName || 'Home Team'} opponentName={selectedOpponent?.name || 'Opponent'} onBack={() => setActiveView(AppView.MATCH_MODE_SELECT)} onSave={handleMatchFinish} />;
      default: return <Dashboard onAction={setActiveView} userStats={userStats} userName={userName || 'Player'} leagues={[]} onSelectLeague={() => {}} notificationCount={0} />;
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
