import React, { useState } from 'react';

interface Department {
    id: string;
    name: string;
    organization_id: string;
}

interface Organization {
    id: string;
    name: string;
}

interface ManageDepartmentsModalProps {
    departments: Department[];
    organizations: Organization[];
    selectedOrgId: string | null;
    onClose: () => void;
    onAddDepartment: (name: string, orgId: string) => void;
    onUpdateDepartment: (id: string, name: string, orgId: string) => void;
    onDeleteDepartment: (id: string) => void;
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

const ManageDepartmentsModal: React.FC<ManageDepartmentsModalProps> = ({
    departments,
    organizations,
    selectedOrgId,
    onClose,
    onAddDepartment,
    onUpdateDepartment,
    onDeleteDepartment
}) => {
    const [newDeptName, setNewDeptName] = useState('');
    const [newDeptOrgId, setNewDeptOrgId] = useState(selectedOrgId || organizations[0]?.id || '');
    const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
    const [editingDeptName, setEditingDeptName] = useState('');
    const [editingDeptOrgId, setEditingDeptOrgId] = useState('');

    const handleAddDept = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDeptName.trim() && newDeptOrgId) {
            onAddDepartment(newDeptName.trim(), newDeptOrgId);
            setNewDeptName('');
            setNewDeptOrgId(selectedOrgId || organizations[0]?.id || '');
        }
    };

    const handleStartEdit = (dept: Department) => {
        setEditingDeptId(dept.id);
        setEditingDeptName(dept.name);
        setEditingDeptOrgId(dept.organization_id);
    };

    const handleCancelEdit = () => {
        setEditingDeptId(null);
        setEditingDeptName('');
        setEditingDeptOrgId('');
    };

    const handleUpdateDept = (id: string) => {
        if (editingDeptName.trim() && editingDeptOrgId) {
            onUpdateDepartment(id, editingDeptName.trim(), editingDeptOrgId);
            handleCancelEdit();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-3xl m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Manage Departments</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Add New Department Form */}
                <form onSubmit={handleAddDept} className="mb-6 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Create New Department</h3>
                    <div className="flex gap-3">
                        <select
                            value={newDeptOrgId}
                            onChange={(e) => setNewDeptOrgId(e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                            required
                        >
                            <option value="" disabled>Select Organization</option>
                            {organizations.map(org => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                            placeholder="Department Name"
                            className="flex-grow bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                            required
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg">
                            Create
                        </button>
                    </div>
                </form>

                {/* Departments List */}
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-400 uppercase bg-zinc-800/50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Organization</th>
                                <th scope="col" className="px-6 py-3">Department Name</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments
                                .sort((a, b) => {
                                    const orgA = organizations.find(o => o.id === a.organization_id)?.name || '';
                                    const orgB = organizations.find(o => o.id === b.organization_id)?.name || '';
                                    return orgA.localeCompare(orgB);
                                })
                                .map((dept) => {
                                    const isEditing = editingDeptId === dept.id;
                                    const orgName = organizations.find(o => o.id === dept.organization_id)?.name || 'Unknown';

                                    return (
                                        <tr key={dept.id} className="border-b border-zinc-800">
                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <select
                                                        value={editingDeptOrgId}
                                                        onChange={(e) => setEditingDeptOrgId(e.target.value)}
                                                        className="bg-zinc-900 border border-zinc-700 text-white text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5"
                                                    >
                                                        {organizations.map(org => (
                                                            <option key={org.id} value={org.id}>{org.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-white text-xs">
                                                        {orgName}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editingDeptName}
                                                        onChange={(e) => setEditingDeptName(e.target.value)}
                                                        className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5 w-full"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleUpdateDept(dept.id);
                                                            if (e.key === 'Escape') handleCancelEdit();
                                                        }}
                                                    />
                                                ) : (
                                                    dept.name
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateDept(dept.id)}
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
                                                                onClick={() => handleStartEdit(dept)}
                                                                className="text-zinc-400 hover:text-blue-400 p-1"
                                                                title="Edit department"
                                                            >
                                                                <EditIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Are you sure you want to delete "${dept.name}"?`)) {
                                                                        onDeleteDepartment(dept.id);
                                                                    }
                                                                }}
                                                                className="text-zinc-400 hover:text-red-500 p-1"
                                                                title="Delete department"
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

export default ManageDepartmentsModal;
