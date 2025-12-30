
export interface MatchPoint {
  timestamp: number;
  score: string;
  description: string;
  isHighlight: boolean;
  frame?: string;
}

export interface UserStats {
  wins: number;
  losses: number;
  matches: number;
  points: number;
  smashWinRate: number; // Padel Specific
  netPointsWon: number; // Padel Specific
}

export type CourtEnd = 'Side A' | 'Side B';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: string;
  verified: boolean;
  preferredPala?: string;
  playingSide?: 'Left' | 'Right' | 'Both';
}

export type MatchStatus = 'pending' | 'confirmed' | 'disputed';

export interface AppNotification {
  id: string;
  type: 'league_invite' | 'match_confirmation' | 'challenge' | 'system';
  fromName: string;
  message?: string;
  leagueId?: string;
  leagueName?: string;
  matchId?: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'declined' | 'read';
}

export interface LeagueMember {
  id: string;
  name: string;
  role: 'admin' | 'member';
  wins: number;
  matches: number;
  avatar?: string;
  email?: string;
}

export interface LeagueMatch {
  id: string;
  date: string;
  playerA: string;
  playerB: string;
  playerAName: string;
  playerBName: string;
  score: string;
  winnerId: string;
  status: MatchStatus;
  confirmedBy: string[];
}

export interface League {
  id: string;
  name: string;
  type: 'league' | 'tournament';
  adminId: string;
  members: LeagueMember[];
  matches: LeagueMatch[];
}

export enum AppView {
  DASHBOARD = 'dashboard',
  RECORD = 'record',
  DISCOVERY = 'discovery',
  HIGHLIGHTS = 'highlights',
  CREATE_TOURNAMENT = 'create_tournament',
  MATCH_MODE_SELECT = 'match_mode_select',
  MANUAL_SCORE = 'manual_score',
  ONBOARDING = 'onboarding',
  VERIFICATION = 'verification',
  PROFILE = 'profile',
  LEAGUE_DASHBOARD = 'league_dashboard',
  CREATE_LEAGUE = 'create_league',
  NOTIFICATIONS = 'notifications',
  SELECT_OPPONENT = 'select_opponent'
}

export type TournamentType = 'Singles' | 'Doubles';

export interface TournamentMatch {
  id: string;
  sideA: string[];
  sideB: string[];
  score: string;
  completed: boolean;
}

export interface Player {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  distance: string;
  avatar: string;
  bio?: string;
  preferredSide?: 'Left' | 'Right' | 'Both';
  matchesPlayed?: number;
  winRate?: string;
}

export interface PadelLocation {
  name: string;
  address: string;
  uri: string;
  rating?: string;
}

export interface Tournament {
  title: string;
  date: string;
  location: string;
  link: string;
}
