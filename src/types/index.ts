export interface Match {
  id: string;
  court: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  startTime: string;
  endTime: string;
  league: 'menA' | 'menB' | 'beginners';
  date: string;
}

export interface League {
  id: string;
  name: string;
  color: string;
  teams: string[];
  description?: string;
}

export interface Team {
  id: string;
  name: string;
  players: string[];
  leagueId: string;
  wins: number;
  losses: number;
  points: number;
  goalsScored: number;
  goalsConceded: number;
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
} 