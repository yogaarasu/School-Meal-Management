
import React, { useMemo } from 'react';
import { AuthState } from '../../types';
import { getDailyReports } from '../../storage';
import { Users, TrendingUp, ArrowRight, ClipboardList, Calendar, Star } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

interface Props {
  user: AuthState['user'];
}

const OrganizerDashboard: React.FC<Props> = ({ user }) => {
  const { language, t } = useLanguage();

  const rawReports = useMemo(() => 
    getDailyReports().filter(r => r.organizerId === user?.id),
    [user?.id]
  );

  const stats = useMemo(() => {
    return {
      totalPrimary: rawReports.reduce((acc, r) => acc + (r.students1to5 || 0), 0),
      totalMiddle: rawReports.reduce((acc, r) => acc + (r.students6to8 || 0), 0),
      totalAll: rawReports.reduce((acc, r) => acc + (r.studentsPresent || 0), 0),
    };
  }, [rawReports]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-emerald-700 dark:bg-emerald-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-500/10">
        <div className="absolute right-0 top-0 p-10 opacity-10 rotate-12"><Star size={100} /></div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 mb-2">Government of Tamil Nadu</p>
          <h1 className="text-2xl font-black mb-2">
            {language === 'ta' ? `வணக்கம், ${user?.name}!` : `Hello, ${user?.name}!`}
          </h1>
          <p className="text-sm font-medium opacity-80 leading-relaxed max-w-lg">
            {user?.organizerData?.schoolName}
          </p>
          
          <div className="mt-8 flex flex-wrap gap-3">
             <Link to="/daily-report" className="px-6 py-3 bg-white text-emerald-900 rounded-2xl font-black text-xs uppercase shadow hover:bg-emerald-50 transition-all flex items-center space-x-2">
               <span>{t('dailyReport')}</span>
               <ArrowRight size={14} />
             </Link>
             <Link to="/stock" className="px-6 py-3 bg-emerald-800 text-white border border-emerald-600 rounded-2xl font-black text-xs uppercase hover:bg-emerald-700 transition-all">
               {t('stock')}
             </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users size={20} /></div>
             <span className="text-[10px] font-black text-slate-400 uppercase">1-8 Total</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{stats.totalAll.toLocaleString()}</p>
          <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Total Students Served</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><TrendingUp size={20} /></div>
             <span className="text-[10px] font-black text-slate-400 uppercase">Primary (1-5)</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{stats.totalPrimary.toLocaleString()}</p>
          <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Cumulative Count</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={20} /></div>
             <span className="text-[10px] font-black text-slate-400 uppercase">Middle (6-8)</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{stats.totalMiddle.toLocaleString()}</p>
          <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Cumulative Count</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Navigation Helpers */}
        <Link to="/submissions" className="block group">
           <div className="bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 p-6 rounded-3xl flex items-center justify-between hover:border-emerald-500 transition-all shadow-sm">
             <div className="flex items-center space-x-4">
               <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                 <ClipboardList size={24} />
               </div>
               <div>
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{language === 'ta' ? 'பதிவுகளைக் காண்க' : 'History Logs'}</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Check past reports</p>
               </div>
             </div>
             <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
           </div>
        </Link>

        <Link to="/monthly-report" className="block group">
           <div className="bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 p-6 rounded-3xl flex items-center justify-between hover:border-emerald-500 transition-all shadow-sm">
             <div className="flex items-center space-x-4">
               <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                 <Calendar size={24} />
               </div>
               <div>
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{language === 'ta' ? 'மாதாந்திர அறிக்கை' : 'Monthly Performance'}</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Review summaries</p>
               </div>
             </div>
             <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
           </div>
        </Link>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
