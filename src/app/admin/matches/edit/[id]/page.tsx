"use client";

import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { fetchMatchById, updateMatch } from "@/lib/firebaseUtils";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;

    setError(null);
    setIsSubmitting(true);
    // TODO: Add form validation if needed

    try {
      // --- Prepare Update Data ---
      const updateData = {
        homeScore,
        awayScore,
        homeTeam,
        awayTeam,
        court,
        status,
        date,
        startTime,
        endTime,
        league,
      };

      await updateMatch(id, updateData);
      toast.success(
        "경기 정보가 성공적으로 업데이트 되었습니다. 점수 변경 사항은 모든 페이지에 반영됩니다."
      );
      // Optional: Redirect or provide further feedback
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
