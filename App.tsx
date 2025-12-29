
import React, { useState, useEffect } from 'react';
import { AppView, TournamentMatch, UserStats } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RecordingView from './components/RecordingView';
import DiscoveryView from './components/DiscoveryView';
import HighlightsGallery from './components/HighlightsGallery';
import CreateTournamentView from './components/CreateTournamentView';
import MatchModeSelect from './components/MatchModeSelect';
import ManualScoreView from './components/ManualScoreView';
import OnboardingView from './components/OnboardingView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('padel_user_name'));
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('padel_user_stats');
    return saved ? JSON.parse(saved) : { wins: 0, losses: 0, matches: 0, points: 0 };
  });
  
  const [activeTournamentMatch, setActiveTournamentMatch] = useState<TournamentMatch | null>(null);
  const [tournamentMatches, setTournamentMatches] = useState<TournamentMatch[]>([]);

  useEffect(() => {
    if (!userName) {
      setActiveView(AppView.ONBOARDING);
    }
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('padel_user_stats', JSON.stringify(userStats));
  }, [userStats]);

  const handleCompleteOnboarding = (name: string) => {
    localStorage.setItem('padel_user_name', name);
    setUserName(name);
    setActiveView(AppView.DASHBOARD);
  };

  const handleStartTournamentMatchRecording = (match: TournamentMatch) => {
    setActiveTournamentMatch(match);
    setActiveView(AppView.RECORD);
  };

  const updateStats = (isWin: boolean, pointsEarned: number = 25) => {
    setUserStats(prev => ({
      matches: prev.matches + 1,
      wins: isWin ? prev.wins + 1 : prev.wins,
      losses: isWin ? prev.losses : prev.losses + 1,
      points: prev.points + pointsEarned
    }));
  };

  const handleFinishMatch = (id: string, score: string, teamAWon: boolean) => {
    setTournamentMatches(prev => prev.map(m => 
      m.id === id ? { ...m, score, completed: true } : m
    ));
    
    // If user was on team A in tournament, update their personal stats
    // For simplicity, we assume if they started a tournament match they were part of it
    updateStats(teamAWon);

    setActiveTournamentMatch(null);
    setActiveView(AppView.CREATE_TOURNAMENT);
  };

  const handleSaveManualScore = (score: string, teamAWon: boolean) => {
    updateStats(teamAWon);
    setActiveView(AppView.DASHBOARD);
  };

  const renderView = () => {
    if (activeView === AppView.ONBOARDING) {
      return <OnboardingView onComplete={handleCompleteOnboarding} />;
    }

    switch (activeView) {
      case AppView.DASHBOARD:
        return <Dashboard onAction={setActiveView} userStats={userStats} userName={userName || 'Player'} />;
      case AppView.RECORD:
        return (
          <RecordingView 
            tournamentMatch={activeTournamentMatch} 
            homeName={userName || 'Home Team'}
            onFinish={(score, teamAWon) => {
              if (activeTournamentMatch) {
                handleFinishMatch(activeTournamentMatch.id, score, teamAWon);
              } else {
                updateStats(teamAWon);
                setActiveView(AppView.DASHBOARD);
              }
            }}
          />
        );
      case AppView.DISCOVERY:
        return <DiscoveryView />;
      case AppView.HIGHLIGHTS:
        return <HighlightsGallery />;
      case AppView.CREATE_TOURNAMENT:
        return (
          <CreateTournamentView 
            matches={tournamentMatches}
            setMatches={setTournamentMatches}
            onStartRecording={handleStartTournamentMatchRecording} 
          />
        );
      case AppView.MATCH_MODE_SELECT:
        return (
          <MatchModeSelect 
            onSelect={setActiveView} 
            onBack={() => setActiveView(AppView.DASHBOARD)} 
          />
        );
      case AppView.MANUAL_SCORE:
        return (
          <ManualScoreView 
            homeName={userName || 'Home Team'}
            onBack={() => setActiveView(AppView.MATCH_MODE_SELECT)} 
            onSave={handleSaveManualScore} 
          />
        );
      default:
        return <Dashboard onAction={setActiveView} userStats={userStats} userName={userName || 'Player'} />;
    }
  };

  return (
    <Layout activeView={activeView} setView={setActiveView}>
      {renderView()}
    </Layout>
  );
};

export default App;
