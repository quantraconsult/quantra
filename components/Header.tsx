import React from 'react';
import { LogoutIcon } from './Icons';
import { QuantraLogo } from './Logo';

const Header: React.FC = () => {
  return (
    <header className="bg-black shadow-lg sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <QuantraLogo className="h-9 w-auto" />
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:block text-gray-300">Welcome, Carel</span>
            <button
              aria-label="Log out"
              className="p-2 rounded-full text-gray-400 hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-indigo-500 transition-colors"
            >
              <LogoutIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
