import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UsersIcon, ProjectsIcon, BookIcon, OrgIcon, DeptIcon } from './Icons';
import ManageUsersModal from './modals/ManageUsersModal';
import ManageProjectsModal from './modals/ManageProjectsModal';
import EditUserModal from './modals/EditUserModal';

const AdminView: React.FC<{ currentUser: any }> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<'orgs' | 'depts' | 'users' | 'projects'>('orgs');
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [userOrgs, setUserOrgs] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    // Selection states
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

    // Modals
    const [activeModal, setActiveModal] = useState<'users' | 'projects' | 'editUser' | 'addOrg' | 'addDept' | null>(null);
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

    // Handlers (Placeholders for now, will implement logic)
    const handleAddOrg = async (name: string, type: 'pro' | 'agri') => {
        const { data, error } = await supabase.from('organizations').insert({ name, type }).select().single();
        if (error) alert("Error adding org: " + error.message);
        else {
            // Add creator as admin
            await supabase.from('organization_members').insert({ organization_id: data.id, user_id: currentUser.id, role: 'admin' });
            fetchData();
            setActiveModal(null);
        }
    };

    const handleAddDept = async (name: string, orgId: string) => {
        const { error } = await supabase.from('departments').insert({ name, organization_id: orgId });
        if (error) alert("Error adding dept: " + error.message);
        else {
            fetchData();
            setActiveModal(null);
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex bg-[#121212]">
            {/* Left Sidebar - Admin Navigation */}
            <div className="w-96 border-r border-zinc-800 flex flex-col bg-zinc-900/30 p-8">
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
            <div className="flex-1 p-8 overflow-y-auto flex justify-end">
                <div className="w-80">

                    {/* ORGANISATIONS TAB */}
                    {activeTab === 'orgs' && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Organisations</span>
                                <button
                                    onClick={() => setActiveModal('addOrg')}
                                    className="text-xs text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider"
                                >
                                    + Add
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
                                    {selectedOrgId && (
                                        <button
                                            onClick={() => setActiveModal('addDept')}
                                            className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider"
                                        >
                                            + Add
                                        </button>
                                    )}
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

            {/* Add Org Modal */}
            {activeModal === 'addOrg' && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-6">Add Organisation</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleAddOrg(formData.get('name') as string, formData.get('type') as 'pro' | 'agri');
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Name</label>
                                    <input name="name" required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="Organization Name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Type</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                                            <input type="radio" name="type" value="pro" defaultChecked className="accent-purple-500" />
                                            Professional
                                        </label>
                                        <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                                            <input type="radio" name="type" value="agri" className="accent-purple-500" />
                                            Agriculture
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Dept Modal */}
            {activeModal === 'addDept' && selectedOrgId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-6">Add Department</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleAddDept(formData.get('name') as string, formData.get('orgId') as string);
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Organization</label>
                                    <select
                                        name="orgId"
                                        defaultValue={selectedOrgId}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        {userOrgs.map(org => (
                                            <option key={org.id} value={org.id}>{org.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Department Name</label>
                                    <input name="name" required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Engineering" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;