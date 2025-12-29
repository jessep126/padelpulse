
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

const MOCK_GLOBAL_USERS: UserProfile[] = [
  { id: 'u1', name: 'Ale Galán', email: 'ale@padelpuls.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ale', level: 'Pro' },
  { id: 'u2', name: 'Paula Josemaría', email: 'paula@padelpuls.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Paula', level: 'Pro' },
  { id: 'u3', name: 'Juan Lebrón', email: 'juan@padelpuls.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan', level: 'Pro' },
  { id: 'u4', name: 'Marta Ortega', email: 'marta@padelpuls.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marta', level: 'Advanced' }
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [pendingMatchMode, setPendingMatchMode] = useState<AppView | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<UserProfile | null>(null);
  
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('padel_user_name'));
  const [userId] = useState(() => {
    let id = localStorage.getItem('padel_user_id');
    if (!id) {
      id = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('padel_user_id', id);
    }
    return id;
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('padel_user_stats');
    return saved ? JSON.parse(saved) : { wins: 0, losses: 0, matches: 0, points: 0 };
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
    if (!userName) setActiveView(AppView.ONBOARDING);
  }, [userName]);

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

  const handleCompleteOnboarding = (data: { name: string, email: string, level: string }) => {
    const newProfile: UserProfile = {
      id: userId,
      name: data.name,
      email: data.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      level: data.level
    };
    
    setUserName(data.name);
    setAllUsers(prev => {
      const filtered = prev.filter(u => u.id !== userId);
      return [...filtered, newProfile];
    });
    
    localStorage.setItem('padel_user_name', data.name);
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

  const handleMatchFinish = (score: string, teamAWon: boolean) => {
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

    // Store in global matches list (simulated by updating all leagues if it were a league match, 
    // but for now let's just create a notification for the other user)
    const notif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'match_confirmation',
      fromName: userName || 'Player',
      matchId: matchId,
      timestamp: Date.now(),
      status: 'pending'
    };

    // Simulated "Global Match Store" for confirmation
    const matchStoreKey = `padel_match_data_${matchId}`;
    localStorage.setItem(matchStoreKey, JSON.stringify(newMatch));

    // Send notification to opponent
    const targetNotifsKey = `padel_notifs_${selectedOpponent.id}`;
    const existingTargetNotifs = JSON.parse(localStorage.getItem(targetNotifsKey) || '[]');
    localStorage.setItem(targetNotifsKey, JSON.stringify([notif, ...existingTargetNotifs]));

    // If we invited ourselves (testing), add to our own list
    if (selectedOpponent.id === userId) {
      setNotifications(prev => [notif, ...prev]);
    }

    alert(`Match finished! Waiting for ${selectedOpponent.name} to confirm the score.`);
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
      // Finally update stats now that it is confirmed
      const isWin = matchData.winnerId === userId;
      updateStats(isWin);
    }

    localStorage.setItem(matchStoreKey, JSON.stringify(matchData));
    setNotifications(prev => prev.filter(n => n.matchId !== matchId));
    setActiveView(AppView.DASHBOARD);
  };

  const updateStats = (isWin: boolean, pointsEarned: number = 25) => {
    setUserStats(prev => ({
      matches: prev.matches + 1,
      wins: isWin ? prev.wins + 1 : prev.wins,
      losses: isWin ? prev.losses : prev.losses + 1,
      points: prev.points + pointsEarned
    }));
  };

  const renderView = () => {
    if (activeView === AppView.ONBOARDING) {
      return <OnboardingView onComplete={handleCompleteOnboarding} />;
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
                // Handle league acceptance logic
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
            onSendInvite={(targetId) => {
              const league = leagues.find(l => l.id === activeLeagueId);
              if (!league) return;
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
              alert(`Invite sent!`);
            }}
            onUpdateLeague={(updated) => setLeagues(leagues.map(l => l.id === updated.id ? updated : l))}
            onBack={() => setActiveView(AppView.DASHBOARD)}
          />
        ) : null;
      case AppView.CREATE_LEAGUE:
        return <CreateLeagueView onSubmit={(name) => {
          const newLeague: League = {
            id: Math.random().toString(36).substr(2, 9),
            name,
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
          />
        );
      case AppView.DISCOVERY: return <DiscoveryView />;
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
    <Layout activeView={activeView} setView={setActiveView} hasNotifications={notifications.length > 0} onLogout={handleLogout}>
      {renderView()}
    </Layout>
  );
};

export default App;
