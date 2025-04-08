'use client';

import { League, Match, Team, User } from '@/types';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export async function initializeDatabase() {
  try {
    // Check if data already exists to prevent duplicate initialization
    const leaguesSnapshot = await getDocs(collection(db, 'leagues'));
    if (!leaguesSnapshot.empty) {
      console.log('Database already initialized. Skipping initialization.');
      return;
    }
    
    // Initialize leagues
    const leagues = await initializeLeagues();
    
    // Initialize teams
    await initializeTeams(leagues);
    
    // Initialize matches
    await initializeMatches();
    
    console.log('Database initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

async function initializeLeagues() {
  const leaguesData: Omit<League, 'id'>[] = [
    {
      name: 'Men A',
      color: 'men-a-bg',
      teams: [],
      description: 'Men A 리그 - 상급자 부문'
    },
    {
      name: 'Men B',
      color: 'men-b-bg',
      teams: [],
      description: 'Men B 리그 - 중급자 부문'
    },
    {
      name: 'Beginners',
      color: 'beginners-bg',
      teams: [],
      description: 'Beginners 리그 - 초급자 부문'
    }
  ];
  
  const leagueIds: {[key: string]: string} = {};
  
  for (const league of leaguesData) {
    const docRef = await addDoc(collection(db, 'leagues'), league);
    leagueIds[league.name] = docRef.id;
  }
  
  return leagueIds;
}

async function initializeTeams(leagueIds: {[key: string]: string}) {
  const teamsData: Omit<Team, 'id'>[] = [
    // Men A Teams (A1-A6)
    {
      name: 'A1',
      players: ['Player 1', 'Player 2'],
      leagueId: leagueIds['Men A'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'A2',
      players: ['Player 3', 'Player 4'],
      leagueId: leagueIds['Men A'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'A3',
      players: ['Player 5', 'Player 6'],
      leagueId: leagueIds['Men A'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'A4',
      players: ['Player 7', 'Player 8'],
      leagueId: leagueIds['Men A'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'A5',
      players: ['Player 9', 'Player 10'],
      leagueId: leagueIds['Men A'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'A6',
      players: ['Player 11', 'Player 12'],
      leagueId: leagueIds['Men A'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    
    // Men B Teams (B1-B6)
    {
      name: 'B1',
      players: ['Player 13', 'Player 14'],
      leagueId: leagueIds['Men B'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'B2',
      players: ['Player 15', 'Player 16'],
      leagueId: leagueIds['Men B'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'B3',
      players: ['Player 17', 'Player 18'],
      leagueId: leagueIds['Men B'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'B4',
      players: ['Player 19', 'Player 20'],
      leagueId: leagueIds['Men B'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'B5',
      players: ['Player 21', 'Player 22'],
      leagueId: leagueIds['Men B'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'B6',
      players: ['Player 23', 'Player 24'],
      leagueId: leagueIds['Men B'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    
    // Beginners Teams (N1-N5)
    {
      name: 'N1',
      players: ['Player 25', 'Player 26'],
      leagueId: leagueIds['Beginners'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'N2',
      players: ['Player 27', 'Player 28'],
      leagueId: leagueIds['Beginners'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'N3',
      players: ['Player 29', 'Player 30'],
      leagueId: leagueIds['Beginners'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'N4',
      players: ['Player 31', 'Player 32'],
      leagueId: leagueIds['Beginners'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    },
    {
      name: 'N5',
      players: ['Player 33', 'Player 34'],
      leagueId: leagueIds['Beginners'],
      wins: 0,
      losses: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    }
  ];
  
  for (const team of teamsData) {
    await addDoc(collection(db, 'teams'), team);
  }
}

async function initializeMatches() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  // Create matches based on the schedule in the image
  const matchesData: Omit<Match, 'id'>[] = [
    // First row of schedule (9:00-9:40)
    {
      court: '1',
      homeTeam: 'A1',
      awayTeam: 'A2',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${todayStr}T09:00`,
      endTime: `${todayStr}T09:40`,
      league: 'menA',
      date: todayStr
    },
    {
      court: '2',
      homeTeam: 'A3',
      awayTeam: 'A4',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${todayStr}T09:00`,
      endTime: `${todayStr}T09:40`,
      league: 'menA',
      date: todayStr
    },
    {
      court: '3',
      homeTeam: 'A5',
      awayTeam: 'A6',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${todayStr}T09:00`,
      endTime: `${todayStr}T09:40`,
      league: 'menA',
      date: todayStr
    },
    {
      court: '4',
      homeTeam: 'B1',
      awayTeam: 'B2',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${todayStr}T09:00`,
      endTime: `${todayStr}T09:40`,
      league: 'menB',
      date: todayStr
    },
    {
      court: '5',
      homeTeam: 'B3',
      awayTeam: 'B4',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${todayStr}T09:00`,
      endTime: `${todayStr}T09:40`,
      league: 'menB',
      date: todayStr
    },
    {
      court: '6',
      homeTeam: 'N1',
      awayTeam: 'N2',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${todayStr}T09:00`,
      endTime: `${todayStr}T09:40`,
      league: 'beginners',
      date: todayStr
    },
    
    // Second row of schedule (9:40-10:20)
    {
      court: '1',
      homeTeam: 'A1',
      awayTeam: 'A3',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${todayStr}T09:40`,
      endTime: `${todayStr}T10:20`,
      league: 'menA',
      date: todayStr
    },
    {
      court: '2',
      homeTeam: 'B1',
      awayTeam: 'B3',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${todayStr}T09:40`,
      endTime: `${todayStr}T10:20`,
      league: 'menB',
      date: todayStr
    },
    {
      court: '3',
      homeTeam: 'B5',
      awayTeam: 'B6',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${todayStr}T09:40`,
      endTime: `${todayStr}T10:20`,
      league: 'menB',
      date: todayStr
    },
    {
      court: '4',
      homeTeam: 'B2',
      awayTeam: 'B4',
      homeScore: 0,
      awayScore: 0,
      status: 'ongoing',
      startTime: `${todayStr}T09:40`,
      endTime: `${todayStr}T10:20`,
      league: 'menB',
      date: todayStr
    },
    {
      court: '5',
      homeTeam: 'N1',
      awayTeam: 'N3',
      homeScore: 3,
      awayScore: 2,
      status: 'completed',
      startTime: `${todayStr}T09:40`,
      endTime: `${todayStr}T10:20`,
      league: 'beginners',
      date: todayStr
    },
    {
      court: '6',
      homeTeam: 'N4',
      awayTeam: 'N5',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${todayStr}T09:40`,
      endTime: `${todayStr}T10:20`,
      league: 'beginners',
      date: todayStr
    },
    
    // Add a couple of tomorrow's matches
    {
      court: '1',
      homeTeam: 'A1',
      awayTeam: 'A6',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${tomorrowStr}T09:00`,
      endTime: `${tomorrowStr}T09:40`,
      league: 'menA',
      date: tomorrowStr
    },
    {
      court: '2',
      homeTeam: 'B5',
      awayTeam: 'B1',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${tomorrowStr}T09:00`,
      endTime: `${tomorrowStr}T09:40`,
      league: 'menB',
      date: tomorrowStr
    }
  ];
  
  for (const match of matchesData) {
    await addDoc(collection(db, 'matches'), match);
  }
}

// Initialize admin user
export async function initializeAdminUser(userId: string, email: string) {
  try {
    const userRef = collection(db, 'users');
    const q = query(userRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      const userData: User = {
        id: userId,
        email: email,
        isAdmin: true
      };
      
      await addDoc(collection(db, 'users'), userData);
      console.log('Admin user created successfully!');
      return true;
    } else {
      console.log('User already exists');
      return false;
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
} 