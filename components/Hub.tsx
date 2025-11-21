import React from 'react';
import { CalendarIcon, ClockIcon, ShieldCheckIcon, LogoutIcon } from './Icons';
import { FlowgentLogo } from './Logo';

interface HubProps {
  companyName: string;
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
}

const MobileAppRow: React.FC<{
  title: string;
  desc: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
}> = ({ title, desc, href, onClick, icon }) => {
  const Wrapper = href ? 'a' : 'div';
  return (
    <Wrapper
      href={href}
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl active:bg-zinc-800 transition-colors cursor-pointer"
    >
      <div className="p-2.5 rounded-lg bg-zinc-800 text-zinc-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-white truncate">{title}</h3>
        <p className="text-xs text-zinc-500 truncate">{desc}</p>
      </div>
      <div className="text-zinc-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
      </div>
    </Wrapper>
  )
}

const AppCard: React.FC<{
  title: string;
  desc: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  primary?: boolean
}> = ({ title, desc, href, onClick, icon, primary }) => {
  const Wrapper = href ? 'a' : 'div';

  return (
    <Wrapper
      href={href}
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer
        ${primary
          ? 'bg-zinc-900 border-zinc-800 hover:border-cyan-500/30 hover:shadow-cyan-900/10'
          : 'bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${primary ? 'bg-cyan-500/10 text-cyan-400' : 'bg-zinc-800 text-zinc-400'} group-hover:scale-105 transition-transform duration-300`}>
          {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
        </div>
        {primary && (
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
        )}
      </div>
      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
    </Wrapper>
  );
};

const Hub: React.FC<HubProps> = ({ companyName, isAdmin, onAdminClick, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#121212]">
      {/* HEADER (Matches Planner App) */}
      <header className="bg-primary border-b border-border-color sticky top-0 z-50 mb-8">
        <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-20 py-4 md:py-0 gap-4">
            <div className="w-full md:w-auto flex justify-between items-center">
              <div className="flex items-center gap-6">
                <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <FlowgentLogo className="scale-90 sm:scale-100 origin-left" />
                </a>

                {/* Mobile Workspace Text */}
                <div className="md:hidden flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest leading-none mb-0.5">Workspace</span>
                  <span className="text-xs font-bold text-text-primary leading-none">Quantra Hub</span>
                </div>

                <div className="h-8 w-px bg-border-color hidden sm:block"></div>
                <div className="hidden sm:flex flex-col justify-center">
                  <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">App</span>
                  <span className="text-sm font-bold text-text-primary">Hub</span>
                </div>
              </div>

              <div className="md:hidden">
                <button onClick={onLogout} className="text-text-secondary hover:text-red-400 transition-colors p-2">
                  <LogoutIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={onLogout} className="text-text-secondary hover:text-red-400 transition-colors flex items-center gap-2" title="Logout">
                  <span className="text-sm font-medium text-text-primary hidden sm:block">{companyName}</span>
                  <LogoutIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 md:py-20">

        {/* Desktop Header (Welcome Message) */}
        <div className="hidden md:block text-center mb-10 max-w-2xl">
          <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2 block">Workspace Dashboard</span>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">{companyName}</span>
          </h1>
          <p className="text-zinc-500 text-base">
            Select a module below to manage your projects, track time, or configure your workspace settings.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 gap-4 w-full max-w-3xl">
          <AppCard
            title="Project Planner"
            desc="Manage tasks & deadlines."
            href="https://planner.quantra.co.za"
            icon={<CalendarIcon />}
            primary={true}
          />
          <AppCard
            title="Timesheets"
            desc="Log hours & travel."
            href="https://timesheets.quantra.co.za"
            icon={<ClockIcon />}
            primary={true}
          />
          {isAdmin && (
            <AppCard
              title="Admin Console"
              desc="Manage users & settings."
              onClick={onAdminClick}
              icon={<ShieldCheckIcon />}
            />
          )}
          <AppCard
            title="Sign Out"
            desc="Log out of your account."
            onClick={onLogout}
            icon={<LogoutIcon />}
          />
        </div>

        {/* Mobile List */}
        <div className="md:hidden w-full flex flex-col gap-3 mt-6">
          <MobileAppRow
            title="Project Planner"
            desc="Tasks & Deadlines"
            href="https://planner.quantra.co.za"
            icon={<CalendarIcon className="w-5 h-5" />}
          />
          <MobileAppRow
            title="Timesheets"
            desc="Hours & Travel"
            href="https://timesheets.quantra.co.za"
            icon={<ClockIcon className="w-5 h-5" />}
          />
          {isAdmin && (
            <MobileAppRow
              title="Admin Console"
              desc="Users & Settings"
              onClick={onAdminClick}
              icon={<ShieldCheckIcon className="w-5 h-5" />}
            />
          )}
          <MobileAppRow
            title="Sign Out"
            desc="End Session"
            onClick={onLogout}
            icon={<LogoutIcon className="w-5 h-5" />}
          />
        </div>
      </div>

      <footer className="py-6 text-center text-zinc-700 text-xs">
        Flowgent v1.0 &bull; Secure Workspace
      </footer>
    </div>
  );
};

export default Hub;