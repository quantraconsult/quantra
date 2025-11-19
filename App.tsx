import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hub from './components/Hub';
import AdminView from './components/AdminView'; // Import the new view
import { supabase } from './lib/supabaseClient'; 
import AuthPage from './components/AuthPage'; 

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null); // Store full DB profile
  const [currentView, setCurrentView] = useState<'hub' | 'admin'>('hub');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase.from('users').select('*').eq('id', userId).single();
      if (data) setUserProfile(data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else setUserProfile(null);
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
    // Create profile in 'users' table handled by trigger or manually here if needed
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Account created!" };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('hub');
  };

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-zinc-500">Loading...</div>;

  if (!session) return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;

  return (
    <div className="bg-[#121212] min-h-screen text-gray-200 antialiased selection:bg-cyan-500/30">
      <Header 
        userName={userProfile?.name} // Pass the real DB name
        email={session.user.email}
        isAdmin={userProfile?.is_admin}
        onLogout={handleLogout}
        onLogoClick={() => setCurrentView('hub')} // Logo goes home
      />
      
{/* Pass the isAdmin status to the Hub */}
      {currentView === 'admin' && userProfile?.is_admin ? (
        <AdminView currentUser={userProfile} />
      ) : (
        <Hub 
          companyName="Quantra" 
          isAdmin={userProfile?.is_admin} 
          onAdminClick={() => setCurrentView('admin')}
          onLogout={handleLogout} // <--- ADD THIS LINE
        />
      )}    </div>
  );
};

export default App;