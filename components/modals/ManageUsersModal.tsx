import React from 'react';
import Tooltip from '../Tooltip';

// Need to redefine basic types locally since we are in Hub context
interface User { id: string; name: string; email: string; status: 'pending' | 'approved'; is_admin: boolean; }

interface ManageUsersModalProps {
  users: User[];
  onClose: () => void;
  onApproveUser: (userId: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  tasks: any[]; // Kept for compatibility but unused
  currentUser: User;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

const ManageUsersModal: React.FC<ManageUsersModalProps> = ({ users, onClose, onApproveUser, onEditUser, onDeleteUser, currentUser }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      {/* CHANGED: max-w-6xl (Wider) */}
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

        <div className="overflow-auto flex-grow p-6">
          <table className="w-full text-sm text-left text-zinc-400">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-800/50 border-b border-zinc-700">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">Name</th>
                <th scope="col" className="px-6 py-4 font-bold">Email</th>
                <th scope="col" className="px-6 py-4 font-bold">Status</th>
                <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map(user => {
                const isCurrentUser = currentUser.id === user.id;
                
                return (
                    <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-200">
                        {user.name}
                        {user.is_admin && <span className="ml-2 text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-bold uppercase">Admin</span>}
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                        user.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                        {user.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
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
                                    <EditIcon className="w-5 h-5" />
                                </button>
                              </Tooltip>
                              
                              {!isCurrentUser && (
                                <Tooltip text="Remove User">
                                    <button
                                        onClick={() => onDeleteUser(user.id)}
                                        className="text-zinc-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-900/10 transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </Tooltip>
                              )}
                            </>
                        )}
                        </div>
                    </td>
                    </tr>
                )
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersModal;