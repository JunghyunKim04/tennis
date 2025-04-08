'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { deleteMatch, fetchLeagues, fetchMatches, fetchTeams, updateMatch } from '@/lib/firebaseUtils';
import { League, Match, Team } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiCheck, FiEdit, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function AdminPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches'); // matches, teams, leagues
  
  // Add filter states
  const [matchFilters, setMatchFilters] = useState({
    status: 'all',
    league: 'all',
    court: 'all'
  });
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  
  // Add sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'startTime',
    direction: 'ascending'
  });

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!user && !loading) {
      router.push('/login');
      return;
    }

    if (userData && !userData.isAdmin) {
      router.push('/');
      toast.error('관리자 권한이 필요합니다.');
      return;
    }

    const loadData = async () => {
      try {
        const [matchesData, teamsData, leaguesData] = await Promise.all([
          fetchMatches(),
          fetchTeams(),
          fetchLeagues()
        ]);
        
        // Sort matches by start time (ascending) by default
        const sortedMatches = [...matchesData].sort((a, b) => 
          a.startTime.localeCompare(b.startTime)
        );
        
        setMatches(sortedMatches);
        setFilteredMatches(sortedMatches); // Initialize filtered matches with all matches
        setTeams(teamsData);
        setLeagues(leaguesData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, userData, router, loading]);

  // Add useEffect to handle filtering and sorting
  useEffect(() => {
    let result = [...matches];
    
    // Filter by status
    if (matchFilters.status !== 'all') {
      result = result.filter(match => match.status === matchFilters.status);
    }
    
    // Filter by league
    if (matchFilters.league !== 'all') {
      result = result.filter(match => match.league === matchFilters.league);
    }
    
    // Filter by court
    if (matchFilters.court !== 'all') {
      result = result.filter(match => match.court.toString() === matchFilters.court);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Match];
        const bValue = b[sortConfig.key as keyof Match];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' 
            ? aValue - bValue 
            : bValue - aValue;
        }
        
        return 0;
      });
    }
    
    setFilteredMatches(result);
  }, [matches, matchFilters, sortConfig]);

  // Function to request sort
  const requestSort = (key: keyof Match) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Helper function to get sort indicator
  const getSortIndicator = (key: keyof Match) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  // Get unique courts for filter
  const uniqueCourts = () => {
    const courts = matches.map(match => match.court.toString());
    return ['all', ...Array.from(new Set(courts))];
  };

  // Get unique leagues for filter
  const getUniqueLeagues = () => {
    const leagueValues = matches.map(match => match.league);
    return ['all', ...Array.from(new Set(leagueValues))];
  };

  // Handle filter change
  const handleFilterChange = (filterType: 'status' | 'league' | 'court', value: string) => {
    setMatchFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Helper function to get league background color
  const getLeagueBackgroundColor = (league: string) => {
    switch (league) {
      case 'menA':
        return 'bg-blue-50';
      case 'menB':
        return 'bg-green-50';
      case 'beginners':
        return 'bg-yellow-50';
      default:
        return 'bg-white';
    }
  };

  // Helper function to get league name by ID
  const getLeagueName = (leagueId: string) => {
    const league = leagues.find(l => l.id === leagueId);
    return league ? league.name : leagueId;
  };

  // Helper function to handle match status update
  const handleMatchStatusUpdate = async (matchId: string, status: 'upcoming' | 'ongoing' | 'completed') => {
    try {
      await updateMatch(matchId, { status });
      
      // Update local state
      setMatches(prev => 
        prev.map(match => 
          match.id === matchId ? { ...match, status } : match
        )
      );
      
      toast.success('경기 상태가 업데이트 되었습니다.');
    } catch (error) {
      console.error('Error updating match status:', error);
      toast.error('경기 상태 업데이트에 실패했습니다.');
    }
  };

  // Helper function to handle match deletion
  const handleDeleteMatch = async (matchId: string) => {
    try {
      // Delete the match from Firestore
      await deleteMatch(matchId);
      
      // Update local state by removing the deleted match
      setMatches(prev => prev.filter(match => match.id !== matchId));
      
      toast.success('경기가 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting match:', error);
      toast.error('경기 삭제에 실패했습니다.');
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>
        
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p>데이터를 불러오는 중입니다...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('matches')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'matches'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  경기 관리
                </button>
                <button
                  onClick={() => setActiveTab('teams')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'teams'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  팀 관리
                </button>
                <button
                  onClick={() => setActiveTab('leagues')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'leagues'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  리그 관리
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Matches Tab */}
              {activeTab === 'matches' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">경기 관리</h2>
                    <div className="flex space-x-2">
                      <Link
                        href="/admin/reset-matches"
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        <FiTrash2 className="mr-1" /> 스케줄 리셋
                      </Link>
                      <Link
                        href="/admin/matches/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        <FiPlus className="mr-1" /> 새 경기 등록
                      </Link>
                    </div>
                  </div>
                  
                  {/* Add filters */}
                  <div className="mb-6 flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">상태:</label>
                      <select
                        id="statusFilter"
                        value={matchFilters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="all">전체</option>
                        <option value="upcoming">예정</option>
                        <option value="ongoing">진행 중</option>
                        <option value="completed">종료</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <label htmlFor="leagueFilter" className="mr-2 text-sm font-medium text-gray-700">리그:</label>
                      <select
                        id="leagueFilter"
                        value={matchFilters.league}
                        onChange={(e) => handleFilterChange('league', e.target.value)}
                        className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="all">전체</option>
                        {getUniqueLeagues().filter(l => l !== 'all').map(league => (
                          <option key={league} value={league}>
                            {league === 'menA' ? 'Men A' : 
                             league === 'menB' ? 'Men B' : 
                             league === 'beginners' ? 'Beginners' : league}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <label htmlFor="courtFilter" className="mr-2 text-sm font-medium text-gray-700">코트:</label>
                      <select
                        id="courtFilter"
                        value={matchFilters.court}
                        onChange={(e) => handleFilterChange('court', e.target.value)}
                        className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="all">전체</option>
                        {uniqueCourts().filter(c => c !== 'all').map(court => (
                          <option key={court} value={court}>코트 {court}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={() => setMatchFilters({status: 'all', league: 'all', court: 'all'})}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      필터 초기화
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('startTime')}
                          >
                            날짜 & 시간 {getSortIndicator('startTime')}
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('homeTeam')}
                          >
                            홈팀 {getSortIndicator('homeTeam')}
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('awayTeam')}
                          >
                            어웨이팀 {getSortIndicator('awayTeam')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            점수
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('court')}
                          >
                            코트 {getSortIndicator('court')}
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('league')}
                          >
                            리그 {getSortIndicator('league')}
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('status')}
                          >
                            상태 {getSortIndicator('status')}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            작업
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredMatches.map(match => (
                          <tr 
                            key={match.id} 
                            className={`hover:bg-gray-100 ${getLeagueBackgroundColor(match.league)}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              {match.startTime.split('T')[1]?.substring(0, 5) || match.startTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {match.homeTeam}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {match.awayTeam}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {match.homeScore} - {match.awayScore}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              코트 {match.court}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {match.league === 'menA' ? 'Men A' : 
                               match.league === 'menB' ? 'Men B' : 
                               match.league === 'beginners' ? 'Beginners' : match.league}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span 
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    match.status === 'upcoming' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : match.status === 'ongoing' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {match.status === 'upcoming' 
                                    ? '예정' 
                                    : match.status === 'ongoing' 
                                    ? '진행 중' 
                                    : '종료'}
                                </span>
                                
                                <div className="ml-2 flex space-x-1">
                                  {match.status !== 'upcoming' && (
                                    <button 
                                      onClick={() => handleMatchStatusUpdate(match.id, 'upcoming')}
                                      className="text-blue-600 hover:text-blue-800"
                                      title="예정으로 변경"
                                    >
                                      <FiPlus size={14} />
                                    </button>
                                  )}
                                  
                                  {match.status !== 'ongoing' && (
                                    <button 
                                      onClick={() => handleMatchStatusUpdate(match.id, 'ongoing')}
                                      className="text-green-600 hover:text-green-800"
                                      title="진행 중으로 변경"
                                    >
                                      <FiCheck size={14} />
                                    </button>
                                  )}
                                  
                                  {match.status !== 'completed' && (
                                    <button 
                                      onClick={() => handleMatchStatusUpdate(match.id, 'completed')}
                                      className="text-gray-600 hover:text-gray-800"
                                      title="종료로 변경"
                                    >
                                      <FiX size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                href={`/admin/matches/edit/${match.id}`}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <FiEdit />
                              </Link>
                              <button
                                onClick={() => {
                                  if (window.confirm('이 경기를 삭제하시겠습니까?')) {
                                    handleDeleteMatch(match.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))}
                        
                        {filteredMatches.length === 0 && (
                          <tr>
                            <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                              등록된 경기가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Teams Tab */}
              {activeTab === 'teams' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">팀 관리</h2>
                    <div className="flex space-x-2">
                      <Link
                        href="/admin/reset-team-stats"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        <FiCheck className="mr-1" /> 팀 통계 재계산
                      </Link>
                      <Link
                        href="/admin/teams/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        <FiPlus className="mr-1" /> 새 팀 등록
                      </Link>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            팀 이름
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            선수
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            리그
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            승리
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            패배
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            승점
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            작업
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {teams.map(team => (
                          <tr key={team.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {team.name}
                            </td>
                            <td className="px-6 py-4">
                              {team.players.join(', ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getLeagueName(team.leagueId)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {team.wins}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {team.losses}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {team.points}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                href={`/admin/teams/edit/${team.id}`}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <FiEdit />
                              </Link>
                              <button
                                onClick={() => {
                                  // Handle delete team logic
                                  if (window.confirm('이 팀을 삭제하시겠습니까?')) {
                                    // Delete logic
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))}
                        
                        {teams.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                              등록된 팀이 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Leagues Tab */}
              {activeTab === 'leagues' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">리그 관리</h2>
                    <Link
                      href="/admin/leagues/new"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                    >
                      <FiPlus className="mr-1" /> 새 리그 등록
                    </Link>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            리그 이름
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            설명
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            팀 수
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            작업
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leagues.map(league => (
                          <tr key={league.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {league.name}
                            </td>
                            <td className="px-6 py-4">
                              {league.description || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {league.teams.length}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                href={`/admin/leagues/edit/${league.id}`}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <FiEdit />
                              </Link>
                              <button
                                onClick={() => {
                                  // Handle delete league logic
                                  if (window.confirm('이 리그를 삭제하시겠습니까?')) {
                                    // Delete logic
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))}
                        
                        {leagues.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                              등록된 리그가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
} 