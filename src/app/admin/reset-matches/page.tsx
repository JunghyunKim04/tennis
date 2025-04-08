'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { resetMatchesDatabase } from '@/lib/resetMatches';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ResetMatchesPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  const handleReset = async () => {
    if (confirmText !== 'RESET ALL MATCHES') {
      toast.error('Please type the confirmation text exactly as shown');
      return;
    }

    setIsLoading(true);
    try {
      const success = await resetMatchesDatabase();
      if (success) {
        setResult('success');
        toast.success('All matches and team statistics have been reset successfully!');
      } else {
        setResult('error');
        toast.error('Failed to reset matches and team statistics');
      }
    } catch (error) {
      console.error('Error during reset:', error);
      setResult('error');
      toast.error('An error occurred during reset');
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
      <div className="container mx-auto p-4 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Reset All Matches and Team Statistics</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <p className="text-lg mb-4">
              This action will:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Delete <strong>ALL</strong> existing matches from the database</li>
              <li>Reset <strong>ALL</strong> team statistics (wins, losses, points, goals)</li>
              <li>Add all 51 matches from the tennis schedule</li>
              <li>This cannot be undone</li>
            </ul>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    This is a destructive action and will remove all match data, including any scores or status updates that have been made. All team statistics will be reset to zero.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-2">
              To confirm, type &quot;RESET ALL MATCHES&quot; below:
            </label>
            <input
              type="text"
              id="confirmText"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-between">
            <Link
              href="/admin"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            
            <button
              onClick={handleReset}
              disabled={isLoading || confirmText !== 'RESET ALL MATCHES'}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                isLoading || confirmText !== 'RESET ALL MATCHES'
                  ? 'bg-red-300 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading ? 'Processing...' : 'Reset All Matches and Stats'}
            </button>
          </div>
        </div>
        
        {/* Result section */}
        {result === 'success' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Successfully reset all matches and team statistics! The database now contains 51 matches from the schedule and all team statistics have been reset to zero.
                </p>
                <div className="mt-4">
                  <Link
                    href="/admin"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Go to Admin Dashboard
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
                  An error occurred while trying to reset the matches and team statistics. Please check the console for details and try again.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 