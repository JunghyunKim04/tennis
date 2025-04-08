"use client";

import Layout from "@/components/Layout";
import ScheduleTable from "@/components/ScheduleTable";
import { fetchMatches } from "@/lib/firebaseUtils";
import { Match } from "@/types";
import { format } from "date-fns";
import { useEffect, useState } from "react";

// Mock data for testing
const mockMatches: Match[] = [
  // 1코트 Matches
  // 9:00-9:40
  {
    id: "1",
    court: "1코트",
    homeTeam: "A1",
    awayTeam: "A2",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T09:00",
    endTime: "2025-04-13T09:40",
    league: "menA",
    date: "2025-04-13",
  },
  // 9:40-10:20
  {
    id: "2",
    court: "1코트",
    homeTeam: "A1",
    awayTeam: "A3",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T09:40",
    endTime: "2025-04-13T10:20",
    league: "menA",
    date: "2025-04-13",
  },
  // 10:20-11:00
  {
    id: "3",
    court: "1코트",
    homeTeam: "A2",
    awayTeam: "A5",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T10:20",
    endTime: "2025-04-13T11:00",
    league: "menA",
    date: "2025-04-13",
  },
  // 11:00-11:40
  {
    id: "4",
    court: "1코트",
    homeTeam: "A1",
    awayTeam: "A4",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T11:00",
    endTime: "2025-04-13T11:40",
    league: "menA",
    date: "2025-04-13",
  },
  // 12:20-13:00
  {
    id: "5",
    court: "1코트",
    homeTeam: "A1",
    awayTeam: "A5",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T12:20",
    endTime: "2025-04-13T13:00",
    league: "menA",
    date: "2025-04-13",
  },
  // 13:00-13:40
  {
    id: "6",
    court: "1코트",
    homeTeam: "A1",
    awayTeam: "A6",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T13:00",
    endTime: "2025-04-13T13:40",
    league: "menA",
    date: "2025-04-13",
  },
  // 13:40-14:20
  {
    id: "7",
    court: "1코트",
    homeTeam: "A3",
    awayTeam: "A6",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T13:40",
    endTime: "2025-04-13T14:20",
    league: "menA",
    date: "2025-04-13",
  },
  // 15:00-15:40
  {
    id: "8",
    court: "1코트",
    homeTeam: "AW1",
    awayTeam: "AW2",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T15:00",
    endTime: "2025-04-13T15:40",
    league: "menA",
    date: "2025-04-13",
  },
  // 15:40-16:20
  {
    id: "9",
    court: "1코트",
    homeTeam: "AW1",
    awayTeam: "AW2",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T15:40",
    endTime: "2025-04-13T16:20",
    league: "menA",
    date: "2025-04-13",
  },
  // 16:20-17:00
  {
    id: "10",
    court: "1코트",
    homeTeam: "AW1",
    awayTeam: "AW2",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T16:20",
    endTime: "2025-04-13T17:00",
    league: "menA",
    date: "2025-04-13",
  },

  // 2코트 Matches
  // 9:00-9:40
  {
    id: "11",
    court: "2코트",
    homeTeam: "A3",
    awayTeam: "A4",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T09:00",
    endTime: "2025-04-13T09:40",
    league: "menA",
    date: "2025-04-13",
  },
  // 9:40-10:20
  {
    id: "12",
    court: "2코트",
    homeTeam: "B1",
    awayTeam: "B3",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T09:40",
    endTime: "2025-04-13T10:20",
    league: "menB",
    date: "2025-04-13",
  },
  // 10:20-11:00
  {
    id: "13",
    court: "2코트",
    homeTeam: "A4",
    awayTeam: "A6",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T10:20",
    endTime: "2025-04-13T11:00",
    league: "menA",
    date: "2025-04-13",
  },
  // 11:00-11:40
  {
    id: "14",
    court: "2코트",
    homeTeam: "A2",
    awayTeam: "A6",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T11:00",
    endTime: "2025-04-13T11:40",
    league: "menA",
    date: "2025-04-13",
  },
  // 12:20-13:00
  {
    id: "15",
    court: "2코트",
    homeTeam: "A3",
    awayTeam: "A2",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T12:20",
    endTime: "2025-04-13T13:00",
    league: "menA",
    date: "2025-04-13",
  },

  // 3코트 Matches
  // 9:00-9:40
  {
    id: "16",
    court: "3코트",
    homeTeam: "A5",
    awayTeam: "A6",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T09:00",
    endTime: "2025-04-13T09:40",
    league: "menA",
    date: "2025-04-13",
  },
  // 9:40-10:20
  {
    id: "17",
    court: "3코트",
    homeTeam: "B5",
    awayTeam: "B6",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T09:40",
    endTime: "2025-04-13T10:20",
    league: "menB",
    date: "2025-04-13",
  },

  // 4코트 Matches
  // 9:00-9:40
  {
    id: "18",
    court: "4코트",
    homeTeam: "B1",
    awayTeam: "B2",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T09:00",
    endTime: "2025-04-13T09:40",
    league: "menB",
    date: "2025-04-13",
  },

  // 5코트 Matches
  // 9:00-9:40
  {
    id: "19",
    court: "5코트",
    homeTeam: "B3",
    awayTeam: "B4",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T09:00",
    endTime: "2025-04-13T09:40",
    league: "menB",
    date: "2025-04-13",
  },
  // 9:40-10:20
  {
    id: "20",
    court: "5코트",
    homeTeam: "N1",
    awayTeam: "N3",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T09:40",
    endTime: "2025-04-13T10:20",
    league: "beginners",
    date: "2025-04-13",
  },

  // 6코트 Matches
  // 9:00-9:40
  {
    id: "21",
    court: "6코트",
    homeTeam: "N1",
    awayTeam: "N2",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T09:00",
    endTime: "2025-04-13T09:40",
    league: "beginners",
    date: "2025-04-13",
  },
  // 9:40-10:20
  {
    id: "22",
    court: "6코트",
    homeTeam: "N4",
    awayTeam: "N5",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    startTime: "2025-04-13T09:40",
    endTime: "2025-04-13T10:20",
    league: "beginners",
    date: "2025-04-13",
  },
];

export default function SchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        // Try to fetch real data first
        let allMatches: Match[] = [];

        try {
          allMatches = await fetchMatches();

          // If no real data, use mock data
          if (allMatches.length === 0) {
            setUseMockData(true);
            allMatches = mockMatches;
          }
        } catch (error) {
          console.error(
            "Error fetching matches, using mock data instead:",
            error
          );
          setUseMockData(true);
          allMatches = mockMatches;
        }

        setMatches(allMatches);

        // Extract unique dates
        const uniqueDates = Array.from(
          new Set(
            allMatches.map((match) => {
              // Extract date part from startTime
              if (match.startTime.includes("T")) {
                return match.startTime.split("T")[0];
              }
              return match.date;
            })
          )
        ).sort();

        // Set the first date as selected by default
        if (uniqueDates.length > 0 && !selectedDate) {
          setSelectedDate(uniqueDates[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading matches:", error);
        setLoading(false);
      }
    };

    loadMatches();
  }, [selectedDate]);

  // Filter matches by the selected date and league
  const filteredMatches = matches.filter((match) => {
    // Extract the date part from match startTime or use date field
    const matchDate = match.startTime.includes("T")
      ? match.startTime.split("T")[0]
      : match.date;

    // Check if match date matches selected date
    const dateMatches = matchDate === selectedDate;

    // If no league is selected, just filter by date
    if (!selectedLeague) {
      return dateMatches;
    }

    // Filter by league and date
    return dateMatches && match.league === selectedLeague;
  });

  console.log("Filtered matches:", filteredMatches);

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "yyyy년 MM월 dd일");
    } catch {
      return dateStr;
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="mb-6 flex flex-col gap-6">
          {/* Tab Navigation */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b pb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9.75v7.5"
                />
              </svg>
              <span className="font-semibold">일정</span>
            </div>

            {/* League Filters */}
            <div className={"flex md:flex-row flex-col md:gap-4 gap-1"}>
              <button
                onClick={() => setSelectedLeague("menA")}
                className={`py-2 px-4 rounded-md text-center ${
                  selectedLeague === "menA"
                    ? "bg-red-600 text-white"
                    : "border border-red-300 text-red-600 hover:bg-red-50"
                }`}
              >
                Men A
              </button>
              <button
                onClick={() => setSelectedLeague("menB")}
                className={`py-2 px-4 rounded-md text-center ${
                  selectedLeague === "menB"
                    ? "bg-yellow-600 text-white"
                    : "border border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                }`}
              >
                Men B
              </button>
              <button
                onClick={() => setSelectedLeague("beginners")}
                className={`py-2 px-4 rounded-md text-center ${
                  selectedLeague === "beginners"
                    ? "bg-blue-600 text-white"
                    : "border border-blue-300 text-blue-600 hover:bg-blue-50"
                }`}
              >
                Beginners
              </button>
              <button
                onClick={() => setSelectedLeague(null)}
                className="py-2 px-4 rounded-md bg-gray-800 text-white text-center"
              >
                전체보기
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p>데이터를 불러오는 중입니다...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mock data indicator */}
            {useMockData && (
              <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded-md">
                Using mock data for demonstration
              </div>
            )}

            {selectedDate ? (
              <ScheduleTable
                matches={filteredMatches}
                date={formatDisplayDate(selectedDate)}
              />
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-500">선택된 날짜가 없습니다.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
