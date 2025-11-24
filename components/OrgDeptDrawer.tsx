import React from 'react';

interface Organization {
    id: string;
    name: string;
    type?: 'agri' | 'pro';
}

interface Department {
    id: string;
    name: string;
    organization_id: string;
}

interface OrgDeptDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    organizations: Organization[];
    departments: Department[];
    selectedOrgId: string | null;
    onSelectOrg: (orgId: string) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

const OrgDeptDrawer: React.FC<OrgDeptDrawerProps> = ({
    isOpen,
    onClose,
    organizations,
    departments,
    selectedOrgId,
    onSelectOrg
}) => {
    const currentDepts = selectedOrgId
        ? departments.filter(d => d.organization_id === selectedOrgId)
        : [];

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-[#121212] border-l border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-bold text-white">Select Context</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto h-[calc(100%-64px)]">
                    {/* Organizations */}
                    <div className="mb-6">
                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-3">
                            Organisations
                        </span>
                        <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-2">
                            {organizations.map(org => (
                                <button
                                    key={org.id}
                                    onClick={() => onSelectOrg(org.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between group text-sm
                                        ${selectedOrgId === org.id
                                            ? 'bg-purple-500/10 border border-purple-500/30'
                                            : 'hover:bg-zinc-800/50 border border-transparent'}`}
                                >
                                    <span className="text-white text-xs">{org.name}</span>
                                    {selectedOrgId === org.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Departments */}
                    <div>
                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-3">
                            Departments
                        </span>
                        {currentDepts.length === 0 ? (
                            <div className="text-zinc-600 text-xs italic">
                                {selectedOrgId ? 'No departments found.' : 'Select an organization first.'}
                            </div>
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
                </div>
            </div>
        </>
    );
};

export default OrgDeptDrawer;
