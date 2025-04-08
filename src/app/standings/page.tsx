"use client";

import Layout from "@/components/Layout";
import LeagueStandings from "@/components/LeagueStandings";
import { useAuth } from "@/context/AuthContext";
import {
  fetchLeagues,
  recalculateAllTeamStats,
  subscribeToTeamsUpdates,
} from "@/lib/firebaseUtils";
import { League, Team } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function StandingsPage() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculatingStats, setCalculatingStats] = useState(false);
  const [recalculationError, setRecalculationError] = useState<string | null>(
    null
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch leagues data
        const leaguesData = await fetchLeagues();
        setLeagues(leaguesData);

        // Only try to recalculate stats if user is an admin
        // Regular users will just see the current standings
        if (user && window.location.pathname.includes("/admin")) {
          setCalculatingStats(true);
          try {
            await recalculateAllTeamStats();
            console.log("Team stats recalculated successfully");
          } catch (error) {
            console.error("Error recalculating team stats:", error);
            if (error instanceof Error) {
              setRecalculationError(error.message);
            } else {
              setRecalculationError(
                "Failed to recalculate team stats. Check console for details."
              );
            }
            toast.error(
              `Failed to recalculate team stats: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          } finally {
            setCalculatingStats(false);
          }
        } else {
          console.log("Skipping stats recalculation for regular user view.");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading leagues:", error);
        setLoading(false);
      }
    };

    // Load data first
    loadData();

    // Set up real-time listener for teams data
    const unsubscribe = subscribeToTeamsUpdates((teamsData) => {
      setTeams(teamsData);
      console.log("Received updated team data:", teamsData.length, "teams");
    });

    // Clean up subscription when component unmounts
    return () => unsubscribe();
  }, [user]);

  // Group teams by league
  const teamsByLeague: Record<string, Team[]> = {};

  teams.forEach((team) => {
    if (!teamsByLeague[team.leagueId]) {
      teamsByLeague[team.leagueId] = [];
    }
    teamsByLeague[team.leagueId].push(team);
  });

  // Get league color class
  const getLeagueColorClass = (leagueId: string) => {
    const league = leagues.find((l) => l.id === leagueId);

    switch (league?.name) {
      case "Men A":
        return "men-a-bg";
      case "Men B":
        return "men-b-bg";
      case "Beginners":
        return "beginners-bg";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-6">토너먼트 순위</h1>

        {loading && teams.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p>데이터를 불러오는 중입니다...</p>
            </div>
          </div>
        ) : calculatingStats ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p>데이터를 불러오는 중입니다...</p>
              <p className="text-sm text-gray-500 mt-2">
                팀 통계를 계산하고 있습니다...
              </p>
            </div>
          </div>
        ) : recalculationError &&
          user &&
          window.location.pathname.includes("/admin") ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  팀 통계 재계산 중 오류가 발생했습니다: {recalculationError}
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  최신 데이터가 표시되지 않을 수 있습니다. 관리자에게
                  문의하세요.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {recalculationError &&
              recalculationError.includes("Permission denied") && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        현재 표시된 순위는 실시간으로 자동 업데이트됩니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            {leagues.length > 0 ? (
              leagues
                .sort((a, b) => {
                  console.log(a.name, b.name);
                  if (a.name === "Beginners") return 1;
                  if (b.name === "Beginners") return -1;
                  return a.name.localeCompare(b.name);
                })
                .map((league) => (
                  <LeagueStandings
                    key={league.id}
                    teams={teamsByLeague[league.id] || []}
                    leagueName={league.name}
                    leagueColor={getLeagueColorClass(league.id)}
                  />
                ))
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-500">리그 정보가 없습니다.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
