
import React, { useMemo } from 'react';
import { getOrganizers } from '../../storage';
import { SchoolType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Users, School, GraduationCap, Building2, LayoutDashboard } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const organizers = useMemo(() => getOrganizers(), []);

  const stats = useMemo(() => {
    return {
      total: organizers.length,
      primary: organizers.filter(o => o.schoolType === SchoolType.PRIMARY).length,
      middle: organizers.filter(o => o.schoolType === SchoolType.MIDDLE).length,
      higher: organizers.filter(o => o.schoolType === SchoolType.HIGHER_SECONDARY).length,
    };
  }, [organizers]);

  const cards = [
    {
      label: t('totalOrganizers'),
      value: stats.total,
      icon: Users,
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      label: t('primary'),
      value: stats.primary,
      icon: School,
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800'
    },
    {
      label: t('middle'),
      value: stats.middle,
      icon: Building2,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800'
    },
    {
      label: t('higherSecondary'),
      value: stats.higher,
      icon: GraduationCap,
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase flex items-center gap-3">
            <LayoutDashboard className="text-emerald-600" size={24} />
            {t('adminOverview')}
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {language === 'ta' ? 'அமைப்பாளர்கள் மற்றும் பள்ளிகளின் புள்ளிவிவரங்கள்' : 'State Management Dashboard'}
          </p>
        </div>
      </header>

      {/* Balanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i}
              className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border-2 border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col items-center text-center hover:border-emerald-500 transition-all duration-300"
            >
              <div className={`p-4 ${card.bg} ${card.text} rounded-2xl border-2 ${card.border} mb-6`}>
                <Icon size={28} />
              </div>
              <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-relaxed mb-2 h-10 flex items-center justify-center">
                {card.label}
              </p>
              <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                {card.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="bg-slate-900 dark:bg-black p-8 rounded-[2.5rem] border-2 border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg">TN</div>
          <div>
            <h3 className="text-white text-base font-black uppercase leading-tight">System Verification</h3>
            <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">Live Cloud Synchronization</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <span className="block text-[9px] font-black text-slate-500 uppercase">Live Connections</span>
            <span className="text-white font-black text-xl tabular-nums">4,281</span>
          </div>
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
