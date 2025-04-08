"use client";

import { Match } from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export async function resetMatchesDatabase(): Promise<boolean> {
  try {
    // Step 1: Delete all existing matches
    const matchesRef = collection(db, "matches");
    const snapshot = await getDocs(matchesRef);

    console.log(`Deleting ${snapshot.docs.length} existing matches...`);

    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log("All existing matches deleted successfully");

    // Step 2: Reset team statistics
    console.log("Resetting team statistics...");
    const teamsRef = collection(db, "teams");
    const teamsSnapshot = await getDocs(teamsRef);

    const resetTeamStats = teamsSnapshot.docs.map((doc) => {
      return updateDoc(doc.ref, {
        wins: 0,
        losses: 0,
        points: 0,
        goalsScored: 0,
        goalsConceded: 0,
      });
    });

    await Promise.all(resetTeamStats);
    console.log(`Reset statistics for ${teamsSnapshot.docs.length} teams`);

    // Step 3: Add all matches from the schedule
    const today = "2025-04-13"; // Use April 13, 2024 for all matches

    const matchesData: Omit<Match, "id">[] = [
      // 1코트 Matches
      // 9:00-9:40
      {
        court: "1코트",
        homeTeam: "A1",
        awayTeam: "A2",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T09:00`,
        endTime: `${today}T09:40`,
        league: "menA",
        date: today,
      },
      // 9:40-10:20
      {
        court: "1코트",
        homeTeam: "A1",
        awayTeam: "A3",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T09:40`,
        endTime: `${today}T10:20`,
        league: "menA",
        date: today,
      },
      // 10:20-11:00
      {
        court: "1코트",
        homeTeam: "A2",
        awayTeam: "A5",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T10:20`,
        endTime: `${today}T11:00`,
        league: "menA",
        date: today,
      },
      // 11:00-11:40
      {
        court: "1코트",
        homeTeam: "A1",
        awayTeam: "A4",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T11:00`,
        endTime: `${today}T11:40`,
        league: "menA",
        date: today,
      },
      // 12:20-13:00
      {
        court: "1코트",
        homeTeam: "A1",
        awayTeam: "A5",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T12:20`,
        endTime: `${today}T13:00`,
        league: "menA",
        date: today,
      },
      // 13:00-13:40
      {
        court: "1코트",
        homeTeam: "A1",
        awayTeam: "A6",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T13:00`,
        endTime: `${today}T13:40`,
        league: "menA",
        date: today,
      },
      // 13:40-14:20
      {
        court: "1코트",
        homeTeam: "A3",
        awayTeam: "A6",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T13:40`,
        endTime: `${today}T14:20`,
        league: "menA",
        date: today,
      },
      // 15:00-15:40
      {
        court: "1코트",
        homeTeam: "AW1",
        awayTeam: "AW2",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T15:00`,
        endTime: `${today}T15:40`,
        league: "menA",
        date: today,
      },
      // 15:40-16:20
      {
        court: "1코트",
        homeTeam: "AW1",
        awayTeam: "AW2",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T15:40`,
        endTime: `${today}T16:20`,
        league: "menA",
        date: today,
      },
      // 16:20-17:00
      {
        court: "1코트",
        homeTeam: "AW1",
        awayTeam: "AW2",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T16:20`,
        endTime: `${today}T17:00`,
        league: "menA",
        date: today,
      },

      // 2코트 Matches
      // 9:00-9:40
      {
        court: "2코트",
        homeTeam: "A3",
        awayTeam: "A4",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T09:00`,
        endTime: `${today}T09:40`,
        league: "menA",
        date: today,
      },
      // 9:40-10:20
      {
        court: "2코트",
        homeTeam: "B1",
        awayTeam: "B3",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T09:40`,
        endTime: `${today}T10:20`,
        league: "menB",
        date: today,
      },
      // 10:20-11:00
      {
        court: "2코트",
        homeTeam: "A4",
        awayTeam: "A6",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T10:20`,
        endTime: `${today}T11:00`,
        league: "menA",
        date: today,
      },
      // 11:00-11:40
      {
        court: "2코트",
        homeTeam: "A2",
        awayTeam: "A6",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T11:00`,
        endTime: `${today}T11:40`,
        league: "menA",
        date: today,
      },
      // 12:20-13:00
      {
        court: "2코트",
        homeTeam: "A3",
        awayTeam: "A2",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T12:20`,
        endTime: `${today}T13:00`,
        league: "menA",
        date: today,
      },
      // 13:00-13:40
      {
        court: "2코트",
        homeTeam: "A2",
        awayTeam: "A4",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T13:00`,
        endTime: `${today}T13:40`,
        league: "menA",
        date: today,
      },
      // 13:40-14:20
      {
        court: "2코트",
        homeTeam: "A4",
        awayTeam: "A5",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T13:40`,
        endTime: `${today}T14:20`,
        league: "menA",
        date: today,
      },
      // 15:00-15:40
      {
        court: "2코트",
        homeTeam: "BW1",
        awayTeam: "BW2",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T15:00`,
        endTime: `${today}T15:40`,
        league: "menB",
        date: today,
      },
      // 15:40-16:20
      {
        court: "2코트",
        homeTeam: "BW1",
        awayTeam: "BW2",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T15:40`,
        endTime: `${today}T16:20`,
        league: "menB",
        date: today,
      },
      // 16:20-17:00
      {
        court: "2코트",
        homeTeam: "BW1",
        awayTeam: "BW2",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T16:20`,
        endTime: `${today}T17:00`,
        league: "menB",
        date: today,
      },

      // 3코트 Matches
      // 9:00-9:40
      {
        court: "3코트",
        homeTeam: "A5",
        awayTeam: "A6",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T09:00`,
        endTime: `${today}T09:40`,
        league: "menA",
        date: today,
      },
      // 9:40-10:20
      {
        court: "3코트",
        homeTeam: "B5",
        awayTeam: "B6",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T09:40`,
        endTime: `${today}T10:20`,
        league: "menB",
        date: today,
      },
      // 10:20-11:00
      {
        court: "3코트",
        homeTeam: "B3",
        awayTeam: "B5",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T10:20`,
        endTime: `${today}T11:00`,
        league: "menB",
        date: today,
      },
      // 11:00-11:40
      {
        court: "3코트",
        homeTeam: "A3",
        awayTeam: "A5",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T11:00`,
        endTime: `${today}T11:40`,
        league: "menA",
        date: today,
      },
      // 12:20-13:00
      {
        court: "3코트",
        homeTeam: "B6",
        awayTeam: "B3",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T12:20`,
        endTime: `${today}T13:00`,
        league: "menB",
        date: today,
      },
      // 13:00-13:40
      {
        court: "3코트",
        homeTeam: "B2",
        awayTeam: "B3",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T13:00`,
        endTime: `${today}T13:40`,
        league: "menB",
        date: today,
      },
      // 13:40-14:20
      {
        court: "3코트",
        homeTeam: "B1",
        awayTeam: "B6",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T13:40`,
        endTime: `${today}T14:20`,
        league: "menB",
        date: today,
      },

      // 4코트 Matches
      // 9:00-9:40
      {
        court: "4코트",
        homeTeam: "B1",
        awayTeam: "B2",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T09:00`,
        endTime: `${today}T09:40`,
        league: "menB",
        date: today,
      },
      // 9:40-10:20
      {
        court: "4코트",
        homeTeam: "B2",
        awayTeam: "B4",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T09:40`,
        endTime: `${today}T10:20`,
        league: "menB",
        date: today,
      },
      // 10:20-11:00
      {
        court: "4코트",
        homeTeam: "B4",
        awayTeam: "B6",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T10:20`,
        endTime: `${today}T11:00`,
        league: "menB",
        date: today,
      },
      // 11:00-11:40
      {
        court: "4코트",
        homeTeam: "B1",
        awayTeam: "B5",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T11:00`,
        endTime: `${today}T11:40`,
        league: "menB",
        date: today,
      },
      // 12:20-13:00
      {
        court: "4코트",
        homeTeam: "B1",
        awayTeam: "B4",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T12:20`,
        endTime: `${today}T13:00`,
        league: "menB",
        date: today,
      },
      // 13:00-13:40
      {
        court: "4코트",
        homeTeam: "B4",
        awayTeam: "B5",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T13:00`,
        endTime: `${today}T13:40`,
        league: "menB",
        date: today,
      },
      // 13:40-14:20
      {
        court: "4코트",
        homeTeam: "B2",
        awayTeam: "B5",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T13:40`,
        endTime: `${today}T14:20`,
        league: "menB",
        date: today,
      },
      // 14:20-15:00
      {
        court: "6코트",
        homeTeam: "NL1",
        awayTeam: "NL2",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T14:20`,
        endTime: `${today}T15:00`,
        league: "beginners",
        date: today,
      },

      // 5코트 Matches
      // 9:00-9:40
      {
        court: "5코트",
        homeTeam: "B3",
        awayTeam: "B4",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T09:00`,
        endTime: `${today}T09:40`,
        league: "menB",
        date: today,
      },
      // 9:40-10:20
      {
        court: "5코트",
        homeTeam: "N1",
        awayTeam: "N3",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T09:40`,
        endTime: `${today}T10:20`,
        league: "beginners",
        date: today,
      },
      // 10:20-11:00
      {
        court: "5코트",
        homeTeam: "N2",
        awayTeam: "N4",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T10:20`,
        endTime: `${today}T11:00`,
        league: "beginners",
        date: today,
      },
      // 11:00-11:40
      {
        court: "5코트",
        homeTeam: "B2",
        awayTeam: "B6",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T11:00`,
        endTime: `${today}T11:40`,
        league: "menB",
        date: today,
      },
      // 12:20-13:00
      {
        court: "5코트",
        homeTeam: "N1",
        awayTeam: "N5",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T12:20`,
        endTime: `${today}T13:00`,
        league: "beginners",
        date: today,
      },
      // 13:00-13:40
      {
        court: "5코트",
        homeTeam: "N2",
        awayTeam: "N5",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T13:00`,
        endTime: `${today}T13:40`,
        league: "beginners",
        date: today,
      },
      // 13:40-14:20
      {
        court: "5코트",
        homeTeam: "NW1",
        awayTeam: "NW2",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T13:40`,
        endTime: `${today}T14:20`,
        league: "beginners",
        date: today,
      },
      // 14:20-15:00
      {
        court: "5코트",
        homeTeam: "NW1",
        awayTeam: "NW3",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T14:20`,
        endTime: `${today}T15:00`,
        league: "beginners",
        date: today,
      },
      // 15:00-15:40
      {
        court: "5코트",
        homeTeam: "NW2",
        awayTeam: "NW3",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T15:00`,
        endTime: `${today}T15:40`,
        league: "beginners",
        date: today,
      },
      // 16:20-17:00
      {
        court: "5코트",
        homeTeam: "NWW1",
        awayTeam: "NWW2",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T16:20`,
        endTime: `${today}T17:00`,
        league: "beginners",
        date: today,
      },

      // 6코트 Matches
      // 9:00-9:40
      {
        court: "6코트",
        homeTeam: "N1",
        awayTeam: "N2",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T09:00`,
        endTime: `${today}T09:40`,
        league: "beginners",
        date: today,
      },
      // 9:40-10:20
      {
        court: "6코트",
        homeTeam: "N4",
        awayTeam: "N5",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T09:40`,
        endTime: `${today}T10:20`,
        league: "beginners",
        date: today,
      },
      // 10:20-11:00
      {
        court: "6코트",
        homeTeam: "N3",
        awayTeam: "N5",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T10:20`,
        endTime: `${today}T11:00`,
        league: "beginners",
        date: today,
      },
      // 11:00-11:40
      {
        court: "6코트",
        homeTeam: "N1",
        awayTeam: "N4",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T11:00`,
        endTime: `${today}T11:40`,
        league: "beginners",
        date: today,
      },
      // 12:20-13:00
      {
        court: "6코트",
        homeTeam: "N2",
        awayTeam: "N3",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T12:20`,
        endTime: `${today}T13:00`,
        league: "beginners",
        date: today,
      },
      // 13:00-13:40
      {
        court: "6코트",
        homeTeam: "N3",
        awayTeam: "N4",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        startTime: `${today}T13:00`,
        endTime: `${today}T13:40`,
        league: "beginners",
        date: today,
      },
    ];

    console.log(`Adding ${matchesData.length} matches to database...`);

    // Add all matches
    for (const match of matchesData) {
      await addDoc(collection(db, "matches"), match);
    }

    console.log(`Successfully added ${matchesData.length} matches!`);
    return true;
  } catch (error) {
    console.error("Error resetting matches database:", error);
    return false;
  }
}
