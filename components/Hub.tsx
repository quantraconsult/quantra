import React, { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, ShieldCheckIcon, BookIcon } from './Icons';
import { Organization, Department, Project } from '../types';

interface HubProps {
  companyName: string;
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
  userOrgs: Organization[];
  departments: Department[];
  projects: Project[];
}

const Hub: React.FC<HubProps> = ({ companyName, isAdmin, onAdminClick, onLogout, userOrgs, departments, projects }) => {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Auto-select first org
  useEffect(() => {
    if (userOrgs.length > 0 && !selectedOrgId) {
      setSelectedOrgId(userOrgs[0].id);
    }
  }, [userOrgs, selectedOrgId]);

  const currentDepts = selectedOrgId
    ? departments.filter(d => d.organization_id === selectedOrgId)
    : [];

  const hasAgri = userOrgs.some(org => org.type === 'agri');
  const hasPro = userOrgs.some(org => org.type === 'pro' || !org.type);

  return (
    <div className="h-[calc(100vh-64px)] flex bg-[#121212]">

      {/* Left Sidebar - App Links */}
      <div className="w-96 border-r border-zinc-800 flex flex-col bg-zinc-900/30 p-8">
        <div className="flex flex-col gap-5">
          {hasPro && (
            <>
              <a
                href="https://planner.quantra.co.za"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-5 px-8 py-5 rounded-xl text-zinc-200 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 group border border-zinc-700 hover:border-cyan-500/40 shadow-lg hover:shadow-cyan-900/20"
              >
                <CalendarIcon className="w-7 h-7" />
                <span className="text-xl font-bold">Planner</span>
              </a>
              <a
                href="https://timesheets.quantra.co.za"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-5 px-8 py-5 rounded-xl text-zinc-200 hover:text-orange-400 hover:bg-orange-500/10 transition-all duration-200 group border border-zinc-700 hover:border-orange-500/40 shadow-lg hover:shadow-orange-900/20"
              >
                <ClockIcon className="w-7 h-7" />
                <span className="text-xl font-bold">Timesheets</span>
              </a>
            </>
          )}
          <a
            href="https://farm-diary-one.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-5 px-8 py-5 rounded-xl text-zinc-200 hover:text-green-400 hover:bg-green-500/10 transition-all duration-200 group border border-zinc-700 hover:border-green-500/40 shadow-lg hover:shadow-green-900/20"
          >
            <BookIcon className="w-7 h-7" />
            <span className="text-xl font-bold">Daily Diary</span>
          </a>
          {isAdmin && (
            <button
              onClick={onAdminClick}
              className="flex items-center gap-5 px-8 py-5 rounded-xl text-zinc-200 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group border border-zinc-700 hover:border-red-500/40 shadow-lg hover:shadow-red-900/20 text-left"
            >
              <ShieldCheckIcon className="w-7 h-7" />
              <span className="text-xl font-bold">Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Side - Organizations & Departments (Information Only) */}
      <div className="flex-1 p-8 overflow-y-auto flex justify-end">
        <div className="w-80">
          {/* Organizations Section */}
          <div className="mb-6">
            <div className="flex flex-col justify-center mb-3">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Organisations</span>
            </div>
            <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-2">
              {userOrgs.map(org => (
                <button
                  key={org.id}
                  onClick={() => setSelectedOrgId(org.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between group text-sm
                    ${selectedOrgId === org.id
                      ? 'bg-purple-500/10 border border-purple-500/30'
                      : 'hover:bg-zinc-800/50 border border-transparent'}`}
                >
                  <span className="text-white text-xs">{org.name}</span>
                  {selectedOrgId === org.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Departments Section */}
          <div>
            <div className="flex flex-col justify-center mb-3">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Departments</span>
            </div>
            {currentDepts.length === 0 ? (
              <div className="text-zinc-600 text-xs italic">No departments found.</div>
            ) : (
              <div className="space-y-1.5">
                {currentDepts.map(dept => (
                  <div
                    key={dept.id}
                    className="px-3 py-2 rounded-lg bg-zinc-800/20 border border-zinc-800/50 text-sm"
                  >
                    <span className="text-white text-xs">{dept.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Hub;