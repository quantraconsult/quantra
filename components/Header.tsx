import React from 'react';
import { LogoutIcon } from './Icons';
import { FlogentLogo } from './Logo';

interface HeaderProps {
  userName?: string;
  email?: string;
  companyName?: string;
  isAdmin?: boolean;
  onLogout?: () => void;
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, email, companyName = "Quantra", isAdmin, onLogout, onLogoClick }) => {
  return (
    <header className="bg-[#121212] border-b border-zinc-800 sticky top-0 z-50">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* LEFT: Branding */}
          <div className="flex items-center gap-6">
            <button onClick={onLogoClick} className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none">
              <FlogentLogo />
            </button>

            <div className="h-8 w-px bg-zinc-700 hidden sm:block"></div>

            <div className="hidden sm:flex flex-col justify-center">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">App</span>
              <span className="text-sm font-bold text-zinc-200">Hub</span>
            </div>
          </div>

          {/* RIGHT: User Profile */}
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-medium text-zinc-200">
                {userName || email}
              </span>
              {isAdmin && (
                <span className="text-xs text-cyan-500 font-semibold">Administrator</span>
              )}
            </div>

            <button
              onClick={onLogout}
              aria-label="Log out"
              className="p-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors border border-transparent hover:border-zinc-700"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;