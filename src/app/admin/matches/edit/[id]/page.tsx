"use client";

import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { fetchMatchById, updateMatch, fetchTeams, updateTeam, fetchMatches } from "@/lib/firebaseUtils";
import { Match } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function EditMatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Form State ---
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [homeTeam, setHomeTeam] = useState<string>("");
  const [awayTeam, setAwayTeam] = useState<string>("");
  const [court, setCourt] = useState<string>("");
  const [status, setStatus] = useState<"upcoming" | "ongoing" | "completed">(
    "upcoming"
  );
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [league, setLeague] = useState<"menA" | "menB" | "beginners">("menA");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchMatch = async () => {
      setLoading(true);
      setError(null);
      try {
        const matchData = await fetchMatchById(id);
        if (matchData) {
          setMatch(matchData);
          // --- Initialize Form State ---
          setHomeScore(matchData.homeScore);
          setAwayScore(matchData.awayScore);
          setHomeTeam(matchData.homeTeam);
          setAwayTeam(matchData.awayTeam);
          setCourt(matchData.court);
          setStatus(matchData.status);
          setDate(matchData.date);
          setStartTime(matchData.startTime);
          setEndTime(matchData.endTime);
          setLeague(matchData.league);
        } else {
          setError("Match not found.");
        }
      } catch (err) {
        console.error("Error fetching match:", err);
        setError("Failed to load match data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id]);

  // Function to update all matches with a team name change
  const updateAllMatchesWithNewTeamName = async (oldTeamName: string, newTeamName: string) => {
    console.log(`Updating all matches with team name change: ${oldTeamName} -> ${newTeamName}`);
    
    try {
      // Track if we updated any teams
      let teamsUpdated = false;
      
      // PART 1: UPDATE ALL MATCHES
      const allMatches = await fetchMatches();
      
      // Find all matches that have the oldTeamName
      console.log(`Searching for matches with team: "${oldTeamName}"`);
      let matchesUpdated = 0;
      
      for (const matchToUpdate of allMatches) {
        const updateData: { homeTeam?: string; awayTeam?: string } = {};
        
        if (matchToUpdate.homeTeam === oldTeamName) {
          updateData.homeTeam = newTeamName;
        }
        
        if (matchToUpdate.awayTeam === oldTeamName) {
          updateData.awayTeam = newTeamName;
        }
        
        // Only update if we found changes and it's not the current match
        if (Object.keys(updateData).length > 0 && matchToUpdate.id !== id) {
          console.log(`Updating match ${matchToUpdate.id} with new team name`);
          await updateMatch(matchToUpdate.id, updateData);
          matchesUpdated++;
        }
      }
      
      console.log(`Updated ${matchesUpdated} matches with the new team name`);
      
      // PART 2: UPDATE TEAM ENTITY
      // Get all teams
      const teams = await fetchTeams();
      
      // Method 1: Direct exact match
      const exactMatchTeam = teams.find(team => team.name === oldTeamName);
      
      if (exactMatchTeam) {
        console.log(`Found exact match for team "${oldTeamName}" with ID: ${exactMatchTeam.id}`);
        await updateTeam(exactMatchTeam.id, { name: newTeamName });
        teamsUpdated = true;
        return true; // Successfully updated
      }
      
      // Method 2: Find teams by case-insensitive exact match
      const caseInsensitiveExactMatch = teams.find(
        team => team.name.toLowerCase() === oldTeamName.toLowerCase()
      );
      
      if (caseInsensitiveExactMatch) {
        console.log(`Found case-insensitive exact match: "${caseInsensitiveExactMatch.name}" -> "${newTeamName}"`);
        await updateTeam(caseInsensitiveExactMatch.id, { name: newTeamName });
        teamsUpdated = true;
        return true;
      }
      
      // Method 3: Try substring matching if we didn't find an exact match
      if (!teamsUpdated) {
        console.log(`Trying substring matching for "${oldTeamName}"...`);
        
        // Find teams with names that contain the oldTeamName or vice versa
        const substringMatches = teams.filter(team => 
          team.name.includes(oldTeamName) || 
          oldTeamName.includes(team.name));
        
        if (substringMatches.length > 0) {
          console.log(`Found ${substringMatches.length} team(s) with substring match`);
          
          for (const match of substringMatches) {
            console.log(`Updating team "${match.name}" to "${newTeamName}"`);
            await updateTeam(match.id, { name: newTeamName });
            teamsUpdated = true;
          }
          
          if (teamsUpdated) return true;
        }
      }
      
      // Method 4: Last resort - case insensitive substring matching
      if (!teamsUpdated) {
        console.log(`Trying case-insensitive substring match for "${oldTeamName}"...`);
        
        for (const team of teams) {
          // Check if either name includes the other, ignoring case
          if (team.name.toLowerCase().includes(oldTeamName.toLowerCase()) || 
              oldTeamName.toLowerCase().includes(team.name.toLowerCase())) {
            console.log(`Found case-insensitive substring match: "${team.name}" -> "${newTeamName}"`);
            await updateTeam(team.id, { name: newTeamName });
            teamsUpdated = true;
          }
        }
      }
      
      return teamsUpdated;
    } catch (err) {
      console.error("Error updating matches with new team name:", err);
      return false;
    }
  };
  
  // Store original team names to track changes between edits
  const [originalHomeTeam, setOriginalHomeTeam] = useState<string>("");
  const [originalAwayTeam, setOriginalAwayTeam] = useState<string>("");
  
  // Update the original team names whenever the match data loads
  useEffect(() => {
    if (match) {
      setOriginalHomeTeam(match.homeTeam);
      setOriginalAwayTeam(match.awayTeam);
    }
  }, [match]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;

    setError(null);
    setIsSubmitting(true);

    try {
      // Track if team names changed from their original values
      const homeTeamChanged = originalHomeTeam !== homeTeam;
      const awayTeamChanged = originalAwayTeam !== awayTeam;
      const teamsHaveChanged = homeTeamChanged || awayTeamChanged;
      
      console.log(`Team name changes: ${originalHomeTeam} -> ${homeTeam}, ${originalAwayTeam} -> ${awayTeam}`);
      
      // --- Prepare Update Data for non-team fields ---
      const matchUpdateData = {
        homeScore,
        awayScore,
        court,
        status,
        date,
        startTime,
        endTime,
        league,
      };

      // Process team name changes globally
      let homeTeamUpdateSuccess = !homeTeamChanged; // true if no change needed
      let awayTeamUpdateSuccess = !awayTeamChanged; // true if no change needed
      
      // Update home team name across all matches if changed
      if (homeTeamChanged) {
        homeTeamUpdateSuccess = await updateAllMatchesWithNewTeamName(originalHomeTeam, homeTeam);
      }
      
      // Update away team name across all matches if changed
      if (awayTeamChanged) {
        awayTeamUpdateSuccess = await updateAllMatchesWithNewTeamName(originalAwayTeam, awayTeam);
      }
      
      // After updating, store the new team names as the original ones for next edit
      setOriginalHomeTeam(homeTeam);
      setOriginalAwayTeam(awayTeam);
      
      // Update the current match with non-team fields
      await updateMatch(id, matchUpdateData);
      
      // Force update current match team names (regardless of global success)
      // This ensures the current match shows the correct team names even if global updates failed
      if (teamsHaveChanged) {
        await updateMatch(id, {
          homeTeam,
          awayTeam
        });
      }
      
      // Success message based on what happened
      if (teamsHaveChanged) {
        if (homeTeamUpdateSuccess && awayTeamUpdateSuccess) {
          toast.success("경기 정보와 팀 이름이 전체적으로 업데이트 되었습니다.");
        } else {
          toast.warning("경기 정보가 업데이트 되었지만, 일부 팀 이름은 전체적으로 업데이트되지 않았습니다.");
        }
      } else {
        toast.success("경기 정보가 성공적으로 업데이트 되었습니다. 점수 변경 사항은 모든 페이지에 반영됩니다.");
      }
    } catch (err) {
      console.error("Error updating match:", err);
      setError("Failed to update match.");
      toast.error("경기 정보 업데이트에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not authenticated
  if (typeof window !== "undefined" && !user) {
    router.push("/login");
    return null;
  }

  if (loading)
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          Loading match details...
        </div>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">Error: {error}</div>
      </Layout>
    );
  if (!match)
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">Match not found.</div>
      </Layout>
    ); // Should be caught by error state, but good practice

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-xl md:text-2xl font-bold mb-4">
          Edit Match: {match.homeTeam} vs {match.awayTeam}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Teams Section */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg md:text-xl font-semibold mb-3">Teams</h2>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="homeTeam"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Home Team
                </label>
                <input
                  type="text"
                  id="homeTeam"
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="awayTeam"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Away Team
                </label>
                <input
                  type="text"
                  id="awayTeam"
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Score Section */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg md:text-xl font-semibold mb-3">Score</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="homeScore"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Home Score
                </label>
                <input
                  type="number"
                  id="homeScore"
                  value={homeScore}
                  onChange={(e) => setHomeScore(parseInt(e.target.value))}
                  min={0}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="awayScore"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Away Score
                </label>
                <input
                  type="number"
                  id="awayScore"
                  value={awayScore}
                  onChange={(e) => setAwayScore(parseInt(e.target.value))}
                  min={0}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Match Details Section */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              Match Details
            </h2>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="court"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Court
                </label>
                <input
                  type="text"
                  id="court"
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as "upcoming" | "ongoing" | "completed"
                      )
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    required
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="league"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    League
                  </label>
                  <select
                    id="league"
                    value={league}
                    onChange={(e) =>
                      setLeague(e.target.value as "menA" | "menB" | "beginners")
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    required
                  >
                    <option value="menA">Men A</option>
                    <option value="menB">Men B</option>
                    <option value="beginners">Beginners</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <button
              type="submit"
              className="w-full md:w-auto py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        </form>
      </div>
    </Layout>
  );
}
