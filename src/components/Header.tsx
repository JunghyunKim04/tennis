import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BsExclamationLg } from "react-icons/bs";
import {
  FiCalendar,
  FiHome,
  FiLogIn,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";

const Header: React.FC = () => {
  const { user, userData, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const navLinks = [
    { href: "/", label: "홈", icon: <FiHome /> },
    { href: "/schedule", label: "경기 일정", icon: <FiCalendar /> },
    { href: "/standings", label: "순위표", icon: <FiTrendingUp /> },
    { href: "/rules", label: "경기 규칙", icon: <BsExclamationLg /> },
    { href: "/admin", label: "관리자", icon: <BsExclamationLg /> },
  ];

  if (userData?.isAdmin) {
    navLinks.push({
      href: "/admin",
      label: "관리자",
      icon: <FiSettings />,
    });
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold flex items-center"
          >
            <span className="mr-2">🎾</span>
            <span className="wrap-break-word">KSA 제 1회 위닝샷 챔피언십</span>
          </Link>
        </div>

        {isMobile ? (
          <button
            onClick={toggleDrawer}
            className="p-2 focus:outline-none"
            aria-label="Open menu"
          >
            <FiMenu size={24} />
          </button>
        ) : (
          <nav>
            <ul className="flex space-x-4 items-center">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-blue-200 transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {user ? (
                <li>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white transition"
                  >
                    <FiLogOut className="mr-1" /> 로그아웃
                  </button>
                </li>
              ) : (
                <li>
                  <Link
                    href="/login"
                    className="flex items-center bg-blue-900 hover:bg-blue-950 px-3 py-1 rounded text-white transition"
                  >
                    <FiLogIn className="mr-1" /> 로그인
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
            drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeDrawer}
        >
          <div
            className={`fixed top-0 right-0 h-full w-64 bg-blue-900 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
              drawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-blue-800 flex justify-between items-center">
              <h2 className="font-bold text-lg">메뉴</h2>
              <button
                onClick={closeDrawer}
                className="p-2 focus:outline-none"
                aria-label="Close menu"
              >
                <FiX size={20} />
              </button>
            </div>

            <nav className="p-4">
              <ul className="space-y-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-3 text-white hover:text-blue-200 py-2 transition"
                      onClick={closeDrawer}
                    >
                      <span className="text-blue-300">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}

                <li className="border-t border-blue-800 pt-4 mt-4">
                  {user ? (
                    <button
                      onClick={() => {
                        signOut();
                        closeDrawer();
                      }}
                      className="flex items-center space-x-3 text-white hover:text-red-300 py-2 transition w-full"
                    >
                      <span className="text-red-400">
                        <FiLogOut />
                      </span>
                      <span>로그아웃</span>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center space-x-3 text-white hover:text-blue-200 py-2 transition"
                      onClick={closeDrawer}
                    >
                      <span className="text-blue-300">
                        <FiLogIn />
                      </span>
                      <span>로그인</span>
                    </Link>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
