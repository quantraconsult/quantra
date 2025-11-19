import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import ManageUsersModal from './modals/ManageUsersModal';
import ManageProjectsModal from './modals/ManageProjectsModal';
import EditUserModal from './modals/EditUserModal';

// Simple Icons for the Admin Cards
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const ProjectsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;

const AdminView: React.FC<{ currentUser: any }> = ({ currentUser }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [activeModal, setActiveModal] = useState<'users' | 'projects' | 'editUser' | null>(null);
    const [userToEdit, setUserToEdit] = useState<any>(null);

    const fetchData = async () => {
        const { data: u } = await supabase.from('users').select('*').order('name');
        const { data: p } = await supabase.from('projects').select('*').order('sorting');
        if (u) setUsers(u);
        if (p) setProjects(p);
    };

    useEffect(() => { fetchData(); }, []);

    // --- User Handlers ---
    const handleApproveUser = async (id: string) => {
        await supabase.from('users').update({ status: 'approved' }).eq('id', id);
        fetchData();
    };
    const handleDeleteUser = async (id: string) => {
        if (confirm('Are you sure? This will remove their access.')) {
            await supabase.from('users').delete().eq('id', id);
            fetchData();
        }
    };
    const handleUpdateUser = async (updatedUser: any) => {
        await supabase.from('users').update({ name: updatedUser.name, email: updatedUser.email, is_admin: updatedUser.is_admin }).eq('id', updatedUser.id);
        fetchData();
        setActiveModal('users'); // Go back to list
    };

    // --- Project Handlers ---
    const handleAddProject = async (name: string) => {
        const maxSort = projects.reduce((max, p) => Math.max(max, p.sorting), 0);
        await supabase.from('projects').insert({ name, sorting: maxSort + 1 });
        fetchData();
    };
    const handleDeleteProject = async (id: string) => {
         await supabase.from('projects').delete().eq('id', id);
         fetchData();
    };
    const handleUpdateProjectName = async (id: string, name: string) => {
        await supabase.from('projects').update({ name }).eq('id', id);
        fetchData();
    };
    const handleReorderProject = async (id: string, direction: 'up' | 'down') => {
        // (Simplified reorder logic for brevity, ideally copy full logic from Planner)
        const idx = projects.findIndex(p => p.id === id);
        if (idx === -1) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (projects[swapIdx]) {
            const p1 = projects[idx];
            const p2 = projects[swapIdx];
            await supabase.from('projects').update({ sorting: p2.sorting }).eq('id', p1.id);
            await supabase.from('projects').update({ sorting: p1.sorting }).eq('id', p2.id);
            fetchData();
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <h2 className="text-3xl font-bold text-white mb-2">Admin Console</h2>
            <p className="text-zinc-400 mb-8">Manage your workspace resources and access.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manage Users Card */}
                <div 
                    onClick={() => setActiveModal('users')}
                    className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-cyan-500/50 cursor-pointer transition-all group"
                >
                    <div className="bg-zinc-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-900/30 group-hover:text-cyan-400 text-zinc-400 transition-colors">
                        <UsersIcon />
                    </div>
                    <h3 className="text-xl font-bold text-white">Manage Users</h3>
                    <p className="text-sm text-zinc-500 mt-1">{users.length} active users</p>
                </div>

                {/* Manage Projects Card */}
                <div 
                    onClick={() => setActiveModal('projects')}
                    className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-cyan-500/50 cursor-pointer transition-all group"
                >
                     <div className="bg-zinc-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-900/30 group-hover:text-cyan-400 text-zinc-400 transition-colors">
                        <ProjectsIcon />
                    </div>
                    <h3 className="text-xl font-bold text-white">Manage Projects</h3>
                    <p className="text-sm text-zinc-500 mt-1">{projects.length} active projects</p>
                </div>
            </div>

            {/* MODALS */}
            {activeModal === 'users' && (
                <ManageUsersModal 
                    users={users}
                    onClose={() => setActiveModal(null)}
                    onApproveUser={handleApproveUser}
                    onDeleteUser={handleDeleteUser}
                    onEditUser={(u) => { setUserToEdit(u); setActiveModal('editUser'); }}
                    currentUser={currentUser}
                    tasks={[]} // Pass empty if not needed for delete validation in Hub
                />
            )}
            {activeModal === 'projects' && (
                <ManageProjectsModal
                    items={projects}
                    onClose={() => setActiveModal(null)}
                    onAddItem={handleAddProject}
                    onRemoveItem={handleDeleteProject}
                    onReorderItem={handleReorderProject}
                    onUpdateItemName={handleUpdateProjectName}
                    tasks={[]} completedTasks={[]} // Pass empty for validation check skip
                />
            )}
             {activeModal === 'editUser' && userToEdit && (
                <EditUserModal
                    user={userToEdit}
                    onClose={() => setActiveModal('users')}
                    onSave={handleUpdateUser}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
};

export default AdminView;