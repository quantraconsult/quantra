import React, { useState, useEffect } from 'react';
import { User, Organization, Department } from '../../types';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
  currentUser: User;
  organizations?: Organization[];
  departments?: Department[];
  orgMembers?: any[];
  deptMembers?: any[];
  onAssignOrg?: (userId: string, orgId: string) => void;
  onRemoveOrg?: (userId: string, orgId: string) => void;
  onAssignDept?: (userId: string, deptId: string) => void;
  onRemoveDept?: (userId: string, deptId: string) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
);

const EditUserModal: React.FC<EditUserModalProps> = ({
  user, onClose, onSave, currentUser,
  organizations = [], departments = [], orgMembers = [], deptMembers = [],
  onAssignOrg, onRemoveOrg, onAssignDept, onRemoveDept
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isAdmin, setIsAdmin] = useState(user.is_admin || false);

  const isEditingSelf = currentUser.id === user.id;

  // Derived state
  const userOrgIds = orgMembers.filter(om => om.user_id === user.id).map(om => om.organization_id);
  const userCurrentOrgs = organizations.filter(org => userOrgIds.includes(org.id));
  const availableOrgs = organizations.filter(org => !userOrgIds.includes(org.id));

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setIsAdmin(user.is_admin || false);
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...user, name, email, is_admin: isAdmin });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-zinc-800">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-100">Edit User Profile</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Compact Basic Info Ribbon */}
            <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2"
                  required
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2"
                  required
                />
              </div>
              <div className="flex items-center h-full pt-5">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox" className="sr-only peer"
                    checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)}
                    disabled={isEditingSelf}
                  />
                  <div className="relative w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  <span className="ms-3 text-sm font-medium text-zinc-300">Admin Access</span>
                </label>
              </div>
            </div>

            {/* Hierarchical Organization & Department Management */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-zinc-200">Organization Access</h3>

                {/* Add Organization Dropdown */}
                {onAssignOrg && availableOrgs.length > 0 && (
                  <div className="relative group">
                    <select
                      className="appearance-none bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold py-2 pl-4 pr-8 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                      onChange={(e) => {
                        if (e.target.value) {
                          onAssignOrg(user.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>+ Add Organization</option>
                      {availableOrgs.map(org => (
                        <option key={org.id} value={org.id} className="bg-zinc-800 text-zinc-200">{org.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {userCurrentOrgs.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">
                    No organizations assigned. Add one to get started.
                  </div>
                ) : (
                  userCurrentOrgs.map(org => {
                    // Get departments for this specific org
                    const orgDepts = departments.filter(d => d.organization_id === org.id);
                    // Get user's current departments in this org
                    const userOrgDeptIds = deptMembers.filter(dm => dm.user_id === user.id).map(dm => dm.department_id);
                    const userAssignedDepts = orgDepts.filter(d => userOrgDeptIds.includes(d.id));
                    const availableOrgDepts = orgDepts.filter(d => !userOrgDeptIds.includes(d.id));

                    return (
                      <div key={org.id} className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
                        {/* Org Header */}
                        <div className="bg-zinc-800/50 px-4 py-3 flex justify-between items-center border-b border-zinc-700">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>
                            </div>
                            <h4 className="font-bold text-zinc-200">{org.name}</h4>
                          </div>
                          {onRemoveOrg && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove user from ${org.name}? This will also remove them from all departments in this organization.`)) {
                                  onRemoveOrg(user.id, org.id);
                                }
                              }}
                              className="text-zinc-500 hover:text-red-400 p-2 transition-colors"
                              title="Remove from Organization"
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </div>

                        {/* Depts Body */}
                        <div className="p-4 bg-zinc-900">
                          <div className="mb-2 flex justify-between items-end">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Departments</label>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {userAssignedDepts.length > 0 ? userAssignedDepts.map(dept => (
                              <span key={dept.id} className="group flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-sm transition-all hover:bg-blue-500/20">
                                {dept.name}
                                {onRemoveDept && (
                                  <button
                                    type="button"
                                    onClick={() => onRemoveDept(user.id, dept.id)}
                                    className="text-blue-400/50 hover:text-blue-300 transition-colors"
                                  >
                                    ×
                                  </button>
                                )}
                              </span>
                            )) : (
                              <span className="text-zinc-600 text-sm italic py-1">No specific departments assigned.</span>
                            )}

                            {/* Add Dept Button/Select */}
                            {onAssignDept && availableOrgDepts.length > 0 && (
                              <div className="relative">
                                <select
                                  className="appearance-none bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm border border-zinc-700 rounded-lg py-1.5 pl-3 pr-8 cursor-pointer transition-colors focus:outline-none focus:border-blue-500"
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      onAssignDept(user.id, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                  defaultValue=""
                                >
                                  <option value="" disabled>+ Add Dept</option>
                                  {availableOrgDepts.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors font-medium">
            Cancel
          </button>
          <button
            type="submit"
            form="edit-user-form"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-purple-900/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;