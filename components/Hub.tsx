import React from 'react';
import NavLink from './NavLink';
import { CalendarIcon, ClockIcon, ShieldCheckIcon, LogoutIcon } from './Icons';
import { FlowgentLogo } from './Logo';

const Hub: React.FC = () => {
    return (
        <div className="flex flex-col" style={{minHeight: 'calc(100vh - 80px)'}}>
            <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
                <div className="bg-zinc-800/[.65] border border-zinc-700/50 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-5xl mx-auto p-8 sm:p-12 lg:p-16">
                    <div className="w-full mx-auto flex flex-col items-center text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-300 mb-2">
                            Welcome to
                        </h1>
                        <FlowgentLogo className="w-64 sm:w-80 h-auto mb-10 sm:mb-16" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                            <NavLink
                                title="Planner"
                                href="https://planner.quantra.co.za"
                                icon={<CalendarIcon className="w-6 h-6" />}
                            />

                            <NavLink 
                                title="Timesheets" 
                                href="https://timesheets.quantra.co.za" 
                                icon={<ClockIcon className="w-6 h-6" />} 
                            />
                            
                            <NavLink title="Admin" href="#" icon={<ShieldCheckIcon className="w-6 h-6" />} />
                            <NavLink title="Logout" href="#" icon={<LogoutIcon className="w-6 h-6" />} />
                        </div>
                    </div>
                </div>
            </main>
            <footer className="w-full text-center py-6 text-gray-500 text-sm">
                Flowgent, 2025
            </footer>
        </div>
    );
};

export default Hub;