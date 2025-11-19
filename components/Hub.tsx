import React from 'react';
import { CalendarIcon, ClockIcon, ShieldCheckIcon, LogoutIcon } from './Icons';

interface HubProps {
  companyName: string;
}

// A reusable "App Card" component for the new look
const AppCard: React.FC<{ 
  title: string; 
  desc: string; 
  href: string; 
  icon: React.ReactNode; 
  primary?: boolean 
}> = ({ title, desc, href, icon, primary }) => (
  <a
    href={href}
    className={`
      group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
      ${primary 
        ? 'bg-zinc-900 border-zinc-800 hover:border-cyan-500/50 hover:shadow-cyan-900/20' 
        : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'}
    `}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${primary ? 'bg-cyan-500/10 text-cyan-400' : 'bg-zinc-800 text-zinc-400'} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      {primary && (
        <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></span>
      )}
    </div>
    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{title}</h3>
    <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
  </a>
);

const Hub: React.FC<HubProps> = ({ companyName }) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 sm:px-8 py-12 md:py-20" style={{minHeight: 'calc(100vh - 80px)'}}>
      
      {/* 1. Hero Section: Text Only, No Huge Logo */}
      <div className="text-center mb-12 max-w-2xl">
        <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2 block">Workspace Dashboard</span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">{companyName}</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          Select a module below to manage your projects, track time, or configure your workspace settings.
        </p>
      </div>

      {/* 2. The Grid: App Cards instead of Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        {/* Planner Module */}
        <AppCard 
          title="Project Planner"
          desc="Manage tasks, assign team members, and track project deadlines efficiently."
          href="https://planner.quantra.co.za" 
          icon={<CalendarIcon className="w-8 h-8" />}
          primary={true}
        />

        {/* Timesheet Module */}
        <AppCard 
          title="Timesheets"
          desc="Log your daily hours, site visits, and travel claims for approval."
          href="https://timesheets.quantra.co.za" 
          icon={<ClockIcon className="w-8 h-8" />}
          primary={true}
        />

        {/* Admin (Secondary Style) */}
        <AppCard 
          title="Admin Console"
          desc="Manage users, permissions, and global workspace settings."
          href="#" 
          icon={<ShieldCheckIcon className="w-8 h-8" />}
        />

        {/* Logout (Secondary Style) */}
        <AppCard 
          title="Sign Out"
          desc="Securely log out of your Flowgent account."
          href="#" 
          icon={<LogoutIcon className="w-8 h-8" />}
        />
      </div>

      {/* Footer text moved inside the flex container */}
      <footer className="mt-16 text-center text-zinc-600 text-sm">
        Flowgent v1.0 &bull; Secure Workspace Environment
      </footer>
    </div>
  );
};

export default Hub;