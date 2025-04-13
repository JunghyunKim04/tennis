"use client";

import Layout from "@/components/Layout";
import ScheduleTable from "@/components/ScheduleTable";
import { fetchMatches } from "@/lib/firebaseUtils";
import { Match } from "@/types";
import { format } from "date-fns";
import { useEffect, useState } from "react";


export default function SchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        // Try to fetch real data first
        let allMatches: Match[] = [];

        try {
          allMatches = await fetchMatches();

        } catch (error) {
          console.error(
            "Error fetching matches, using mock data instead:",
            error
          );
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
