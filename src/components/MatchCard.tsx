import { Match } from '@/types';
import { format } from 'date-fns';
import React from 'react';
import { FiClock, FiMapPin } from 'react-icons/fi';

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const getStatusClass = () => {
    switch (match.status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (match.status) {
      case 'upcoming':
        return '예정';
      case 'ongoing':
        return '진행 중';
      case 'completed':
        return '종료';
      default:
        return '';
    }
  };

  const getLeagueClass = () => {
    switch (match.league) {
      case 'menA':
        return 'men-a-bg';
      case 'menB':
        return 'men-b-bg';
      case 'beginners':
        return 'beginners-bg';
      default:
        return '';
    }
  };

  const getLeagueText = () => {
    switch (match.league) {
      case 'menA':
        return 'Men A';
      case 'menB':
        return 'Men B';
      case 'beginners':
        return 'Beginners';
      default:
        return '';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return format(date, 'HH:mm');
    } catch {
      return timeString;
    }
  };

  return (
    <div className={`rounded-lg shadow-md overflow-hidden border border-gray-200 ${getLeagueClass()}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusClass()}`}>
              {getStatusText()}
            </span>
            <span className="ml-2 text-xs font-medium text-gray-600">
              {getLeagueText()}
            </span>
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            <FiClock className="mr-1" size={14} />
            <span>{formatTime(match.startTime)}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center my-4 text-gray-800">
          <div className="flex-1 text-right">
            <p className="font-semibold text-lg">{match.homeTeam}</p>
          </div>
          
          <div className="mx-4 flex items-center">
            {match.status === 'completed' || match.status === 'ongoing' ? (
              <div className="flex items-center text-xl font-bold">
                <span>{match.homeScore}</span>
                <span className="mx-2">-</span>
                <span>{match.awayScore}</span>
              </div>
            ) : (
              <div className="text-sm font-medium text-gray-500">vs</div>
            )}
          </div>
          
          <div className="flex-1 text-left">
            <p className="font-semibold text-lg">{match.awayTeam}</p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <FiMapPin className="mr-1" size={14} />
            <span>코트 {match.court}</span>
          </div>
          <div>
            {match.date}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard; 