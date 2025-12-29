
export interface MatchPoint {
  timestamp: number;
  score: string;
  description: string;
  isHighlight: boolean;
  frame?: string;
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

export interface UserStats {
  wins: number;
  losses: number;
  matches: number;
  points: number;
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
  PROFILE = 'profile'
}

export type TournamentType = 'Singles' | 'Doubles';

export interface TournamentMatch {
  id: string;
  sideA: string[];
  sideB: string[];
  score: string;
  completed: boolean;
}
