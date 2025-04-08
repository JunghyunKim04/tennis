import { League, Match, Team } from '@/types';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './firebase';

// Match operations
export const fetchMatches = async (): Promise<Match[]> => {
  const matchesRef = collection(db, 'matches');
  const snapshot = await getDocs(matchesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
};

export const fetchOngoingMatches = async (): Promise<Match[]> => {
  const matchesRef = collection(db, 'matches');
  const q = query(matchesRef, where('status', '==', 'ongoing'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
};

export const fetchUpcomingMatches = async (): Promise<Match[]> => {
  const matchesRef = collection(db, 'matches');
  const q = query(matchesRef, where('status', '==', 'upcoming'), orderBy('startTime'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
};

export const fetchCompletedMatches = async (): Promise<Match[]> => {
  const matchesRef = collection(db, 'matches');
  const q = query(matchesRef, where('status', '==', 'completed'), orderBy('endTime', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
};

export const fetchMatchById = async (id: string): Promise<Match | null> => {
  const matchRef = doc(db, 'matches', id);
  const matchDoc = await getDoc(matchRef);
  
  if (!matchDoc.exists()) {
    return null;
  }
  
  return { id: matchDoc.id, ...matchDoc.data() } as Match;
};

export const updateMatch = async (id: string, data: Partial<Match>): Promise<void> => {
  const matchRef = doc(db, 'matches', id);
  
  // Get the current match data for comparison
  const matchDoc = await getDoc(matchRef);
  const currentMatch = matchDoc.exists() ? { id: matchDoc.id, ...matchDoc.data() } as Match : null;
  
  // Update the match in the database
  await updateDoc(matchRef, data);
  
  // If match status is being set to completed, update team stats
  if (data.status === 'completed' && (currentMatch?.status !== 'completed')) {
    const updatedMatch = { 
      ...currentMatch, 
      ...data 
    } as Match;
    
    await updateTeamStatsAfterMatch(updatedMatch);
  }
  // If the match is already completed and score is being updated, recalculate team stats
  else if (currentMatch?.status === 'completed' && 
          (data.homeScore !== undefined || data.awayScore !== undefined)) {
    
    // First, revert the previous score's impact on team stats
    if (currentMatch) {
      await revertTeamStatsForMatch(currentMatch);
    }
    
    // Then apply the new score
    const updatedMatch = { 
      ...currentMatch, 
      ...data 
    } as Match;
    
    await updateTeamStatsAfterMatch(updatedMatch);
  }
};

export const addMatch = async (match: Omit<Match, 'id'>): Promise<string> => {
  const matchesRef = collection(db, 'matches');
  const docRef = await addDoc(matchesRef, match);
  return docRef.id;
};

export const deleteMatch = async (id: string): Promise<void> => {
  const matchRef = doc(db, 'matches', id);
  await deleteDoc(matchRef);
};

// Team operations
export const fetchTeams = async (): Promise<Team[]> => {
  const teamsRef = collection(db, 'teams');
  const snapshot = await getDocs(teamsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
};

export const fetchTeamsByLeague = async (leagueId: string): Promise<Team[]> => {
  const teamsRef = collection(db, 'teams');
  const q = query(teamsRef, where('leagueId', '==', leagueId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
};

export const fetchTeamById = async (id: string): Promise<Team | null> => {
  const teamRef = doc(db, 'teams', id);
  const teamDoc = await getDoc(teamRef);
  
  if (!teamDoc.exists()) {
    return null;
  }
  
  return { id: teamDoc.id, ...teamDoc.data() } as Team;
};

export const updateTeam = async (id: string, data: Partial<Team>): Promise<void> => {
  const teamRef = doc(db, 'teams', id);
  await updateDoc(teamRef, data);
};

export const addTeam = async (team: Omit<Team, 'id'>): Promise<string> => {
  const teamsRef = collection(db, 'teams');
  const docRef = await addDoc(teamsRef, team);
  return docRef.id;
};

export const deleteTeam = async (id: string): Promise<void> => {
  const teamRef = doc(db, 'teams', id);
  await deleteDoc(teamRef);
};

// League operations
export const fetchLeagues = async (): Promise<League[]> => {
  const leaguesRef = collection(db, 'leagues');
  const snapshot = await getDocs(leaguesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as League));
};

export const fetchLeagueById = async (id: string): Promise<League | null> => {
  const leagueRef = doc(db, 'leagues', id);
  const leagueDoc = await getDoc(leagueRef);
  
  if (!leagueDoc.exists()) {
    return null;
  }
  
  return { id: leagueDoc.id, ...leagueDoc.data() } as League;
};

export const updateLeague = async (id: string, data: Partial<League>): Promise<void> => {
  const leagueRef = doc(db, 'leagues', id);
  await updateDoc(leagueRef, data);
};

export const addLeague = async (league: Omit<League, 'id'>): Promise<string> => {
  const leaguesRef = collection(db, 'leagues');
  const docRef = await addDoc(leaguesRef, league);
  return docRef.id;
};

export const deleteLeague = async (id: string): Promise<void> => {
  const leagueRef = doc(db, 'leagues', id);
  await deleteDoc(leagueRef);
};

// Realtime updates
export const subscribeToMatches = (callback: (matches: Match[]) => void) => {
  const matchesRef = collection(db, 'matches');
  return onSnapshot(matchesRef, (snapshot) => {
    const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
    callback(matches);
  });
};

export const subscribeToOngoingMatches = (callback: (matches: Match[]) => void) => {
  const matchesRef = collection(db, 'matches');
  const q = query(matchesRef, where('status', '==', 'ongoing'));
  return onSnapshot(q, (snapshot) => {
    const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
    callback(matches);
  });
};

// Real-time team updates listener
export const subscribeToTeamsUpdates = (callback: (teams: Team[]) => void) => {
  const teamsRef = collection(db, 'teams');
  const unsubscribe = onSnapshot(teamsRef, (snapshot) => {
    const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
    callback(teams);
  });
  
  return unsubscribe;
};

// Helper function to update team stats when match is completed
export const updateTeamStatsAfterMatch = async (match: Match): Promise<void> => {
  if (match.status !== 'completed') return;
  
  // Get team names from the match
  const homeTeamName = match.homeTeam;
  const awayTeamName = match.awayTeam;
  
  // Find teams in database by name
  const teamsRef = collection(db, 'teams');
  
  // Query for the home team
  const homeTeamQuery = query(teamsRef, where('name', '==', homeTeamName));
  const homeTeamSnapshot = await getDocs(homeTeamQuery);
  
  // Query for the away team
  const awayTeamQuery = query(teamsRef, where('name', '==', awayTeamName));
  const awayTeamSnapshot = await getDocs(awayTeamQuery);
  
  // Check if teams were found
  if (homeTeamSnapshot.empty || awayTeamSnapshot.empty) {
    console.error(`Team not found: ${homeTeamSnapshot.empty ? homeTeamName : ''} ${awayTeamSnapshot.empty ? awayTeamName : ''}`);
    return;
  }
  
  const homeTeamDoc = homeTeamSnapshot.docs[0];
  const awayTeamDoc = awayTeamSnapshot.docs[0];
  
  const homeTeam = { id: homeTeamDoc.id, ...homeTeamDoc.data() } as Team;
  const awayTeam = { id: awayTeamDoc.id, ...awayTeamDoc.data() } as Team;
  
  // Update goals scored and conceded for both teams
  await updateTeam(homeTeam.id, {
    goalsScored: (homeTeam.goalsScored || 0) + match.homeScore,
    goalsConceded: (homeTeam.goalsConceded || 0) + match.awayScore
  });
  
  await updateTeam(awayTeam.id, {
    goalsScored: (awayTeam.goalsScored || 0) + match.awayScore,
    goalsConceded: (awayTeam.goalsConceded || 0) + match.homeScore
  });
  
  // Determine the winner and update stats
  if (match.homeScore > match.awayScore) {
    // Home team wins
    await updateTeam(homeTeam.id, {
      wins: homeTeam.wins + 1,
      points: homeTeam.points + 3 // 3 points for a win
    });
    
    await updateTeam(awayTeam.id, {
      losses: awayTeam.losses + 1
    });
  } else if (match.awayScore > match.homeScore) {
    // Away team wins
    await updateTeam(awayTeam.id, {
      wins: awayTeam.wins + 1,
      points: awayTeam.points + 3 // 3 points for a win
    });
    
    await updateTeam(homeTeam.id, {
      losses: homeTeam.losses + 1
    });
  } else {
    // It's a tie (though uncommon in tennis)
    await updateTeam(homeTeam.id, {
      points: homeTeam.points + 1 // 1 point for a tie
    });
    
    await updateTeam(awayTeam.id, {
      points: awayTeam.points + 1 // 1 point for a tie
    });
  }
};

// Helper function to revert team stats for a completed match before updating with new scores
export const revertTeamStatsForMatch = async (match: Match): Promise<void> => {
  if (match.status !== 'completed') return;
  
  // Get team names from the match
  const homeTeamName = match.homeTeam;
  const awayTeamName = match.awayTeam;
  
  // Find teams in database by name
  const teamsRef = collection(db, 'teams');
  
  // Query for the home team
  const homeTeamQuery = query(teamsRef, where('name', '==', homeTeamName));
  const homeTeamSnapshot = await getDocs(homeTeamQuery);
  
  // Query for the away team
  const awayTeamQuery = query(teamsRef, where('name', '==', awayTeamName));
  const awayTeamSnapshot = await getDocs(awayTeamQuery);
  
  // Check if teams were found
  if (homeTeamSnapshot.empty || awayTeamSnapshot.empty) {
    console.error(`Team not found: ${homeTeamSnapshot.empty ? homeTeamName : ''} ${awayTeamSnapshot.empty ? awayTeamName : ''}`);
    return;
  }
  
  const homeTeamDoc = homeTeamSnapshot.docs[0];
  const awayTeamDoc = awayTeamSnapshot.docs[0];
  
  const homeTeam = { id: homeTeamDoc.id, ...homeTeamDoc.data() } as Team;
  const awayTeam = { id: awayTeamDoc.id, ...awayTeamDoc.data() } as Team;
  
  // Revert goals scored and conceded for both teams
  await updateTeam(homeTeam.id, {
    goalsScored: Math.max(0, (homeTeam.goalsScored || 0) - match.homeScore),
    goalsConceded: Math.max(0, (homeTeam.goalsConceded || 0) - match.awayScore)
  });
  
  await updateTeam(awayTeam.id, {
    goalsScored: Math.max(0, (awayTeam.goalsScored || 0) - match.awayScore),
    goalsConceded: Math.max(0, (awayTeam.goalsConceded || 0) - match.homeScore)
  });
  
  // Revert wins, losses, and points
  if (match.homeScore > match.awayScore) {
    // Home team won, revert stats
    await updateTeam(homeTeam.id, {
      wins: Math.max(0, homeTeam.wins - 1),
      points: Math.max(0, homeTeam.points - 3)
    });
    
    await updateTeam(awayTeam.id, {
      losses: Math.max(0, awayTeam.losses - 1)
    });
  } else if (match.awayScore > match.homeScore) {
    // Away team won, revert stats
    await updateTeam(awayTeam.id, {
      wins: Math.max(0, awayTeam.wins - 1),
      points: Math.max(0, awayTeam.points - 3)
    });
    
    await updateTeam(homeTeam.id, {
      losses: Math.max(0, homeTeam.losses - 1)
    });
  } else {
    // It was a tie, revert points
    await updateTeam(homeTeam.id, {
      points: Math.max(0, homeTeam.points - 1)
    });
    
    await updateTeam(awayTeam.id, {
      points: Math.max(0, awayTeam.points - 1)
    });
  }
};

// Utility function to recalculate all team stats from completed matches
export const recalculateAllTeamStats = async (): Promise<void> => {
  try {
    console.log('Starting team stats recalculation...');
    
    try {
      // Reset all team stats first
      const teamsRef = collection(db, 'teams');
      const teamsSnapshot = await getDocs(teamsRef);
      const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      
      console.log(`Found ${teams.length} teams to reset stats for...`);
      
      // Reset all team stats
      for (const team of teams) {
        try {
          await updateTeam(team.id, {
            wins: 0,
            losses: 0,
            points: 0,
            goalsScored: 0,
            goalsConceded: 0
          });
        } catch (error) {
          console.error(`Error resetting stats for team ${team.name}:`, error);
          // If this is a permission error, throw to stop the process
          if (error instanceof Error && error.message.includes('permission')) {
            throw new Error(`Permission denied when updating team ${team.name}. Check Firestore rules.`);
          }
          // Otherwise continue with other teams despite this error
        }
      }
      
      // Get all completed matches
      const matchesRef = collection(db, 'matches');
      const q = query(matchesRef, where('status', '==', 'completed'));
      const matchesSnapshot = await getDocs(q);
      const completedMatches = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
      
      console.log(`Found ${completedMatches.length} completed matches to process...`);
      
      // Process each completed match to update team stats
      for (const match of completedMatches) {
        try {
          await updateTeamStatsAfterMatch(match);
        } catch (error) {
          console.error(`Error processing match ${match.id} (${match.homeTeam} vs ${match.awayTeam}):`, error);
          // If this is a permission error, throw to stop the process
          if (error instanceof Error && error.message.includes('permission')) {
            throw new Error(`Permission denied when updating stats for match ${match.id}. Check Firestore rules.`);
          }
          // Otherwise continue with other matches despite this error
        }
      }
      
      console.log(`Recalculated stats for ${teams.length} teams based on ${completedMatches.length} completed matches.`);
    } catch (error) {
      // Check if this is a Firebase permission error
      if (error instanceof Error && 
         (error.message.includes('Missing or insufficient permissions') || 
          error.message.includes('permission'))) {
        console.error('Firebase permission error:', error);
        throw new Error('Permission denied. You do not have sufficient permissions to recalculate team stats. Please contact the administrator.');
      } else {
        throw error; // Re-throw other errors
      }
    }
  } catch (error) {
    console.error('Error recalculating team stats:', error);
    throw error;
  }
}; 