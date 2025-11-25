import React, { useState } from 'react';
import Tooltip from '../Tooltip';

interface User { id: string; name: string; email: string; status: 'pending' | 'approved'; is_admin: boolean; }
interface Organization { id: string; name: string; type?: 'pro' | 'agri'; }
interface Department { id: string; name: string; organization_id: string; }
interface OrgMember { user_id: string; organization_id: string; }

interface ManageUsersModalProps {
  users: User[];
  onClose: () => void;
  onApproveUser: (userId: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onAddMember: (email: string, organizationId: string, departmentId?: string) => void;
  tasks: any[];
  currentUser: User;
  organizations: Organization[];
  departments?: Department[];
  deptMembers?: any[];
  orgMembers?: OrgMember[];
  onAssignDept?: (userId: string, deptId: string) => void;
  onRemoveDept?: (userId: string, deptId: string) => void;
}

// ICONS
const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="overflow-visible" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="overflow-visible" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="overflow-visible" {...props}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);

const ManageUsersModal: React.FC<ManageUsersModalProps> = ({ users, onClose, onApproveUser, onEditUser, onDeleteUser, onAddMember, currentUser, organizations, departments = [], deptMembers = [], orgMembers = [], onAssignDept, onRemoveDept }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>(organizations[0]?.id || '');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberEmail.trim() && selectedOrgId) {
      onAddMember(newMemberEmail.trim(), selectedOrgId, selectedDeptId || undefined);
      setNewMemberEmail('');
      setIsAdding(false);
    }
  };

  const getOrgDepts = (orgId: string) => departments.filter(d => d.organization_id === orgId);
  const getUserOrgs = (userId: string) => {
    if (!orgMembers) return [];
    const memberEntries = orgMembers.filter(om => om.user_id === userId);
    return memberEntries.map(om => organizations.find(o => o.id === om.organization_id)).filter(Boolean) as Organization[];
  };
  const getUserDeptsInOrg = (userId: string, orgId: string) => {
    return deptMembers.filter(dm => dm.user_id === userId).map(dm => departments.find(d => d.id === dm.department_id && d.organization_id === orgId)).filter(Boolean) as Department[];
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh]">

        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Manage Users</h2>
            <p className="text-sm text-zinc-400">Control access and permissions for your workspace.</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors"
            >
              <PlusIcon className="w-4 h-4" /> Add Existing User by Email
            </button>
          ) : (
            <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-4 items-end bg-zinc-800/30 p-4 rounded-xl border border-zinc-700/50">
              <div className="flex-grow w-full">
                <label className="block text-xs text-zinc-500 mb-1 font-medium uppercase tracking-wider">User Email</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 placeholder-zinc-600"
                  required
                />
              </div>
              <div className="w-full sm:w-1/4">
                <label className="block text-xs text-zinc-500 mb-1 font-medium uppercase tracking-wider">Organization</label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => { setSelectedOrgId(e.target.value); setSelectedDeptId(''); }}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-2.5"
                  required
                >
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-1/4">
                <label className="block text-xs text-zinc-500 mb-1 font-medium uppercase tracking-wider">Department (Optional)</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-2.5"
                >
                  <option value="">None</option>
                  {getOrgDepts(selectedOrgId).map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-cyan-900/20"
                >
                  Add Member
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="overflow-auto flex-grow p-6">
          <table className="w-full text-sm text-left text-zinc-400">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-800/50 border-b border-zinc-700">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">Name</th>
                <th scope="col" className="px-6 py-4 font-bold">Email</th>
                <th scope="col" className="px-6 py-4 font-bold">Organizations & Departments</th>
                <th scope="col" className="px-6 py-4 font-bold">Status</th>
                <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map(user => {
                const userOrgs = getUserOrgs(user.id);

                return (
                  <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-200 align-top">
                      {user.name}
                      {user.is_admin && <span className="ml-2 text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-bold uppercase">Admin</span>}
                    </td>
                    <td className="px-6 py-4 align-top">{user.email}</td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-3">
                        {userOrgs.length > 0 ? userOrgs.map(org => {
                          const deptsInOrg = getUserDeptsInOrg(user.id, org.id);
                          return (
                            <div key={org.id} className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-200 font-semibold text-xs bg-zinc-800 px-2 py-1 rounded border border-zinc-700">{org.name}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 pl-2 border-l-2 border-zinc-800 ml-1">
                                {deptsInOrg.length > 0 ? deptsInOrg.map(d => (
                                  <span key={d.id} className="text-[10px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">
                                    {d.name}
                                  </span>
                                )) : <span className="text-zinc-600 italic text-[10px] px-1.5">No Dept</span>}
                              </div>
                            </div>
                          );
                        }) : <span className="text-zinc-600 italic">No Organizations</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${user.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="flex items-center justify-end gap-3">
                        {user.status === 'pending' ? (
                          <button
                            onClick={() => onApproveUser(user.id)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1.5 px-4 text-xs rounded-lg transition-colors shadow-lg shadow-cyan-900/20"
                          >
                            Approve Access
                          </button>
                        ) : (
                          <>
                            <Tooltip text="Edit User">
                              <button
                                onClick={() => onEditUser(user)}
                                className="text-zinc-400 hover:text-cyan-400 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersModal;