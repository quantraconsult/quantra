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
    const [mobileView, setMobileView] = useState<'menu' | 'content'>('menu'); // New state for mobile navigation
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [userOrgs, setUserOrgs] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    // Selection states
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

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

        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
    };

    useEffect(() => { fetchData(); }, [currentUser]);

    // Derived state
    const currentDepts = selectedOrgId
        ? departments.filter(d => d.organization_id === selectedOrgId)
        : [];

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

    return (
        <div className="h-[calc(100vh-64px)] flex bg-[#121212]">
            {/* Left Sidebar - Admin Navigation (Desktop) */}
            <div className="hidden md:flex w-96 border-r border-zinc-800 flex-col bg-zinc-900/30 p-8">
                <div className="flex flex-col gap-5">
                    <button
                        onClick={() => setActiveTab('orgs')}
                        className={`flex items-center gap-5 px-8 py-5 rounded-xl transition-all duration-200 group border shadow-lg text-left
                            ${activeTab === 'orgs'
                                ? 'text-purple-400 bg-purple-500/10 border-purple-500/40 shadow-purple-900/20'
                                : 'text-zinc-200 hover:text-purple-400 hover:bg-purple-500/10 border-zinc-700 hover:border-purple-500/40 hover:shadow-purple-900/20'}`}
                    >
                        <OrgIcon className="w-7 h-7" />
                        <span className="text-xl font-bold">Organisations</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('depts')}
                        className={`flex items-center gap-5 px-8 py-5 rounded-xl transition-all duration-200 group border shadow-lg text-left
                            ${activeTab === 'depts'
                                ? 'text-blue-400 bg-blue-500/10 border-blue-500/40 shadow-blue-900/20'
                                : 'text-zinc-200 hover:text-blue-400 hover:bg-blue-500/10 border-zinc-700 hover:border-blue-500/40 hover:shadow-blue-900/20'}`}
                    >
                        <DeptIcon className="w-7 h-7" />
                        <span className="text-xl font-bold">Departments</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-5 px-8 py-5 rounded-xl transition-all duration-200 group border shadow-lg text-left
                            ${activeTab === 'users'
                                ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/40 shadow-cyan-900/20'
                                : 'text-zinc-200 hover:text-cyan-400 hover:bg-cyan-500/10 border-zinc-700 hover:border-cyan-500/40 hover:shadow-cyan-900/20'}`}
                    >
                        <UsersIcon className="w-7 h-7" />
                        <span className="text-xl font-bold">Users</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`flex items-center gap-5 px-8 py-5 rounded-xl transition-all duration-200 group border shadow-lg text-left
                            ${activeTab === 'projects'
                                ? 'text-orange-400 bg-orange-500/10 border-orange-500/40 shadow-orange-900/20'
                                : 'text-zinc-200 hover:text-orange-400 hover:bg-orange-500/10 border-zinc-700 hover:border-orange-500/40 hover:shadow-orange-900/20'}`}
                    >
                        <ProjectsIcon className="w-7 h-7" />
                        <span className="text-xl font-bold">Projects</span>
                    </button>
                </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col md:items-end">

                {/* Mobile Navigation Buttons (Only visible when mobileView is 'menu') */}
                <div className={`md:hidden w-full grid grid-cols-1 gap-3 mb-8 ${mobileView === 'content' ? 'hidden' : ''}`}>
                    <button
                        onClick={() => handleMobileNavClick('orgs')}
                        className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 border shadow-lg text-left border-zinc-700 text-zinc-200 bg-zinc-900/50"
                    >
                        <OrgIcon className="w-6 h-6" />
                        <span className="text-lg font-bold">Organisations</span>
                    </button>

                    <button
                        onClick={() => handleMobileNavClick('depts')}
                        className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 border shadow-lg text-left border-zinc-700 text-zinc-200 bg-zinc-900/50"
                    >
                        <DeptIcon className="w-6 h-6" />
                        <span className="text-lg font-bold">Departments</span>
                    </button>

                    <button
                        onClick={() => handleMobileNavClick('users')}
                        className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 border shadow-lg text-left border-zinc-700 text-zinc-200 bg-zinc-900/50"
                    >
                        <UsersIcon className="w-6 h-6" />
                        <span className="text-lg font-bold">Users</span>
                    </button>

                    <button
                        onClick={() => handleMobileNavClick('projects')}
                        className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 border shadow-lg text-left border-zinc-700 text-zinc-200 bg-zinc-900/50"
                    >
                        <ProjectsIcon className="w-6 h-6" />
                        <span className="text-lg font-bold">Projects</span>
                    </button>
                </div>

                {/* Content Container (Hidden on mobile unless mobileView is 'content') */}
                <div className={`w-full md:w-80 ${mobileView === 'menu' ? 'hidden md:block' : ''}`}>

                    {/* Mobile Back Button */}
                    <div className="md:hidden mb-4">
                        <button
                            onClick={() => setMobileView('menu')}
                            className="flex items-center gap-2 text-zinc-400 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            <span className="text-sm font-bold">Back to Menu</span>
                        </button>
                    </div>

                    {/* ORGANISATIONS TAB */}
                    {activeTab === 'orgs' && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Organisations</span>
                                <button
                                    onClick={() => setActiveModal('orgs')}
                                    className="text-xs text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider"
                                >
                                    Manage
                                </button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto space-y-1.5 pr-2">
                                {userOrgs.map(org => (
                                    <div
                                        key={org.id}
                                        className="w-full text-left px-3 py-2 rounded-lg bg-zinc-800/20 border border-zinc-800/50 flex items-center justify-between group text-sm"
                                    >
                                        <span className="text-white text-xs">{org.name}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase">{org.type || 'pro'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* DEPARTMENTS TAB */}
                    {activeTab === 'depts' && (
                        <>
                            {/* Select Org Section */}
                            <div className="mb-6">
                                <div className="flex flex-col justify-center mb-3">
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Select Organisation</span>
                                </div>
                                <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-2">
                                    {userOrgs.map(org => (
                                        <button
                                            key={org.id}
                                            onClick={() => setSelectedOrgId(org.id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between group text-sm
                                                ${selectedOrgId === org.id
                                                    ? 'bg-blue-500/10 border border-blue-500/30'
                                                    : 'hover:bg-zinc-800/50 border border-transparent'}`}
                                        >
                                            <span className="text-white text-xs">{org.name}</span>
                                            {selectedOrgId === org.id && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Departments List */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Departments</span>
                                    <button
                                        onClick={() => setActiveModal('depts')}
                                        className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider"
                                    >
                                        Manage
                                    </button>
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
                        </>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Users</span>
                                <button
                                    onClick={() => setActiveModal('users')}
                                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider"
                                >
                                    Manage
                                </button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto space-y-1.5 pr-2">
                                {users.map(user => (
                                    <div
                                        key={user.id}
                                        className="px-3 py-2 rounded-lg bg-zinc-800/20 border border-zinc-800/50 text-sm flex justify-between items-center"
                                    >
                                        <span className="text-white text-xs">{user.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${user.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                            {user.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PROJECTS TAB */}
                    {activeTab === 'projects' && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Projects</span>
                                <button
                                    onClick={() => setActiveModal('projects')}
                                    className="text-xs text-orange-400 hover:text-orange-300 font-bold uppercase tracking-wider"
                                >
                                    Manage
                                </button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto space-y-1.5 pr-2">
                                {projects.map(proj => (
                                    <div
                                        key={proj.id}
                                        className="px-3 py-2 rounded-lg bg-zinc-800/20 border border-zinc-800/50 text-sm"
                                    >
                                        <span className="text-white text-xs">{proj.name}</span>
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
                    onAddDepartment={handleAddDept}
                    onUpdateDepartment={handleUpdateDept}
                    onDeleteDepartment={handleDeleteDept}
                />
            )}
            {activeModal === 'users' && (
                <ManageUsersModal
                    users={users}
                    onClose={() => setActiveModal(null)}
                    onApproveUser={async (id) => { await supabase.from('users').update({ status: 'approved' }).eq('id', id); fetchData(); }}
                    onDeleteUser={async (id) => { if (confirm('Sure?')) { await supabase.from('users').delete().eq('id', id); fetchData(); } }}
                    onEditUser={(u) => { setUserToEdit(u); setActiveModal('editUser'); }}
                    onAddMember={async (email, orgId) => { /* Implement invite logic */ }}
                    currentUser={currentUser}
                    tasks={[]}
                    organizations={userOrgs}
                />
            )}
            {activeModal === 'projects' && (
                <ManageProjectsModal
                    items={projects}
                    onClose={() => setActiveModal(null)}
                    onAddItem={async (name) => { /* Implement add logic */ }}
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