import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hub from './components/Hub';
import AdminView from './components/AdminView';
import Onboarding from './components/Onboarding';
import { supabase } from './lib/supabaseClient';
import AuthPage from './components/AuthPage';
import type { Session } from '@supabase/supabase-js';
import type { Organization, Department, Project } from './types';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  status: string;
}

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userOrgs, setUserOrgs] = useState<Organization[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<'hub' | 'admin' | 'onboarding'>('hub');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const fetchUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data: profile } = await supabase.from('users').select('*').eq('id', userId).single();
      if (profile) setUserProfile(profile);

      const { data: orgMembers } = await supabase
        .from('organization_members')
        .select('organization_id, organizations(*)')
        .eq('user_id', userId);

      const orgs = orgMembers?.map((m: any) => m.organizations) || [];
      setUserOrgs(orgs);

      const { data: depts } = await supabase.from('departments').select('*');
      setDepartments(depts || []);

      const { data: projs } = await supabase.from('projects').select('*').order('sorting', { ascending: true });
      setProjects(projs || []);

      if (orgs.length === 0) {
        setCurrentView('onboarding');
      } else {
        setCurrentView('hub');
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchUserData(session.user.id);
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchUserData(session.user.id);
      else {
        setUserProfile(null);
        setUserOrgs([]);
        setCurrentView('hub');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Welcome back." };
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) return { success: false, message: error.message };

    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        name: name,
        email: email,
        status: 'approved',
        is_admin: false
      } as any);
      if (profileError) {
        console.error("Error creating user profile:", profileError);
      }
    }

    if (data.user && !data.session) {
      return { success: true, message: "Account created! Please check your email to confirm." };
    }

    return { success: true, message: "Account created! You can now sign in." };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('hub');
  };

  const handleOnboardingComplete = () => {
    if (session?.user) fetchUserData(session.user.id);
  };

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-zinc-500">Loading...</div>;

  if (!session) return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;

  if (currentView === 'onboarding') {
    return <Onboarding userId={session.user.id} onComplete={handleOnboardingComplete} />;
  }

  const currentOrgName = userOrgs.find(org => org.id === selectedOrgId)?.name;

  return (
    <div className="bg-[#121212] min-h-screen text-gray-200 antialiased selection:bg-cyan-500/30">
      <Header
        userName={userProfile?.name}
        email={session.user.email}
        isAdmin={userProfile?.is_admin}
        onLogout={handleLogout}
        onLogoClick={() => setCurrentView('hub')}
        currentOrgName={currentOrgName}
        onMenuClick={() => setIsDrawerOpen(true)}
      />

      {currentView === 'admin' && userProfile?.is_admin ? (
        <AdminView
          currentUser={userProfile}
          isDrawerOpen={isDrawerOpen}
          onCloseDrawer={() => setIsDrawerOpen(false)}
        />
      ) : (
        <Hub
          companyName="Quantra"
          isAdmin={userProfile?.is_admin}
          onAdminClick={() => setCurrentView('admin')}
          onLogout={handleLogout}
          userOrgs={userOrgs}
          departments={departments}
          projects={projects}
          isDrawerOpen={isDrawerOpen}
          onCloseDrawer={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default App;