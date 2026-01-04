import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Languages,
  Moon,
  Sun,
  School,
  User,
  Edit2,
  ChevronRight
} from 'lucide-react';
import { AuthState } from '../types';

interface Props {
  onLogout: () => void;
  user: AuthState['user'];
}

// Fix: Completed component and added default export to resolve import error in App.tsx
const AdminLayout: React.FC<Props> = ({ onLogout, user }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const menuItems = [
    { name: t('dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('organizers'), path: '/organizers', icon: Users },
    { name: t('pricing'), path: '/pricing', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Mobile Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-b-2 border-slate-100 dark:border-zinc-800 p-4 flex justify-between items-center h-16 glass-effect">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <School size={18} />
          </div>
          <span className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">Admin Panel</span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-xl border-2 border-slate-100 dark:border-zinc-700">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-white dark:bg-zinc-900 border-r-2 border-slate-100 dark:border-zinc-800 transform transition-transform duration-500 ease-in-out shadow-2xl md:shadow-none
        md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Admin Profile Header */}
          <div 
            onClick={() => setProfileOpen(true)}
            className="group flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-50 dark:bg-zinc-800/50 border-2 border-slate-100 dark:border-zinc-800 cursor-pointer hover:border-emerald-500 transition-all mb-8 active:scale-95"
          >
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <User size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none truncate">{user?.name}</h1>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Super Admin</p>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-sm uppercase tracking-wider border-2 ${
                    isActive 
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-600/20" 
                    : "bg-transparent border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Controls - Properly Sized */}
          <div className="pt-6 border-t-2 border-slate-50 dark:border-zinc-800 space-y-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all font-black text-sm uppercase tracking-widest border-2 border-transparent"
            >
              <Languages size={20} className="text-emerald-600" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all font-black text-sm uppercase tracking-widest border-2 border-transparent"
            >
              {theme === 'light' ? <Moon size={20} className="text-slate-400" /> : <Sun size={20} className="text-amber-500" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all font-black text-sm uppercase tracking-widest border-2 border-transparent"
            >
              <LogOut size={20} />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-6 md:p-12 pb-24 md:pb-12">
          <Outlet />
        </div>
      </main>

      {/* Profile Detail Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[3rem] shadow-2xl border-4 border-emerald-500/10 overflow-hidden flex flex-col">
            <div className="p-10 border-b-2 border-slate-50 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-emerald-600/30">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight">{user?.name}</h2>
                  <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mt-2">Administrative Profile</p>
                </div>
              </div>
              <button onClick={() => setProfileOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors">
                <X size={28} className="text-slate-400" />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-slate-50 dark:bg-zinc-800/40 rounded-3xl border-2 border-slate-100 dark:border-zinc-800">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role</p>
                   <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">Super Administrator</p>
                </div>
              </div>
              <button 
                onClick={() => setProfileOpen(false)}
                className="w-full bg-slate-900 dark:bg-zinc-800 text-white font-black py-5 rounded-[2rem] text-[11px] uppercase tracking-widest"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;