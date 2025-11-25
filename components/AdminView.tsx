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
    const [orgMembers, setOrgMembers] = useState<any[]>([]); // New state for organization members

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

            // 6. Fetch Organization Members (New)
            const { data: om } = await supabase.from('organization_members').select('*');
            setOrgMembers(om || []);

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
        if (selectedOrgId) {
            const isInOrg = orgMembers.some(om => om.user_id === u.id && om.organization_id === selectedOrgId);
            if (!isInOrg) return false;
        }

        if (selectedDeptId) {
            return deptMembers.some(dm => dm.user_id === u.id && dm.department_id === selectedDeptId);
        }
        return true;
    });


    // Organization Handlers
    const handleAddOrg = async (name: string, type: 'pro' | 'agri') => {
        const { data, error } = await supabase.from('organizations').insert({ name, type } as any).select().single();
        if (error) alert("Error adding org: " + error.message);
        else {
            await supabase.from('organization_members').insert({ organization_id: data.id, user_id: currentUser.id, role: 'admin' } as any);
            fetchData();
        }
    };

    const handleUpdateOrg = async (id: string, name: string, type: 'pro' | 'agri') => {
        const { error } = await supabase.from('organizations').update({ name, type } as any).eq('id', id);
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
        const { error } = await supabase.from('departments').insert({ name, organization_id: orgId } as any);
        if (error) alert("Error adding dept: " + error.message);
        else fetchData();
    };

    const handleUpdateDept = async (id: string, name: string, orgId: string) => {
        const { error } = await supabase.from('departments').update({ name, organization_id: orgId } as any).eq('id', id);
        if (error) alert("Error updating dept: " + error.message);
        else fetchData();
    };

    const handleDeleteDept = async (id: string) => {
        const { error } = await supabase.from('departments').delete().eq('id', id);
        if (error) alert("Error deleting dept: " + error.message);
        else fetchData();
    };

    // User-Org Assignment Handlers
    const handleAssignOrg = async (userId: string, orgId: string) => {
        const { error } = await supabase.from('organization_members').insert({ user_id: userId, organization_id: orgId, role: 'member' } as any);
        if (error) alert("Error assigning user to organization: " + error.message);
        else fetchData();
    };

    const handleRemoveOrg = async (userId: string, orgId: string) => {
        const { error } = await supabase.from('organization_members').delete().match({ user_id: userId, organization_id: orgId } as any);
        if (error) alert("Error removing user from organization: " + error.message);
        else fetchData();
    };

    // User-Dept Assignment Handlers
    const handleAssignDept = async (userId: string, deptId: string) => {
        const { error } = await supabase.from('department_members').insert({ user_id: userId, department_id: deptId, role: 'member' } as any);
        if (error) alert("Error assigning user to department: " + error.message);
        else fetchData();
    };

    const handleRemoveDept = async (userId: string, deptId: string) => {
        const { error } = await supabase.from('department_members').delete().match({ user_id: userId, department_id: deptId } as any);
        if (error) alert("Error removing user from department: " + error.message);
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
                                <button
                                    onClick={() => setActiveModal('orgs')}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                    + Add Org
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {userOrgs.map(org => (
                                    <div key={org.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex justify-between items-center group hover:border-purple-500/50 transition-all">
                                        <div>
                                            <h3 className="font-bold text-lg text-zinc-200">{org.name}</h3>
                                            <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold">{org.type}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => {
                                                const newName = prompt("New name:", org.name);
                                                if (newName) handleUpdateOrg(org.id, newName, org.type);
                                            }} className="text-zinc-400 hover:text-white p-2">Edit</button>
                                            <button onClick={() => {
                                                if (confirm("Delete org?")) handleDeleteOrg(org.id);
                                            }} className="text-zinc-400 hover:text-red-400 p-2">Delete</button>
                                        </div>
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
                                <button
                                    onClick={() => setActiveModal('depts')}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                    + Add Dept
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {departments.map(dept => {
                                    const orgName = userOrgs.find(o => o.id === dept.organization_id)?.name || 'Unknown Org';
                                    return (
                                        <div key={dept.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex justify-between items-center group hover:border-blue-500/50 transition-all">
                                            <div>
                                                <h3 className="font-bold text-lg text-zinc-200">{dept.name}</h3>
                                                <span className="text-xs text-zinc-500">{orgName}</span>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => {
                                                    const newName = prompt("New name:", dept.name);
                                                    if (newName) handleUpdateDept(dept.id, newName, dept.organization_id);
                                                }} className="text-zinc-400 hover:text-white p-2">Edit</button>
                                                <button onClick={() => {
                                                    if (confirm("Delete dept?")) handleDeleteDept(dept.id);
                                                }} className="text-zinc-400 hover:text-red-400 p-2">Delete</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Users</h2>
                                <button
                                    onClick={() => setActiveModal('users')}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                    Manage Users
                                </button>
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-sm text-zinc-400">
                                    <thead className="bg-zinc-900 text-xs uppercase font-bold text-zinc-500">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-zinc-200">{user.name}</td>
                                                <td className="px-6 py-4">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${user.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => { setUserToEdit(user); setActiveModal('editUser'); }}
                                                        className="text-zinc-400 hover:text-cyan-400 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredUsers.length === 0 && (
                                    <div className="p-8 text-center text-zinc-500 italic">No users found in this selection.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PROJECTS TAB */}
                    {activeTab === 'projects' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Projects</h2>
                                <button
                                    onClick={() => setActiveModal('projects')}
                                    className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                    Manage Projects
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProjects.map(project => (
                                    <div key={project.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl hover:border-orange-500/50 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-zinc-200">{project.name}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${project.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 line-clamp-2 mb-4">{project.description || "No description"}</p>
                                        <div className="flex justify-between items-center text-xs text-zinc-600">
                                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* MODALS */}
                {activeModal === 'orgs' && (
                    <ManageOrganizationsModal
                        organizations={userOrgs}
                        onClose={() => setActiveModal(null)}
                        onAddOrg={handleAddOrg}
                        onUpdateOrg={handleUpdateOrg}
                        onDeleteOrg={handleDeleteOrg}
                    />
                )}

                {activeModal === 'depts' && (
                    <ManageDepartmentsModal
                        departments={departments}
                        organizations={userOrgs}
                        onClose={() => setActiveModal(null)}
                        onAddDept={handleAddDept}
                        onUpdateDept={handleUpdateDept}
                        onDeleteDept={handleDeleteDept}
                    />
                )}

                {activeModal === 'users' && (
                    <ManageUsersModal
                        users={users}
                        onClose={() => setActiveModal(null)}
                        onApproveUser={async (id) => { await supabase.from('users').update({ status: 'approved' } as any).eq('id', id); fetchData(); }}
                        onEditUser={(u) => { setUserToEdit(u); setActiveModal('editUser'); }}
                        onDeleteUser={async (id) => { await supabase.from('users').delete().eq('id', id); fetchData(); }}
                        onAddMember={async (email, orgId, deptId) => {
                            // 1. Check if user exists
                            const { data: existingUser } = await supabase.from('users').select('*').eq('email', email).single();
                            if (existingUser) {
                                await handleAssignOrg(existingUser.id, orgId);
                                if (deptId) await handleAssignDept(existingUser.id, deptId);
                            } else {
                                alert("User not found. They must sign up first.");
                            }
                        }}
                        tasks={[]}
                        currentUser={currentUser}
                        organizations={userOrgs}
                        departments={departments}
                        deptMembers={deptMembers}
                        orgMembers={orgMembers}
                        onAssignDept={handleAssignDept}
                        onRemoveDept={handleRemoveDept}
                    />
                )}

                {activeModal === 'projects' && (
                    <ManageProjectsModal
                        projects={projects}
                        organizations={userOrgs}
                        departments={departments}
                        onClose={() => setActiveModal(null)}
                        onAddProject={async (p) => { await supabase.from('projects').insert(p as any); fetchData(); }}
                        onUpdateProject={async (p) => { await supabase.from('projects').update(p as any).eq('id', p.id); fetchData(); }}
                        onDeleteProject={async (id) => { await supabase.from('projects').delete().eq('id', id); fetchData(); }}
                    />
                )}

                {activeModal === 'editUser' && userToEdit && (
                    <EditUserModal
                        user={userToEdit}
                        onClose={() => setActiveModal('users')}
                        onSave={async (u) => { await supabase.from('users').update({ name: u.name, email: u.email, is_admin: u.is_admin } as any).eq('id', u.id); fetchData(); setActiveModal('users'); }}
                        currentUser={currentUser}
                        organizations={userOrgs}
                        departments={departments}
                        orgMembers={orgMembers}
                        deptMembers={deptMembers}
                        onAssignOrg={handleAssignOrg}
                        onRemoveOrg={handleRemoveOrg}
                        onAssignDept={handleAssignDept}
                        onRemoveDept={handleRemoveDept}
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
        </div>
    );
};

export default AdminView;