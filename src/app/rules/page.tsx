"use client";

import Layout from "@/components/Layout";

const RulesPage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">
          🎾 제1회 KSA 위닝샷 챔피언십 – 경기 진행 및 규칙 안내 🏆
        </h1>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <p className="text-lg font-medium mb-4">
            📣 안녕하세요, 참가자 여러분!
          </p>
          <p className="mb-6">
            대회 시작에 앞서 경기 진행 방식과 주요 규칙을 안내드립니다. 모두가
            즐겁고 공정하게 참여할 수 있도록 아래 내용을 숙지해 주세요.
          </p>

          <h2 className="text-2xl font-bold mb-3">📋 경기 방식</h2>
          <ul className="list-none mb-6">
            <li className="mb-2">
              ✔ 모든 리그는 풀리그(리그전) 형식으로 진행됩니다.
            </li>
            <li className="mb-2">
              ✔ 모든 팀은 최소 5경기 이상 출전하게 됩니다.
            </li>
            <li className="mb-2">
              ✔ 예선 경기 후, 각 리그별로 결승 라운드가 아래와 같이 진행됩니다:
            </li>
          </ul>

          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h3 className="font-bold mb-2">🔹 Men A & League B 리그</h3>
            <p className="mb-2 ml-4">
              ‣ 예선 1위 vs 예선 2위 간의 3판 2선승제 결승전
            </p>

            <h3 className="font-bold mt-4 mb-2">🔹 Beginners 리그</h3>
            <p className="mb-2 ml-4">
              ‣ 예선 종료 후 상위 3팀이 서로 한 번씩 더 경기하며,
            </p>
            <p className="mb-2 ml-4">
              ‣ 그 결과 상위 2팀이 결승전(1경기)을 통해 우승팀 결정
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-3">🎁 여성 복식 팀 특별 규정</h2>
          <ul className="list-none mb-6">
            <li className="mb-2">
              ✔ Men B 리그에 출전하는 여성 복식 팀은 경기 시작 시 15점 핸디캡을
              가지고 시작합니다.
            </li>
            <li className="mb-2">
              ✔ 이는 경기의 균형과 즐거움을 위한 조치입니다.
            </li>
          </ul>

          <h2 className="text-2xl font-bold mb-3">🎾 경기 규칙</h2>
          <ul className="list-none">
            <li className="mb-2">🎯 모든 경기는 6게임 1세트로 진행됩니다.</li>
            <li className="mb-2">
              🎯 게임스코어가 5-5가 될 경우, 7포인트 타이브레이크로 승부 결정
            </li>
            <li className="mb-2">🎯 첫 서브권은 라켓 돌리기로 정합니다.</li>
            <li className="mb-2">
              🎯 득점 방식은 노애드(Deuce 이후 한 포인트로 승부)로 진행됩니다.
            </li>
            <li className="mb-2">
              🎯 심판 없이 선수 간 페어플레이 및 자율 판정을 기본으로 합니다.
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default RulesPage;
