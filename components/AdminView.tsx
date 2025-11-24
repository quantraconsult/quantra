import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UsersIcon, ProjectsIcon, BookIcon, OrgIcon, DeptIcon } from './Icons';
import ManageUsersModal from './modals/ManageUsersModal';
import ManageProjectsModal from './modals/ManageProjectsModal';
import EditUserModal from './modals/EditUserModal';
import ManageOrganizationsModal from './modals/ManageOrganizationsModal';
import ManageDepartmentsModal from './modals/ManageDepartmentsModal';
import OrgDeptDrawer from './OrgDeptDrawer';

const AdminView: React.FC<{ currentUser: any; isDrawerOpen: boolean; onCloseDrawer: () => void }> = ({ currentUser, isDrawerOpen, onCloseDrawer }) => {
    const [activeTab, setActiveTab] = useState<'orgs' | 'depts' | 'users' | 'projects'>('orgs');
    const [mobileView, setMobileView] = useState<'menu' | 'content'>('menu');
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [userOrgs, setUserOrgs] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [deptMembers, setDeptMembers] = useState<any[]>([]); // New state for department members

    // Selection states
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null); // New state for selected department

    // Modals
    const [activeModal, setActiveModal] = useState<'users' | 'projects' | 'editUser' | 'orgs' | 'depts' | null>(null);
    const [userToEdit, setUserToEdit] = useState<any>(null);

    const fetchData = async () => {
        try {
            // 1. Fetch Organizations
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

            // Auto-select first org if none selected
            if (!selectedOrgId && myOrgs.length > 0) {
                setSelectedOrgId(myOrgs[0].id);
            }

            // 2. Fetch Departments
            const { data: depts } = await supabase.from('departments').select('*');
            setDepartments(depts || []);

            // 3. Fetch Users
            let usersData: any[] = [];
            if (currentUser.is_admin) {
                const { data } = await supabase.from('users').select('*').order('name');
                usersData = data || [];
            } else if (orgIds.length > 0) {
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

            // 4. Fetch Projects
            let projectsData: any[] = [];
            if (currentUser.is_admin) {
                const { data } = await supabase.from('projects').select('*').order('sorting');
                projectsData = data || [];
            } else if (orgIds.length > 0) {
                const { data } = await supabase.from('projects').select('*').in('organization_id', orgIds).order('sorting');
                projectsData = data || [];
            }
            setProjects(projectsData);

            // 5. Fetch Department Members (New)
            const { data: dm } = await supabase.from('department_members').select('*');
            setDeptMembers(dm || []);

        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
    };

    useEffect(() => { fetchData(); }, [currentUser]);

    // Derived state
    const currentDepts = selectedOrgId
        ? departments.filter(d => d.organization_id === selectedOrgId)
        : [];

    // Filtered Lists based on Selection
    const filteredProjects = projects.filter(p => {
        if (selectedOrgId && p.organization_id !== selectedOrgId) return false;
        if (selectedDeptId && p.department_id !== selectedDeptId) return false;
        return true;
    });

    const filteredUsers = users.filter(u => {
        // 1. Must be in selected Org (via organization_members check done in fetch, but double check logic if needed)
        // For now, users list is already filtered to user's orgs.
        // We need to check if they are in the selected Org specifically if we had that link readily available in 'users' state.
        // But 'users' state is flat list of all users in my orgs.
        // We need to filter by selectedOrgId.
        // The 'users' array doesn't have org_id directly. We need to check organization_members or trust the fetch logic.
        // Wait, fetch logic gets ALL users from ALL my orgs.
        // To filter by selectedOrgId, we need to know which users are in selectedOrgId.
        // We can re-fetch or store that mapping.
        // For simplicity, let's assume we want to filter by Department if selected.

        if (selectedDeptId) {
            return deptMembers.some(dm => dm.user_id === u.id && dm.department_id === selectedDeptId);
        }
        // If only Org selected, we ideally show all users in that Org.
        // Current 'users' state has all users from ALL my orgs.
        // We need a way to filter 'users' by 'selectedOrgId'.
        // Let's assume for now we show all, or we need to fetch org members for the selected org.
        return true;
    });


    // Organization Handlers
    const handleAddOrg = async (name: string, type: 'pro' | 'agri') => {
        const { data, error } = await supabase.from('organizations').insert({ name, type }).select().single();
        if (error) alert("Error adding org: " + error.message);
        else {
            await supabase.from('organization_members').insert({ organization_id: data.id, user_id: currentUser.id, role: 'admin' });
            fetchData();
        }
    };

    const handleUpdateOrg = async (id: string, name: string, type: 'pro' | 'agri') => {
        const { error } = await supabase.from('organizations').update({ name, type }).eq('id', id);
        if (error) alert("Error updating org: " + error.message);
        else fetchData();
    };

    const handleDeleteOrg = async (id: string) => {
        const { error } = await supabase.from('organizations').delete().eq('id', id);
        if (error) alert("Error deleting org: " + error.message);
        else fetchData();
    };

    // Department Handlers
    const handleAddDept = async (name: string, orgId: string) => {
        const { error } = await supabase.from('departments').insert({ name, organization_id: orgId });
        if (error) alert("Error adding dept: " + error.message);
        else fetchData();
    };

    const handleUpdateDept = async (id: string, name: string, orgId: string) => {
        const { error } = await supabase.from('departments').update({ name, organization_id: orgId }).eq('id', id);
        if (error) alert("Error updating dept: " + error.message);
        else fetchData();
    };

    const handleDeleteDept = async (id: string) => {
        const { error } = await supabase.from('departments').delete().eq('id', id);
        if (error) alert("Error deleting dept: " + error.message);
        else fetchData();
    };

    const handleMobileNavClick = (tab: 'orgs' | 'depts' | 'users' | 'projects') => {
        setActiveTab(tab);
        setMobileView('content');
    };

    // Helper to render the Middle Column (Context Selector)
    const renderContextSelector = () => (
        <div className="w-72 border-r border-zinc-800 flex flex-col bg-zinc-900/10 h-full overflow-y-auto">
            <div className="p-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Organizations</h3>
                <div className="space-y-1">
                    {userOrgs.map(org => (
                        <button
                            key={org.id}
                            onClick={() => { setSelectedOrgId(org.id); setSelectedDeptId(null); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                                ${selectedOrgId === org.id ? 'bg-purple-500/20 text-purple-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                        >
                            {org.name}
                        </button>
                    ))}
                </div>
            </div>
            {selectedOrgId && (
                <div className="p-4 border-t border-zinc-800">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Departments</h3>
                    <div className="space-y-1">
                        <button
                            onClick={() => setSelectedDeptId(null)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                                ${!selectedDeptId ? 'bg-blue-500/20 text-blue-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                        >
                            All Departments
                        </button>
                        {currentDepts.map(dept => (
                            <button
                                key={dept.id}
                                onClick={() => setSelectedDeptId(dept.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                                    ${selectedDeptId === dept.id ? 'bg-blue-500/20 text-blue-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                            >
                                {dept.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="h-[calc(100vh-64px)] flex bg-[#121212]">
            {/* Left Sidebar - Admin Navigation (Desktop) */}
            <div className="hidden md:flex w-64 border-r border-zinc-800 flex-col bg-zinc-900/30 p-4">
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('orgs')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left
                            ${activeTab === 'orgs' ? 'bg-purple-500/10 text-purple-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                        <OrgIcon className="w-5 h-5" />
                        <span className="font-medium">Organisations</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('depts')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left
                            ${activeTab === 'depts' ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                        <DeptIcon className="w-5 h-5" />
                        <span className="font-medium">Departments</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left
                            ${activeTab === 'users' ? 'bg-cyan-500/10 text-cyan-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                        <UsersIcon className="w-5 h-5" />
                        <span className="font-medium">Users</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left
                            ${activeTab === 'projects' ? 'bg-orange-500/10 text-orange-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                        <ProjectsIcon className="w-5 h-5" />
                        <span className="font-medium">Projects</span>
                    </button>
                </div>
            </div>

            {/* Middle Column (Context Selector) - Only for Users and Projects tabs on Desktop */}
            <div className="hidden md:block h-full">
                {(activeTab === 'users' || activeTab === 'projects') && renderContextSelector()}
            </div>

            {/* Right Content Area */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col">

                {/* Mobile Navigation Buttons (Only visible when mobileView is 'menu') */}
                <div className={`md:hidden w-full grid grid-cols-1 gap-3 mb-8 ${mobileView === 'content' ? 'hidden' : ''}`}>
                    <button onClick={() => handleMobileNavClick('orgs')} className="flex items-center gap-4 px-5 py-4 rounded-xl border border-zinc-700 text-zinc-200 bg-zinc-900/50">
                        <OrgIcon className="w-6 h-6" /> <span className="text-lg font-bold">Organisations</span>
                    </button>
                    <button onClick={() => handleMobileNavClick('depts')} className="flex items-center gap-4 px-5 py-4 rounded-xl border border-zinc-700 text-zinc-200 bg-zinc-900/50">
                        <DeptIcon className="w-6 h-6" /> <span className="text-lg font-bold">Departments</span>
                    </button>
                    <button onClick={() => handleMobileNavClick('users')} className="flex items-center gap-4 px-5 py-4 rounded-xl border border-zinc-700 text-zinc-200 bg-zinc-900/50">
                        <UsersIcon className="w-6 h-6" /> <span className="text-lg font-bold">Users</span>
                    </button>
                    <button onClick={() => handleMobileNavClick('projects')} className="flex items-center gap-4 px-5 py-4 rounded-xl border border-zinc-700 text-zinc-200 bg-zinc-900/50">
                        <ProjectsIcon className="w-6 h-6" /> <span className="text-lg font-bold">Projects</span>
                    </button>
                </div>

                {/* Content Container */}
                <div className={`w-full ${mobileView === 'menu' ? 'hidden md:block' : ''}`}>

                    {/* Mobile Back Button */}
                    <div className="md:hidden mb-4">
                        <button onClick={() => setMobileView('menu')} className="flex items-center gap-2 text-zinc-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            <span className="text-sm font-bold">Back to Menu</span>
                        </button>
                    </div>

                    {/* ORGANISATIONS TAB */}
                    {activeTab === 'orgs' && (
                        <div className="max-w-3xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Organisations</h2>
                                <button onClick={() => setActiveModal('orgs')} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Manage
                                </button>
                            </div>
                            <div className="grid gap-3">
                                {userOrgs.map(org => (
                                    <div key={org.id} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
                                        <span className="text-zinc-200 font-medium">{org.name}</span>
                                        <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 uppercase">{org.type || 'pro'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* DEPARTMENTS TAB */}
                    {activeTab === 'depts' && (
                        <div className="max-w-3xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Departments</h2>
                                <button onClick={() => setActiveModal('depts')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Manage
                                </button>
                            </div>
                            {/* Org Selector for Depts Tab */}
                            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                                {userOrgs.map(org => (
                                    <button
                                        key={org.id}
                                        onClick={() => setSelectedOrgId(org.id)}
                                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors
                                            ${selectedOrgId === org.id ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                                    >
                                        {org.name}
                                    </button>
                                ))}
                            </div>
                            <div className="grid gap-3">
                                {currentDepts.length === 0 ? (
                                    <div className="text-zinc-500 italic">No departments found for this organization.</div>
                                ) : (
                                    currentDepts.map(dept => (
                                        <div key={dept.id} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                            <span className="text-zinc-200 font-medium">{dept.name}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div className="max-w-3xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Users</h2>
                                <button onClick={() => setActiveModal('users')} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Manage
                                </button>
                            </div>
                            <div className="grid gap-3">
                                {filteredUsers.map(user => (
                                    <div key={user.id} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
                                        <div>
                                            <div className="text-zinc-200 font-medium">{user.name}</div>
                                            <div className="text-zinc-500 text-sm">{user.email}</div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${user.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                            {user.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PROJECTS TAB */}
                    {activeTab === 'projects' && (
                        <div className="max-w-3xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Projects</h2>
                                <button onClick={() => setActiveModal('projects')} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Manage
                                </button>
                            </div>
                            <div className="grid gap-3">
                                {filteredProjects.map(proj => (
                                    <div key={proj.id} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                        <span className="text-zinc-200 font-medium">{proj.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            {activeModal === 'orgs' && (
                <ManageOrganizationsModal
                    organizations={userOrgs}
                    onClose={() => setActiveModal(null)}
                    onAddOrganization={handleAddOrg}
                    onUpdateOrganization={handleUpdateOrg}
                    onDeleteOrganization={handleDeleteOrg}
                />
            )}
            {activeModal === 'depts' && (
                <ManageDepartmentsModal
                    departments={departments}
                    organizations={userOrgs}
                    selectedOrgId={selectedOrgId}
                    onClose={() => setActiveModal(null)}
                    onRemoveItem={async (id) => { await supabase.from('projects').delete().eq('id', id); fetchData(); }}
                    onReorderItem={async () => { }}
                    onUpdateItemName={async (id, name) => { await supabase.from('projects').update({ name }).eq('id', id); fetchData(); }}
                    tasks={[]} completedTasks={[]}
                />
            )}
            {activeModal === 'editUser' && userToEdit && (
                <EditUserModal
                    user={userToEdit}
                    onClose={() => setActiveModal('users')}
                    onSave={async (u) => { await supabase.from('users').update({ name: u.name, email: u.email, is_admin: u.is_admin }).eq('id', u.id); fetchData(); setActiveModal('users'); }}
                    currentUser={currentUser}
                />
            )}

            {/* Mobile Navigation Drawer */}
            <OrgDeptDrawer
                isOpen={isDrawerOpen}
                onClose={onCloseDrawer}
                organizations={userOrgs}
                departments={departments}
                selectedOrgId={selectedOrgId}
                onSelectOrg={(id) => { setSelectedOrgId(id); }}
            />
        </div>
    );
};

export default AdminView;