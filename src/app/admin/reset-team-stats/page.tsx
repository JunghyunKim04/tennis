'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { recalculateAllTeamStats } from '@/lib/firebaseUtils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ResetTeamStatsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  const handleReset = async () => {
    if (confirmText !== 'RECALCULATE TEAM STATS') {
      toast.error('Please type the confirmation text exactly as shown');
      return;
    }

    setIsLoading(true);
    try {
      await recalculateAllTeamStats();
      setResult('success');
      toast.success('Team stats have been recalculated successfully!');
    } catch (error) {
      console.error('Error recalculating team stats:', error);
      setResult('error');
      toast.error('Failed to recalculate team stats');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if not authenticated or not an admin
  if (!user && typeof window !== 'undefined') {
    router.push('/login');
    return null;
  }

  if (userData && !userData.isAdmin) {
    router.push('/');
    toast.error('관리자 권한이 필요합니다.');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">팀 통계 재계산</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">주의: 팀 통계 재계산</h2>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  이 작업은 모든 팀의 승패 통계와 순위를 재계산합니다. 진행된 경기를 기반으로 모든 팀의 승, 패, 승점이 업데이트됩니다.
                </p>
              </div>
            </div>
          </div>
          
          <p className="mb-6">
            이 작업을 수행하면 다음과 같은 일이 일어납니다:
          </p>
          
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>모든 팀의 승, 패, 승점이 0으로 초기화됩니다.</li>
            <li>완료된 모든 경기(status: completed)를 분석합니다.</li>
            <li>각 경기 결과에 따라 팀 통계가 업데이트됩니다.</li>
            <li>변경사항은 즉시 데이터베이스에 반영됩니다.</li>
          </ul>
          
          <p className="font-medium mb-6">
            계속하려면 아래에 &quot;RECALCULATE TEAM STATS&quot;를 정확히 입력하세요.
          </p>
          
          <div className="mb-6">
            <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-1">
              확인 텍스트
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="RECALCULATE TEAM STATS"
            />
          </div>
          
          <div className="flex justify-between">
            <Link
              href="/admin"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              취소
            </Link>
            
            <button
              onClick={handleReset}
              disabled={isLoading || confirmText !== 'RECALCULATE TEAM STATS'}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading || confirmText !== 'RECALCULATE TEAM STATS'
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? '처리 중...' : '팀 통계 재계산'}
            </button>
          </div>
        </div>
        
        {/* Result section */}
        {result === 'success' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  팀 통계가 성공적으로 재계산되었습니다! 모든 팀의 승, 패, 승점이 업데이트되었습니다.
                </p>
                <div className="mt-4">
                  <Link
                    href="/standings"
                    className="mr-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    순위표 확인
                  </Link>
                  <Link
                    href="/admin"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    관리자 대시보드로 이동
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {result === 'error' && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  팀 통계 재계산 중 오류가 발생했습니다. 콘솔을 확인하고 다시 시도해 주세요.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 