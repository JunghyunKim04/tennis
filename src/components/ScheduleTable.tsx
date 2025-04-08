import { Match } from "@/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface ScheduleTableProps {
  matches: Match[];
  date: string;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ matches }) => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>("");
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

  // Update current time every minute
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Debug logging for matches received
  useEffect(() => {
    console.log("ScheduleTable received matches:", matches);
  }, [matches]);

  // Define league colors
  const getLeagueClass = (league: string) => {
    switch (league) {
      case "menA":
        return "bg-red-100 text-red-800 border-red-200";
      case "menB":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "beginners":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Group matches by time
  const timeSlots = [
    "09:00",
    "09:40",
    "10:20",
    "11:00",
    "11:40",
    "12:20",
    "13:00",
    "13:40",
    "14:20",
    "15:00",
    "15:40",
    "16:20",
  ];

  // Group courts
  const courts = ["1코트", "2코트", "3코트", "4코트", "5코트", "6코트"];

  // Build a schedule grid
  const scheduleGrid: { [time: string]: { [court: string]: Match | null } } =
    {};

  // Initialize grid with empty values
  timeSlots.forEach((time) => {
    scheduleGrid[time] = {};
    courts.forEach((court) => {
      scheduleGrid[time][court] = null;
    });
  });

  // Fill grid with matches
  matches.forEach((match) => {
    let timeKey = "";

    // Handle the different time formats
    if (match.startTime.includes("T")) {
      timeKey = match.startTime.split("T")[1]?.substring(0, 5);
    } else {
      // If it's already just a time string
      timeKey = match.startTime;
    }

    // Map court number to court name with 코트
    const courtKey = `${match.court}`;

    if (scheduleGrid[timeKey]) {
      scheduleGrid[timeKey][courtKey] = match;
      console.log(`Successfully mapped match to ${timeKey} and ${courtKey}`);
    } else {
      console.warn(
        `Could not map match to grid: Invalid time key ${timeKey}`,
        match
      );
    }
  });

  // Debug the final grid
  console.log("Schedule grid:", scheduleGrid);

  // Helper function to check if a time slot is current
  const isCurrentTimeSlot = (startTime: string, endTime: string) => {
    if (!currentTime) return false;

    const current = currentTime.replace(":", "");
    const start = startTime.replace(":", "");
    const end = endTime.replace(":", "");

    return current >= start && current < end;
  };

  // Render mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-200 mr-2"></div>
            <span>Men A</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 mr-2"></div>
            <span>Men B</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 mr-2"></div>
            <span>Beginners</span>
          </div>
        </div>

        {timeSlots.map((startTime, index) => {
          const endTime =
            index < timeSlots.length - 1 ? timeSlots[index + 1] : "17:00";
          const isCurrentSlot = isCurrentTimeSlot(startTime, endTime);
          const matchesInSlot = courts
            .map((court) => scheduleGrid[startTime]?.[court])
            .filter((match): match is Match => match !== null);

          if (matchesInSlot.length === 0) return null;

          return (
            <div
              key={startTime}
              className={`rounded-lg overflow-hidden shadow-sm ${
                isCurrentSlot
                  ? "border-2 border-blue-500"
                  : "border border-gray-200"
              }`}
            >
              <div
                className={`${
                  isCurrentSlot ? "bg-blue-50" : "bg-gray-50"
                } p-3 font-medium`}
              >
                {startTime} - {endTime}
                {startTime === "11:40" &&
                  endTime === "12:20" &&
                  " (Lunch & Rest)"}
              </div>

              {startTime === "11:40" && endTime === "12:20" ? (
                <div className="p-3 text-center bg-gray-50">Lunch Break</div>
              ) : (
                <div>
                  {matchesInSlot.map((match) => (
                    <div
                      key={`${startTime}-${match.court}`}
                      className={`p-3 border-t border-gray-100 ${getLeagueClass(
                        match.league
                      )} select-none`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{match.court}</div>
                        <div className="text-sm text-gray-500">
                          {match.homeTeam} vs {match.awayTeam}
                        </div>
                        {match.homeScore > 0 && (
                          <div className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white text-xs font-medium">
                            {match.homeScore}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border-separate border-spacing-0 border border-gray-200 rounded-md">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 p-2 text-center">
              시작 시간
            </th>
            <th className="border border-gray-200 p-2 text-center">
              종료 시간
            </th>
            {courts.map((court) => (
              <th
                key={court}
                className="border border-gray-200 p-2 text-center"
              >
                {court}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((startTime, index) => {
            const endTime =
              index < timeSlots.length - 1 ? timeSlots[index + 1] : "17:00";

            const isCurrentSlot = isCurrentTimeSlot(startTime, endTime);
            const currentRowClass = isCurrentSlot
              ? "border-2 border-blue-500 bg-blue-50"
              : "";

            // Handle lunch break
            if (startTime === "11:40" && endTime === "12:20") {
              return (
                <tr key={startTime} className={currentRowClass}>
                  <td
                    className={`border ${
                      isCurrentSlot ? "border-blue-500" : "border-gray-200"
                    } p-2 text-center`}
                  >
                    {startTime}
                  </td>
                  <td
                    className={`border ${
                      isCurrentSlot ? "border-blue-500" : "border-gray-200"
                    } p-2 text-center`}
                  >
                    {endTime}
                  </td>
                  <td
                    colSpan={courts.length}
                    className={`border ${
                      isCurrentSlot ? "border-blue-500" : "border-gray-200"
                    } p-2 text-center font-medium ${
                      isCurrentSlot ? "bg-blue-50" : "bg-gray-50"
                    }`}
                  >
                    Lunch & Rest
                  </td>
                </tr>
              );
            }

            return (
              <tr key={startTime} className={currentRowClass}>
                <td
                  className={`border ${
                    isCurrentSlot ? "border-blue-500" : "border-gray-200"
                  } p-2 text-center`}
                >
                  {startTime}
                </td>
                <td
                  className={`border ${
                    isCurrentSlot ? "border-blue-500" : "border-gray-200"
                  } p-2 text-center`}
                >
                  {endTime}
                </td>
                {courts.map((court) => {
                  const match = scheduleGrid[startTime]?.[court] || null;

                  if (!match) {
                    return (
                      <td
                        key={`${startTime}-${court}`}
                        className={`border ${
                          isCurrentSlot ? "border-blue-500" : "border-gray-200"
                        } p-2 text-center`}
                      ></td>
                    );
                  }

                  return (
                    <td
                      key={`${startTime}-${court}`}
                      className={`border ${
                        isCurrentSlot ? "border-blue-500" : "border-gray-200"
                      } p-2 text-center cursor-pointer ${getLeagueClass(
                        match.league
                      )}`}
                      onClick={() =>
                        match.id && router.push(`/matches/${match.id}`)
                      }
                    >
                      <div className="flex items-center justify-center gap-2">
                        {match.status === "completed" && (
                          <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white text-xs font-medium">
                            {match.homeScore}
                          </span>
                        )}
                        <span>
                          {match.homeTeam} vs {match.awayTeam}
                        </span>
                        {match.status === "completed" && (
                          <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white text-xs font-medium">
                            {match.awayScore}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 flex gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 border border-red-200 mr-2"></div>
          <span>Men A</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 mr-2"></div>
          <span>Men B</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-100 border border-blue-200 mr-2"></div>
          <span>Beginners</span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTable;
