import React, { useState } from 'react';

interface Organization {
    id: string;
    name: string;
    type?: 'pro' | 'agri';
}

interface ManageOrganizationsModalProps {
    organizations: Organization[];
    onClose: () => void;
    onAddOrganization: (name: string, type: 'pro' | 'agri') => void;
    onUpdateOrganization: (id: string, name: string, type: 'pro' | 'agri') => void;
    onDeleteOrganization: (id: string) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 6 9 17l-5-5" /></svg>
);

const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
);

const ManageOrganizationsModal: React.FC<ManageOrganizationsModalProps> = ({
    organizations,
    onClose,
    onAddOrganization,
    onUpdateOrganization,
    onDeleteOrganization
}) => {
    const [newOrgName, setNewOrgName] = useState('');
    const [newOrgType, setNewOrgType] = useState<'pro' | 'agri'>('pro');
    const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
    const [editingOrgName, setEditingOrgName] = useState('');
    const [editingOrgType, setEditingOrgType] = useState<'pro' | 'agri'>('pro');

    const handleAddOrg = (e: React.FormEvent) => {
        e.preventDefault();
        if (newOrgName.trim()) {
            onAddOrganization(newOrgName.trim(), newOrgType);
            setNewOrgName('');
            setNewOrgType('pro');
        }
    };

    const handleStartEdit = (org: Organization) => {
        setEditingOrgId(org.id);
        setEditingOrgName(org.name);
        setEditingOrgType(org.type || 'pro');
    };

    const handleCancelEdit = () => {
        setEditingOrgId(null);
        setEditingOrgName('');
        setEditingOrgType('pro');
    };

    const handleUpdateOrg = (id: string) => {
        if (editingOrgName.trim()) {
            onUpdateOrganization(id, editingOrgName.trim(), editingOrgType);
            handleCancelEdit();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-3xl m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Manage Organizations</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Add New Organization Form */}
                <form onSubmit={handleAddOrg} className="mb-6 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Create New Organization</h3>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newOrgName}
                            onChange={(e) => setNewOrgName(e.target.value)}
                            placeholder="Organization Name"
                            className="flex-grow bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
                            required
                        />
                        <select
                            value={newOrgType}
                            onChange={(e) => setNewOrgType(e.target.value as 'pro' | 'agri')}
                            className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2.5"
                        >
                            <option value="pro">Professional</option>
                            <option value="agri">Agriculture</option>
                        </select>
                        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg">
                            Create
                        </button>
                    </div>
                </form>

                {/* Organizations List */}
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-400 uppercase bg-zinc-800/50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Organization Name</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.map((org) => {
                                const isEditing = editingOrgId === org.id;

                                return (
                                    <tr key={org.id} className="border-b border-zinc-800">
                                        <td className="px-6 py-4 font-medium text-white">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editingOrgName}
                                                    onChange={(e) => setEditingOrgName(e.target.value)}
                                                    className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-1.5 w-full"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleUpdateOrg(org.id);
                                                        if (e.key === 'Escape') handleCancelEdit();
                                                    }}
                                                />
                                            ) : (
                                                org.name
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <select
                                                    value={editingOrgType}
                                                    onChange={(e) => setEditingOrgType(e.target.value as 'pro' | 'agri')}
                                                    className="bg-zinc-900 border border-zinc-700 text-white text-xs rounded-lg focus:ring-purple-500 focus:border-purple-500 p-1.5"
                                                >
                                                    <option value="pro">Professional</option>
                                                    <option value="agri">Agriculture</option>
                                                </select>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs uppercase">
                                                    {org.type || 'pro'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateOrg(org.id)}
                                                            className="text-green-400 hover:text-green-300 p-1"
                                                            title="Save changes"
                                                        >
                                                            <CheckIcon className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="text-red-400 hover:text-red-300 p-1"
                                                            title="Cancel editing"
                                                        >
                                                            <XCircleIcon className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleStartEdit(org)}
                                                            className="text-zinc-400 hover:text-purple-400 p-1"
                                                            title="Edit organization"
                                                        >
                                                            <EditIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Are you sure you want to delete "${org.name}"?`)) {
                                                                    onDeleteOrganization(org.id);
                                                                }
                                                            }}
                                                            className="text-zinc-400 hover:text-red-500 p-1"
                                                            title="Delete organization"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
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

export default ManageOrganizationsModal;
