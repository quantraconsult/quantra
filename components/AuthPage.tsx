import React, { useState } from 'react';
import { FlogentLogo } from './Logo';

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean, message: string }>;
  onRegister: (name: string, email: string, password: string) => Promise<{ success: boolean, message: string }>;
}

// ICONS
const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
);
const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);
const SproutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" /><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.2.4-4.8-.4-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.9Z" /><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2Z" /></svg>
);

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);
    let result;
    if (isRegistering) {
      result = await onRegister(name, email, password);
    } else {
      result = await onLogin(email, password);
    }
    setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
    setIsSubmitting(false);
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setFeedback(null);
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 flex flex-col">

      {/* HEADER */}
      <header className="p-6 flex justify-center md:justify-start">
        <FlogentLogo className="scale-100" />
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-grow flex flex-col md:flex-row items-center justify-center p-4 gap-8 md:gap-16 max-w-7xl mx-auto w-full">

        {/* LEFT COLUMN: PRO INFO (Hidden on small mobile, visible on md+) */}
        <div className="hidden md:flex flex-col items-end text-right space-y-4 max-w-xs">
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 hover:border-cyan-500/30 transition-colors">
            <div className="flex justify-end mb-2"><BriefcaseIcon /></div>
            <h3 className="text-xl font-bold text-zinc-100">Flogent Pro</h3>
            <p className="text-sm text-zinc-400 mt-2">
              Streamline your consultancy with advanced project planning, timesheets, and task management.
            </p>
          </div>
        </div>

        {/* CENTER COLUMN: LOGIN FORM */}
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-zinc-400">
              One platform for Agriculture & Professional Services.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-black border border-zinc-700 rounded-lg text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2.5 bg-black border border-zinc-700 rounded-lg text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2.5 pr-10 bg-black border border-zinc-700 rounded-lg text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {feedback && (
              <div className={`p-3 rounded-lg text-sm border ${feedback.type === 'success' ? 'bg-green-900/20 text-green-400 border-green-900' : 'bg-red-900/20 text-red-400 border-red-900'}`}>
                {feedback.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
            >
              {isSubmitting ? 'Processing...' : (isRegistering ? 'Get Started' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500">
              {isRegistering ? 'Already have an account?' : "New to Flogent?"}{' '}
              <button onClick={toggleForm} className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                {isRegistering ? 'Sign in' : 'Create account'}
              </button>
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: AGRI INFO (Hidden on small mobile, visible on md+) */}
        <div className="hidden md:flex flex-col items-start text-left space-y-4 max-w-xs">
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 hover:border-green-500/30 transition-colors">
            <div className="flex justify-start mb-2"><SproutIcon /></div>
            <h3 className="text-xl font-bold text-zinc-100">Flogent Agri</h3>
            <p className="text-sm text-zinc-400 mt-2">
              Manage your farm with ease. Track livestock, daily logs, and rainfall in one place.
            </p>
          </div>
        </div>

        {/* MOBILE INFO (Visible only on small screens below login) */}
        <div className="md:hidden flex flex-col gap-4 w-full max-w-md text-center mt-4">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
            <h3 className="font-bold text-cyan-400 mb-1">Flogent Pro</h3>
            <p className="text-xs text-zinc-500">Project Management & Timesheets</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
            <h3 className="font-bold text-green-400 mb-1">Flogent Agri</h3>
            <p className="text-xs text-zinc-500">Farm Diary & Livestock Tracking</p>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="p-6 text-center text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} Quantra Consulting. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthPage;