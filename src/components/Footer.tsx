import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 py-6 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 flex items-center">
              <span className="text-lg mr-2">🎾</span>
              <span className="font-semibold">KSA 위닝샷 챔피언십 {currentYear}</span>
            </p>
          </div>
          <div className="text-gray-500 text-sm">
            <p>© {currentYear} KSA Tennis Tournament. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 