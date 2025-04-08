'use client';

import Layout from '@/components/Layout';
import { initializeAdminUser, initializeDatabase } from '@/lib/initializeData';
import { AuthError, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import React, { useState } from 'react';
import { FiCheck, FiDatabase, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminCreated, setAdminCreated] = useState(false);

  const handleInitializeDatabase = async () => {
    setLoading(true);
    try {
      await initializeDatabase();
      setDbInitialized(true);
      toast.success('데이터베이스가 초기화되었습니다.');
    } catch (error) {
      console.error('Error initializing database:', error);
      toast.error('데이터베이스 초기화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      const user = userCredential.user;
      
      await initializeAdminUser(user.uid, adminEmail);
      setAdminCreated(true);
      toast.success('관리자 계정이 생성되었습니다.');
    } catch (error) {
      console.error('Error creating admin:', error);
      let errorMessage = '관리자 계정 생성 중 오류가 발생했습니다.';
      
      if (error instanceof Error) {
        const authError = error as AuthError;
        if (authError.code === 'auth/email-already-in-use') {
          errorMessage = '이미 사용 중인 이메일입니다.';
        } else if (authError.code === 'auth/weak-password') {
          errorMessage = '비밀번호가 너무 약합니다. 최소 6자 이상이어야 합니다.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">시스템 설정</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiDatabase className="mr-2" /> 데이터베이스 초기화
          </h2>
          <p className="mb-4 text-gray-600">
            시스템을 사용하기 전에 데이터베이스를 초기화하고 샘플 데이터를 추가해야 합니다.
            이 작업은 한 번만 수행해야 합니다.
          </p>
          
          <div className="mt-4">
            <button
              onClick={handleInitializeDatabase}
              disabled={loading || dbInitialized}
              className={`px-4 py-2 rounded-md ${
                dbInitialized
                  ? 'bg-green-500 text-white'
                  : loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  처리 중...
                </>
              ) : dbInitialized ? (
                <>
                  <FiCheck className="mr-2" /> 초기화 완료
                </>
              ) : (
                '데이터베이스 초기화'
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiUser className="mr-2" /> 관리자 계정 생성
          </h2>
          <p className="mb-4 text-gray-600">
            시스템을 관리할 관리자 계정을 생성하세요. 관리자 계정이 있어야 경기 결과를 입력하고 수정할 수 있습니다.
          </p>
          
          {adminCreated ? (
            <div className="bg-green-100 text-green-800 p-4 rounded-md flex items-center">
              <FiCheck className="mr-2" /> 관리자 계정이 생성되었습니다.
            </div>
          ) : (
            <form onSubmit={handleCreateAdmin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">비밀번호는 최소 6자 이상이어야 합니다.</p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-md ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } flex items-center justify-center`}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    처리 중...
                  </>
                ) : (
                  '관리자 계정 생성'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
} 