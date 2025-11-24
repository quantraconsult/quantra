import React from 'react';
import { OrgIcon, DeptIcon, UsersIcon, ProjectsIcon } from './Icons';

interface AdminNavDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: 'orgs' | 'depts' | 'users' | 'projects';
    onTabSelect: (tab: 'orgs' | 'depts' | 'users' | 'projects') => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

const AdminNavDrawer: React.FC<AdminNavDrawerProps> = ({ isOpen, onClose, activeTab, onTabSelect }) => {
    const handleTabClick = (tab: 'orgs' | 'depts' | 'users' | 'projects') => {
        onTabSelect(tab);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-[#121212] border-l border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-bold text-white">Admin Sections</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="p-6 flex flex-col gap-4">
                    <button
                        onClick={() => handleTabClick('orgs')}
                        className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 text-left ${activeTab === 'orgs'
                                ? 'bg-purple-500/10 border border-purple-500/40 text-purple-400 shadow-lg shadow-purple-900/20'
                                : 'border border-zinc-700 text-zinc-200 hover:bg-zinc-800/50'
                            }`}
                    >
                        <OrgIcon className="w-6 h-6" />
                        <span className="text-lg font-bold">Organisations</span>
                    </button>

                    <button
                        onClick={() => handleTabClick('depts')}
                        className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 text-left ${activeTab === 'depts'
                                ? 'bg-blue-500/10 border border-blue-500/40 text-blue-400 shadow-lg shadow-blue-900/20'
                                : 'border border-zinc-700 text-zinc-200 hover:bg-zinc-800/50'
                            }`}
                    >
                        <DeptIcon className="w-6 h-6" />
                        <span className="text-lg font-bold">Departments</span>
                    </button>

                    <button
                        onClick={() => handleTabClick('users')}
                        className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 text-left ${activeTab === 'users'
                                ? 'bg-green-500/10 border border-green-500/40 text-green-400 shadow-lg shadow-green-900/20'
                                : 'border border-zinc-700 text-zinc-200 hover:bg-zinc-800/50'
                            }`}
                    >
                        <UsersIcon className="w-6 h-6" />
                        <span className="text-lg font-bold">Users</span>
                    </button>

                    <button
                        onClick={() => handleTabClick('projects')}
                        className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 text-left ${activeTab === 'projects'
                                ? 'bg-orange-500/10 border border-orange-500/40 text-orange-400 shadow-lg shadow-orange-900/20'
                                : 'border border-zinc-700 text-zinc-200 hover:bg-zinc-800/50'
                            }`}
                    >
                        <ProjectsIcon className="w-6 h-6" />
                        <span className="text-lg font-bold">Projects</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminNavDrawer;
