
import React, { useState, useEffect } from 'react';
import { UserRole, AuthState } from '../types';
import { getOrganizers } from '../storage';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { School, UserCircle, Key, Moon, Sun, ShieldCheck, Languages, ChevronRight, Lock } from 'lucide-react';

interface Props {
  onLogin: (user: AuthState['user']) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Prevent scrolling on the login page specifically for a "web-app" feel
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === UserRole.ADMIN) {
      if (username === 'admin' && password === 'admin123') {
        onLogin({ id: 'admin', role: UserRole.ADMIN, name: 'State Administrator' });
      } else {
        setError(t('loginError'));
      }
    } else {
      const organizers = getOrganizers();
      const organizer = organizers.find(o => 
        (o.id === username || o.email === username) && o.password === password
      );
      
      if (organizer) {
        onLogin({
          id: organizer.id,
          role: UserRole.ORGANIZER,
          name: `${organizer.firstName} ${organizer.lastName}`,
          organizerData: organizer
        });
      } else {
        setError(t('loginError'));
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden select-none relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Global Page Header (Layout Component) */}
      <header className="relative z-50 flex items-center justify-between px-6 py-5 md:px-12 border-b border-white/50 dark:border-white/5 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/30 transform hover:scale-105 transition-transform duration-300">
            <School className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
              TN NMO
            </h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
              {language === 'ta' ? 'தமிழ்நாடு அரசு' : 'Govt of Tamil Nadu'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-11 h-11 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm transition-all active:scale-90"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-2 px-5 h-11 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-black text-[11px] uppercase tracking-widest hover:border-emerald-500/50 shadow-sm transition-all active:scale-95 group"
          >
            <Languages size={16} className="text-emerald-600 group-hover:rotate-12 transition-transform" />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Login Layout Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-40">
        <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-700">
          {/* Auth Card */}
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-none border border-white dark:border-zinc-800 flex flex-col overflow-hidden relative">
            
            {/* Banner Section */}
            <div className="bg-emerald-600 dark:bg-emerald-700 p-10 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 scale-[3] pointer-events-none">
                 <ShieldCheck size={100} className="text-white" />
               </div>
               <div className="relative z-10">
                 <h2 className="text-xl md:text-2xl font-black text-white leading-tight uppercase tracking-tight">
                   {t('title')}
                 </h2>
                 <p className="text-emerald-100/80 mt-2 font-bold uppercase text-[9px] tracking-[0.4em]">
                   Secure Access Portal
                 </p>
               </div>
            </div>

            {/* Form Section */}
            <div className="p-8 md:p-11 space-y-8">
              
              {/* Role Switcher (Layout Part) */}
              <div className="relative flex bg-slate-100 dark:bg-zinc-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-zinc-700/50">
                <div 
                  className={`absolute top-1.5 bottom-1.5 w-[calc(50%-3px)] bg-white dark:bg-zinc-700 rounded-xl shadow-md transition-all duration-500 ease-out ${
                    role === UserRole.ORGANIZER ? 'translate-x-full' : 'translate-x-0'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setRole(UserRole.ADMIN)}
                  className={`relative z-10 flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                    role === UserRole.ADMIN ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  {t('admin')}
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.ORGANIZER)}
                  className={`relative z-10 flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                    role === UserRole.ORGANIZER ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  {t('organizer')}
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
                    {t('username')}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-emerald-500 transition-colors">
                      <UserCircle size={20} />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50/50 dark:bg-zinc-950/30 border-2 border-slate-100 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-600 rounded-2xl text-slate-900 dark:text-zinc-100 transition-all outline-none font-bold text-sm"
                      placeholder={role === UserRole.ADMIN ? 'admin' : 'Email or Account ID'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
                    {t('password')}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-emerald-500 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50/50 dark:bg-zinc-950/30 border-2 border-slate-100 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-600 rounded-2xl text-slate-900 dark:text-zinc-100 transition-all outline-none font-bold text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[10px] font-black py-3.5 px-4 rounded-xl text-center border border-rose-100 dark:border-rose-900/30 uppercase tracking-widest animate-shake">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="group relative w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 text-xs uppercase tracking-[0.25em]">{t('login')}</span>
                  <ChevronRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Layout Footer (Within Login Page) */}
        <footer className="mt-12 text-center space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-1000">
          <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] leading-relaxed">
            Directorate of School Education
          </p>
          <p className="text-[9px] font-bold text-slate-300 dark:text-zinc-700 uppercase tracking-widest leading-relaxed">
            © 2025 Government of Tamil Nadu. All Rights Reserved.
          </p>
          <p className="text-[9px] font-bold text-slate-300 dark:text-zinc-700 uppercase tracking-widest leading-relaxed">
            Made by Yogaarasu
          </p>
        </footer>
      </main>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.25s ease-in-out 0s 2;
        }
        .no-scroll {
          overflow: hidden !important;
          position: fixed;
          width: 100%;
          height: 100%;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
          -webkit-text-fill-color: inherit !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
};

export default Login;
