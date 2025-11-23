import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import ManageUsersModal from './modals/ManageUsersModal';
import ManageProjectsModal from './modals/ManageProjectsModal';
import EditUserModal from './modals/EditUserModal';

// ICONS
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const ProjectsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
);

const AdminView: React.FC<{ currentUser: any }> = ({ currentUser }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [userOrgs, setUserOrgs] = useState<any[]>([]);
    const [activeModal, setActiveModal] = useState<'users' | 'projects' | 'editUser' | null>(null);
    const [userToEdit, setUserToEdit] = useState<any>(null);

    const fetchData = async () => {
        try {
            // 1. Fetch Organizations (All for Global Admin, Member Orgs for others)
            let myOrgs: any[] = [];
            if (currentUser.is_admin) {
                const { data: allOrgs } = await supabase.from('organizations').select('*').order('name');
                myOrgs = allOrgs || [];
            } else {
                const { data: orgMembers } = await supabase
                    .from('organization_members')
                    .select('organization_id, role, organizations(*)')
                    .eq('user_id', currentUser.id)
                    .in('role', ['admin', 'owner']);

                myOrgs = orgMembers?.map((m: any) => m.organizations) || [];
            }
            setUserOrgs(myOrgs);
            const orgIds = myOrgs.map(o => o.id);

            // 2. Fetch Users
            let usersData: any[] = [];
            if (currentUser.is_admin) {
                // Global admin sees all
                const { data } = await supabase.from('users').select('*').order('name');
                usersData = data || [];
            } else if (orgIds.length > 0) {
                // Org admin sees members of their orgs
                const { data } = await supabase
                    .from('organization_members')
                    .select('user_id, users(*)')
                    .in('organization_id', orgIds);

                const uniqueUsers = new Map();
                data?.forEach((item: any) => {
                    if (item.users) uniqueUsers.set(item.users.id, item.users);
                });
                usersData = Array.from(uniqueUsers.values());
            }
            setUsers(usersData.sort((a, b) => a.name.localeCompare(b.name)));

            // 3. Fetch Projects
            let projectsData: any[] = [];
            if (currentUser.is_admin) {
                const { data } = await supabase.from('projects').select('*').order('sorting');
                projectsData = data || [];
            } else if (orgIds.length > 0) {
                const { data } = await supabase.from('projects').select('*').in('organization_id', orgIds).order('sorting');
                projectsData = data || [];
            }
            setProjects(projectsData);

        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
    };

    useEffect(() => { fetchData(); }, [currentUser]);

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
        setActiveModal('users');
    };

    const handleAddMember = async (email: string, organizationId: string) => {
        const { data: user, error: userError } = await supabase.from('users').select('id').eq('email', email).single();
        if (userError || !user) {
            alert("User not found. Please ask them to register first.");
            return;
        }
        const { data: existingMember } = await supabase.from('organization_members').select('id').eq('organization_id', organizationId).eq('user_id', user.id).single();
        if (existingMember) {
            alert("User is already a member of this organization.");
            return;
        }
        const { error: insertError } = await supabase.from('organization_members').insert({ organization_id: organizationId, user_id: user.id, role: 'member' });
        if (insertError) {
            console.error("Error adding member:", insertError);
            alert("Failed to add member: " + insertError.message);
        } else {
            alert("Member added successfully!");
            await fetchData();
        }
    };

    const handleAddProject = async (name: string) => {
        // Default to first org if not specified (Modal needs updating to support org selection if multiple)
        // For now, if user has orgs, pick first. If global admin without orgs, this might fail or need 'organization_id'
        const orgId = userOrgs[0]?.id;
        if (!orgId && !currentUser.is_admin) {
            alert("No organization found to add project to.");
            return;
        }

        const maxSort = projects.reduce((max, p) => Math.max(max, p.sorting), 0);
        // If global admin, might need to prompt for org. 
        // Assuming ManageProjectsModal handles org selection or we default.
        // Current ManageProjectsModal in Hub is likely simple. 
        // We will just insert with orgId if available.

        const payload: any = { name, sorting: maxSort + 1 };
        if (orgId) payload.organization_id = orgId;

        await supabase.from('projects').insert(payload);
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
        <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-zinc-100 mb-2">Admin Console</h2>
                <p className="text-zinc-400">Manage your organization's users and project list.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manage Users Card */}
                <div
                    onClick={() => setActiveModal('users')}
                    className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-cyan-500/40 hover:bg-zinc-800/50 cursor-pointer transition-all group shadow-lg"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-zinc-800 p-3 rounded-xl group-hover:bg-cyan-500/10 group-hover:text-cyan-400 text-zinc-400 transition-colors">
                            <UsersIcon />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors">Users</h3>
                            <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{users.length} active</span>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">Add new team members, approve registrations, and manage permissions.</p>
                </div>

                {/* Manage Projects Card */}
                <div
                    onClick={() => setActiveModal('projects')}
                    className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-cyan-500/40 hover:bg-zinc-800/50 cursor-pointer transition-all group shadow-lg"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-zinc-800 p-3 rounded-xl group-hover:bg-cyan-500/10 group-hover:text-cyan-400 text-zinc-400 transition-colors">
                            <ProjectsIcon />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors">Projects</h3>
                            <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{projects.length} active</span>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">Create, rename, and reorder projects across the entire workspace.</p>
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
                    onAddMember={handleAddMember}
                    currentUser={currentUser}
                    tasks={[]}
                    organizations={userOrgs}
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
                    tasks={[]} completedTasks={[]}
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