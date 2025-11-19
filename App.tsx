import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hub from './components/Hub';
import { supabase } from './lib/supabaseClient'; 
import AuthPage from './components/AuthPage'; 

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check for existing session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Handle Login
  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Welcome back to Flowgent." };
  };

  // 3. Handle Register
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
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-zinc-500">Loading Flowgent...</div>;
  }

  // 4. If not logged in, show AuthPage
  if (!session) {
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  // 5. If logged in, show the Hub
  return (
    <div className="bg-[#121212] min-h-screen text-gray-200 antialiased selection:bg-cyan-500/30">
      <Header 
        user={session.user} 
        companyName="Quantra" 
        onLogout={handleLogout} 
      />
      <Hub />
    </div>
  );
};

export default App;