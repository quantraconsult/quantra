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
  currentOrgName?: string;
  onMenuClick?: () => void;
}

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
);

const Header: React.FC<HeaderProps> = ({ userName, email, companyName = "Quantra", isAdmin, onLogout, onLogoClick, currentOrgName, onMenuClick }) => {
  return (
    <header className="bg-[#121212] border-b border-zinc-800 sticky top-0 z-50">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* LEFT: Branding + Org Name (mobile) */}
          <div className="flex items-center gap-4">
            <button onClick={onLogoClick} className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none">
              <FlogentLogo />
            </button>
            {currentOrgName && (
              <div className="md:hidden flex items-center gap-2">
                <div className="w-px h-6 bg-zinc-700"></div>
                <span className="text-sm text-white font-medium truncate max-w-[120px]">{currentOrgName}</span>
              </div>
            )}
          </div>

          {/* RIGHT: Hamburger (mobile) + User Profile */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu - Mobile Only */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                aria-label="Open menu"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            )}

            {/* User Profile */}
            <div className="flex items-center space-x-4">
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
      </div>
    </header>
  );
};

export default Header;