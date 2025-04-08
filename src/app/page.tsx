"use client";

import Layout from "@/components/Layout";
import MatchCard from "@/components/MatchCard";
import {
  subscribeToMatches,
  subscribeToOngoingMatches,
} from "@/lib/firebaseUtils";
import { Match } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiTrendingUp } from "react-icons/fi";

export default function Home() {
  const [ongoingMatches, setOngoingMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);

  useEffect(() => {
    // Subscribe to ongoing matches
    const unsubscribeOngoing = subscribeToOngoingMatches((matches) => {
      setOngoingMatches(matches);
    });

    // Subscribe to all matches to filter upcoming and recent ones
    const unsubscribeAll = subscribeToMatches((matches) => {
      // Filter upcoming matches (max 3)
      const upcoming = matches
        .filter((match) => match.status === "upcoming")
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
        .slice(0, 3);

      setUpcomingMatches(upcoming);
    });

    return () => {
      unsubscribeOngoing();
      unsubscribeAll();
    };
  }, []);

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-900 text-white rounded-xl p-6 md:p-10 shadow-lg">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            제1회 KSA 위닝샷 챔피언십
          </h1>
          <p className="text-xl opacity-80 mb-6">
            실시간 경기 결과와 일정을 확인하세요
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/schedule"
              className="bg-white text-blue-700 px-6 py-2 rounded-full font-semibold flex items-center hover:bg-blue-50 transition"
            >
              <FiCalendar className="mr-2" /> 경기 일정
            </Link>
            <Link
              href="/standings"
              className="bg-blue-800 text-white px-6 py-2 rounded-full font-semibold flex items-center hover:bg-blue-700 transition border border-blue-400"
            >
              <FiTrendingUp className="mr-2" /> 순위표
            </Link>
          </div>
        </div>
        {/* Ongoing Matches */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <FiClock className="text-green-600 mr-2 text-xl" />
            <h2 className="text-2xl font-bold">현재 진행 중인 경기</h2>
          </div>

          {ongoingMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">현재 진행 중인 경기가 없습니다.</p>
            </div>
          )}
        </div>

        {/* Recent and Upcoming Matches */}

        {/* Upcoming Matches */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">다가오는 경기</h2>
          {upcomingMatches.length > 0 ? (
            <div className="space-y-4">
              {upcomingMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500">예정된 경기가 없습니다.</p>
            </div>
          )}
          <div className="mt-4 text-right">
            <Link href="/schedule" className="text-blue-600 hover:underline">
              전체 일정 보기 →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
