
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Package, 
  BarChart3,
  LogOut, 
  Languages,
  Moon,
  Sun,
  ListFilter,
  User,
  X,
  Edit2,
  Phone,
  Mail,
  School
} from 'lucide-react';
import { AuthState } from '../types';

interface Props {
  onLogout: () => void;
  user: AuthState['user'];
}

const OrganizerLayout: React.FC<Props> = ({ onLogout, user }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isProfileOpen, setProfileOpen] = useState(false);

  const menuItems = [
    { name: t('dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('dailyReport'), path: '/daily-report', icon: ClipboardList },
    { name: language === 'ta' ? 'பட்டியல்' : 'Logs', path: '/submissions', icon: ListFilter },
    { name: t('stock'), path: '/stock', icon: Package },
    { name: t('monthlyReport'), path: '/monthly-report', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setProfileOpen(true)}>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl">TN</div>
            <div>
              <h1 className="text-sm font-black tracking-tight leading-none text-slate-900 dark:text-white truncate max-w-[120px]">{user?.name}</h1>
              <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">Organizer</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                    isActive 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" 
                    : "text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-100 dark:border-zinc-800 space-y-1">
          <button onClick={toggleTheme} className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 text-sm font-bold">
            <div className="flex items-center space-x-3">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
          </button>
          <button onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')} className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 text-sm font-bold">
            <div className="flex items-center space-x-3">
              <Languages size={18} />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </div>
          </button>
          <button onClick={onLogout} className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-sm font-bold mt-2">
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Profile Detail Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border-2 border-slate-100 dark:border-zinc-800 overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">{user?.name}</h2>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-2">{user?.organizerData?.schoolType}</p>
                </div>
              </div>
              <button onClick={() => setProfileOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-700">
                  <School className="text-slate-400 mt-1" size={18} />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">School</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">{user?.organizerData?.schoolName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-700">
                  <Mail className="text-slate-400" size={18} />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">{user?.organizerData?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-700">
                  <Phone className="text-slate-400" size={18} />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-200 tabular-nums">{user?.organizerData?.phone}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                  <Edit2 size={16} /> Edit Profile
                </button>
                <button onClick={() => setProfileOpen(false)} className="flex-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-black py-4 rounded-xl text-xs uppercase tracking-widest">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header - Unified */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shrink-0 glass-effect sticky top-0 z-40">
          <div className="flex items-center space-x-3 md:hidden">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-sm">TN</div>
            <h1 className="text-xs font-black uppercase text-slate-900 dark:text-white truncate max-w-[150px]">
              {user?.organizerData?.schoolName || 'School Meal'}
            </h1>
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('welcome')},</span>
            <span className="ml-2 text-sm font-black text-slate-900 dark:text-white uppercase">{user?.name}</span>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 md:hidden">
               <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-emerald-600"><Moon size={18} /></button>
               <button onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')} className="p-2 text-slate-400 font-black text-[10px] uppercase">
                 {language === 'en' ? 'TA' : 'EN'}
               </button>
             </div>
             <button onClick={() => setProfileOpen(true)} className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 transition-transform active:scale-90">
               <User size={20} />
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-zinc-950 px-4 py-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex justify-around items-center px-2 py-3 z-50 glass-effect">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 min-w-[64px] transition-colors ${
                  isActive ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                <Icon size={20} />
                <span className="text-[9px] font-bold uppercase truncate max-w-[60px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default OrganizerLayout;
