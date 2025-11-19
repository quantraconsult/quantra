import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hub from './components/Hub';
import { supabase } from './lib/supabaseClient'; 
import AuthPage from './components/AuthPage'; 

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Helper to check admin status from the 'users' table
    const checkUserRole = async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setIsAdmin(data.is_admin);
      }
    };

    // 1. Check session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkUserRole(session.user.id);
      }
      setIsLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Welcome back to Flowgent." };
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Account created! Please check your email." };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-zinc-500">Loading Flowgent...</div>;
  }

  if (!session) {
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="bg-[#121212] min-h-screen text-gray-200 antialiased selection:bg-cyan-500/30">
      <Header 
        user={session.user} 
        companyName="Quantra" 
        onLogout={handleLogout} 
      />
      {/* Pass the isAdmin status to the Hub */}
      <Hub companyName="Quantra" isAdmin={isAdmin} />
    </div>
  );
};

export default App;