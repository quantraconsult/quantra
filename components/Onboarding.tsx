import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FlogentLogo } from './Logo';

interface OnboardingProps {
    userId: string;
    onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ userId, onComplete }) => {
    const [orgName, setOrgName] = useState('');
    const [orgType, setOrgType] = useState<'pro' | 'agri'>('pro');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // 1. Create Organization
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .insert({ name: orgName, type: orgType }) // Ensure 'type' column exists in DB
                .select()
                .single();

            if (orgError) throw orgError;

            // 2. Add User as Admin
            const { error: memberError } = await supabase
                .from('organization_members')
                .insert({
                    organization_id: org.id,
                    user_id: userId,
                    role: 'admin' // or 'owner' depending on your schema
                });

            if (memberError) throw memberError;

            // 3. Complete
            onComplete();
        } catch (err: any) {
            console.error("Error creating organization:", err);
            setError(err.message || "Failed to create organization.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] flex flex-col justify-center items-center p-4 text-gray-200">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <FlogentLogo className="scale-125" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2 text-white">Welcome to Flogent</h2>
                <p className="text-center text-gray-400 mb-8">Let's get you set up. Create a new organization to get started.</p>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-8">
                    <form onSubmit={handleCreateOrg} className="space-y-6">
                        <div>
                            <label htmlFor="orgName" className="block text-sm font-medium text-gray-400">Organization Name</label>
                            <input
                                id="orgName"
                                type="text"
                                required
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                placeholder="e.g. Acme Corp, Sunny Farm"
                                className="mt-1 block w-full px-3 py-2 bg-black border border-zinc-700 rounded-md text-sm shadow-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Organization Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setOrgType('pro')}
                                    className={`p-4 rounded-lg border text-center transition-all ${orgType === 'pro'
                                            ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400'
                                            : 'bg-black border-zinc-700 text-gray-400 hover:border-zinc-600'
                                        }`}
                                >
                                    <div className="font-semibold mb-1">Flogent Pro</div>
                                    <div className="text-xs opacity-70">Project Management & Timesheets</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOrgType('agri')}
                                    className={`p-4 rounded-lg border text-center transition-all ${orgType === 'agri'
                                            ? 'bg-green-900/20 border-green-500 text-green-400'
                                            : 'bg-black border-zinc-700 text-gray-400 hover:border-zinc-600'
                                        }`}
                                >
                                    <div className="font-semibold mb-1">Flogent Agri</div>
                                    <div className="text-xs opacity-70">Farm Diary & Management</div>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-md text-sm bg-red-900/30 text-red-300 border border-red-800">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Organization'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
                        <p className="text-sm text-gray-500">
                            Have an invite code? <button className="text-cyan-500 hover:text-cyan-400 font-medium">Join existing organization</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
