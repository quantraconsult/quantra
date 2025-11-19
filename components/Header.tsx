import React from 'react';
import { LogoutIcon } from './Icons';
import { FlowgentLogo } from './Logo';

interface HeaderProps {
  user?: { email?: string; user_metadata?: { full_name?: string } };
  companyName?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-[#121212] border-b border-zinc-800 sticky top-0 z-50">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <FlowgentLogo />
            </a>
            
            <div className="h-8 w-px bg-zinc-700 hidden sm:block"></div>
            
            <div className="hidden sm:flex flex-col justify-center">
              {/* STANDARD STYLE: text-xs text-zinc-500 */}
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">App</span>
              <span className="text-sm font-bold text-zinc-200">Hub</span>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-end hidden sm:flex">
                 <span className="text-sm font-medium text-zinc-200">
                    {user.user_metadata?.full_name || user.email}
                 </span>
                 <span className="text-xs text-zinc-500">Administrator</span>
              </div>
              
              <button
                onClick={onLogout}
                aria-label="Log out"
                className="p-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors border border-transparent hover:border-zinc-700"
              >
                <LogoutIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;