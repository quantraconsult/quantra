

import React from 'react';
import { User, Task } from '../../types';
import Tooltip from '../Tooltip';

interface ManageUsersModalProps {
  users: User[];
  onClose: () => void;
  onApproveUser: (userId: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  tasks: Task[];
  currentUser: User;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

const ManageUsersModal: React.FC<ManageUsersModalProps> = ({ users, onClose, onApproveUser, onEditUser, onDeleteUser, tasks, currentUser }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-secondary rounded-lg shadow-xl p-6 w-full max-w-3xl m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary">Manage Users</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto pr-2">
          <table className="w-full text-sm text-left text-text-secondary">
            <thead className="text-xs text-text-secondary uppercase bg-primary sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const hasActiveTasks = tasks.some(task => task.assigned_to_id === user.id);
                const isCurrentUser = currentUser.id === user.id;
                const isDeletable = !hasActiveTasks && !isCurrentUser;

                const getDeleteTooltip = () => {
                    if (isCurrentUser) return "You cannot delete yourself.";
                    if (hasActiveTasks) return "Cannot delete user with active tasks.";
                    return "Delete user";
                };

                return (
                    <tr key={user.id} className="border-b border-border-color">
                    <td className="px-6 py-4 font-medium text-text-primary">{user.name}{user.is_admin && <span className="text-xs text-accent ml-2">(Admin)</span>}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'approved' ? 'bg-green-500/30 text-green-300' : 'bg-yellow-500/30 text-yellow-300'
                        }`}>
                        {user.status}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                        {user.status === 'pending' ? (
                            <button 
                            onClick={() => onApproveUser(user.id)}
                            className="bg-accent hover:bg-indigo-700 text-white font-bold py-1 px-3 text-xs rounded-md transition"
                            >
                            Approve
                            </button>
                        ) : (
                            <>
                              <Tooltip text="Edit user">
                                <button 
                                    onClick={() => onEditUser(user)}
                                    className="text-text-secondary hover:text-accent p-1"
                                >
                                    <EditIcon className="w-4 h-4" />
                                </button>
                              </Tooltip>
                              <Tooltip text={getDeleteTooltip()}>
                                <div>
                                    <button
                                        onClick={() => onDeleteUser(user.id)}
                                        disabled={!isDeletable}
                                        className="text-text-secondary p-1 disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:text-red-500"
                                    >
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                              </Tooltip>
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