
import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
  currentUser: User;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave, currentUser }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isAdmin, setIsAdmin] = useState(user.is_admin || false);
  
  const isEditingSelf = currentUser.id === user.id;

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setIsAdmin(user.is_admin || false);
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...user,
      name,
      email,
      is_admin: isAdmin,
    };
    onSave(updatedUser);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-secondary rounded-lg shadow-xl p-8 w-full max-w-lg m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Edit User</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-text-secondary">Full Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-primary border border-border-color text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5" required />
          </div>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-text-secondary">Email Address</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-primary border border-border-color text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5" required />
             <p className="text-xs text-text-secondary mt-1">Note: Changing a user's email requires verification and is best done via Supabase dashboard.</p>
          </div>
          
          <div className="flex items-center">
             <input
              id="isAdmin"
              type="checkbox"
              className="w-4 h-4 text-accent bg-primary border-border-color rounded focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              disabled={isEditingSelf}
            />
            <label htmlFor="isAdmin" className={`ml-2 text-sm font-medium ${isEditingSelf ? 'text-gray-500' : 'text-text-secondary'}`}>
              Set as Administrator
            </label>
          </div>
           {isEditingSelf && <p className="text-xs text-yellow-400">You cannot remove your own admin status.</p>}


          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-secondary hover:bg-border-color text-text-primary font-bold py-2 px-4 rounded-lg mr-2 transition duration-200">Cancel</button>
            <button type="submit" className="bg-accent hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;