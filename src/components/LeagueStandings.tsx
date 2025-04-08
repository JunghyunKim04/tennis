import { Team } from "@/types";
import React, { useEffect, useState } from "react";

interface LeagueStandingsProps {
  teams: Team[];
  leagueName: string;
  leagueColor: string;
}

const LeagueStandings: React.FC<LeagueStandingsProps> = ({
  teams,
  leagueName,
  leagueColor,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Add goalDifference calculation and sort teams by wins first, then goal difference
  const sortedTeams = [...teams].sort((a, b) => {
    // Calculate goal difference
    const aGoalDiff = (a.goalsScored || 0) - (a.goalsConceded || 0);
    const bGoalDiff = (b.goalsScored || 0) - (b.goalsConceded || 0);

    // First sort by wins
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }

    // If wins are equal, sort by goal difference
    return bGoalDiff - aGoalDiff;
  });

  if (isMobile) {
    return (
      <div className="mb-8">
        <h2
          className={`text-xl font-bold mb-4 p-2 ${leagueColor} rounded-md inline-block`}
        >
          {leagueName} 리그 순위
        </h2>

        <div className="space-y-3">
          {sortedTeams.length === 0 ? (
            <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-md">
              등록된 팀이 없습니다.
            </div>
          ) : (
            sortedTeams.map((team, index) => {
              const goalDifference =
                (team.goalsScored || 0) - (team.goalsConceded || 0);

              return (
                <div
                  key={team.id}
                  className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-gray-700 font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium">{team.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                        {team.wins}승 {team.losses}패
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                    <div className="flex flex-col items-center p-1 bg-gray-50 rounded">
                      <span className="text-xs text-gray-500">득점</span>
                      <span className="font-medium">
                        {team.goalsScored || 0}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-1 bg-gray-50 rounded">
                      <span className="text-xs text-gray-500">실점</span>
                      <span className="font-medium">
                        {team.goalsConceded || 0}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-1 bg-gray-50 rounded">
                      <span className="text-xs text-gray-500">득실차</span>
                      <span
                        className={`font-medium ${
                          goalDifference > 0
                            ? "text-green-600"
                            : goalDifference < 0
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {goalDifference > 0 ? "+" : ""}
                        {goalDifference}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2
        className={`text-xl font-bold mb-4 p-2 ${leagueColor} rounded-md inline-block`}
      >
        {leagueName} 리그 순위
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">순위</th>
              <th className="py-3 px-4 text-left font-semibold">팀</th>
              <th className="py-3 px-4 text-center font-semibold">경기</th>
              <th className="py-3 px-4 text-center font-semibold">승</th>
              <th className="py-3 px-4 text-center font-semibold">패</th>
              <th className="py-3 px-4 text-center font-semibold">득점</th>
              <th className="py-3 px-4 text-center font-semibold">실점</th>
              <th className="py-3 px-4 text-center font-semibold">득실차</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedTeams.map((team, index) => {
              // Calculate goal difference safely handling undefined values
              const goalDifference =
                (team.goalsScored || 0) - (team.goalsConceded || 0);

              return (
                <tr
                  key={team.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-left">{index + 1}</td>
                  <td className="py-3 px-4 text-left font-medium">
                    {team.name}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {team.wins + team.losses}
                  </td>
                  <td className="py-3 px-4 text-center">{team.wins}</td>
                  <td className="py-3 px-4 text-center">{team.losses}</td>
                  <td className="py-3 px-4 text-center">
                    {team.goalsScored || 0}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {team.goalsConceded || 0}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold">
                    {goalDifference}
                  </td>
                </tr>
              );
            })}
            {sortedTeams.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  등록된 팀이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeagueStandings;
