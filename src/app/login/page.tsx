'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FiLock, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('로그인에 성공했습니다.');
      router.push('/admin');
    } catch (error) {
      toast.error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">관리자 로그인</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                이메일
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="이메일 주소"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md w-full flex items-center justify-center ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>관리자 계정이 있는 사용자만 로그인할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 