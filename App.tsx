import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hub from './components/Hub';
import AdminView from './components/AdminView';
import Onboarding from './components/Onboarding';
import { supabase } from './lib/supabaseClient';
import AuthPage from './components/AuthPage';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userOrgs, setUserOrgs] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'hub' | 'admin' | 'onboarding'>('hub');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch Profile
      const { data: profile } = await supabase.from('users').select('*').eq('id', userId).single();
      if (profile) setUserProfile(profile);

      // 2. Fetch Organizations
      const { data: orgMembers } = await supabase
        .from('organization_members')
        .select('organization_id, organizations(*)')
        .eq('user_id', userId);

      const orgs = orgMembers?.map((m: any) => m.organizations) || [];
      setUserOrgs(orgs);

      // 3. Determine View
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
        setCurrentView('hub'); // Reset to default, though AuthPage will show
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
      // Manually insert into public.users to ensure profile exists
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        name: name,
        email: email,
        status: 'pending', // Default status
        is_admin: false
      });
      if (profileError) {
        console.error("Error creating user profile:", profileError);
        // Don't fail the whole registration, but log it. 
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

  return (
    <div className="bg-[#121212] min-h-screen text-gray-200 antialiased selection:bg-cyan-500/30">
      <Header
        userName={userProfile?.name}
        email={session.user.email}
        isAdmin={userProfile?.is_admin}
        onLogout={handleLogout}
        onLogoClick={() => setCurrentView('hub')}
      />

      {currentView === 'admin' && userProfile?.is_admin ? (
        <AdminView currentUser={userProfile} />
      ) : (
        <Hub
          companyName="Quantra"
          isAdmin={userProfile?.is_admin}
          onAdminClick={() => setCurrentView('admin')}
          onLogout={handleLogout}
          userOrgs={userOrgs} // Pass orgs to Hub
        />
      )}
    </div>
  );
};

export default App;