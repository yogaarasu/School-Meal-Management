
import React, { useMemo, useState, useEffect } from 'react';
import { AuthState, DailyReport } from '../../types';
import { getDailyReports, saveDailyReports, getStockLedger, saveStockLedger } from '../../storage';
import { ClipboardList, CheckCircle, Trash2, Edit2, X, Info, Filter, Calendar as CalendarIcon, ChevronDown, Banknote } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface Props { user: AuthState['user']; }

const SubmissionList: React.FC<Props> = ({ user }) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [alert, setAlert] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [filterDays, setFilterDays] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [customDate, setCustomDate] = useState<string>('');

  const rawReports = useMemo(() => 
    getDailyReports()
      .filter(r => r.organizerId === user?.id)
      .sort((a, b) => b.date.localeCompare(a.date)), 
    [user?.id]
  );

  const filteredReports = useMemo(() => {
    let result = [...rawReports];
    if (customDate) result = result.filter(r => r.date === customDate);
    else if (filterDays > 0) {
      const cutOff = new Date();
      cutOff.setDate(cutOff.getDate() - filterDays);
      const cutOffStr = cutOff.toISOString().split('T')[0];
      result = result.filter(r => r.date >= cutOffStr);
    }
    return result;
  }, [rawReports, filterDays, customDate]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm(language === 'ta' ? 'அறிக்கையை நீக்க வேண்டுமா?' : 'Confirm delete?')) return;
    saveDailyReports(getDailyReports().filter(r => r.id !== id));
    saveStockLedger(getStockLedger().filter(l => l.id !== `OUT_${id}`));
    setAlert({ msg: language === 'ta' ? 'நீக்கப்பட்டது' : 'Deleted', type: 'success' });
    setTimeout(() => window.location.reload(), 500);
  };

  const formatNum = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 px-1">
      {/* Toast Alert */}
      {alert && (
        <div className="fixed top-6 md:top-10 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 border-2 border-emerald-500/20">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="font-black text-[10px] md:text-xs uppercase tracking-widest leading-relaxed">{alert.msg}</span>
        </div>
      )}

      <header>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-relaxed break-words">
          {language === 'ta' ? 'சமர்ப்பிக்கப்பட்ட அறிக்கைகள்' : 'Submission History'}
        </h1>
        <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest leading-relaxed">
          {language === 'ta' ? 'பள்ளி வாரியான தினசரி உணவுப் பதிவுகள்' : 'Official daily meal log records'}
        </p>
      </header>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <Filter size={18} className="text-emerald-600" />
          <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-relaxed">{language === 'ta' ? 'வடிகட்டி' : 'Filters'}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto">
          {[
            { label: 'All', days: 0 },
            { label: '6d', days: 6 },
            { label: '30d', days: 30 },
            { label: '60d', days: 60 },
          ].map(f => (
            <button 
              key={f.label}
              onClick={() => { setFilterDays(f.days); setCustomDate(''); setVisibleCount(10); }}
              className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border-2 leading-relaxed ${
                filterDays === f.days && !customDate ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-zinc-800 border-slate-100 dark:border-zinc-700 text-slate-400'
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="h-8 w-px bg-slate-100 dark:bg-zinc-800 mx-2 hidden md:block"></div>
          <div className="relative flex-1 lg:flex-none">
            <CalendarIcon size={14} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="date" 
              value={customDate}
              onChange={(e) => { setCustomDate(e.target.value); setFilterDays(-1); setVisibleCount(10); }}
              className="pl-9 md:pl-10 pr-4 py-2 md:py-2.5 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-xl text-[9px] md:text-[10px] font-black text-slate-600 focus:border-emerald-500 outline-none w-full tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="max-h-[65vh] md:max-h-[70vh] overflow-y-auto custom-scrollbar pr-1 md:pr-2 space-y-4">
        {filteredReports.length > 0 ? (
          <>
            {filteredReports.slice(0, visibleCount).map((report) => (
              <div 
                key={report.id} 
                onClick={() => setSelectedReport(report)}
                className="group bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm hover:border-emerald-500 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 overflow-hidden"
              >
                <div className="flex items-center space-x-4 md:space-x-6">
                  <div className="p-3 md:p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl md:rounded-2xl border-2 border-emerald-100 dark:border-emerald-800 shrink-0">
                    <ClipboardList size={20} md:size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-2">
                      <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums leading-relaxed">{report.date}</span>
                      <span className={`text-[7px] md:text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-tighter leading-relaxed ${report.section === 'PRIMARY' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {report.section === 'PRIMARY' ? (language === 'ta' ? 'தொடக்க' : 'PRIMARY') : (language === 'ta' ? 'நடுநிலை' : 'MIDDLE')}
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white truncate leading-snug">
                      {language === 'ta' ? 'மதிய உணவு' : 'Meal Record'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-10 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-50">
                  <div className="text-right">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-relaxed">{language === 'ta' ? 'வருகை' : 'Students'}</p>
                    <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">{report.studentsPresent}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/daily-report?edit=${report.id}`); }}
                      className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border-2 border-emerald-50 active:scale-95"
                    >
                      <Edit2 size={16} md:size={18} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, report.id)}
                      className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border-2 border-rose-50 active:scale-95"
                    >
                      <Trash2 size={16} md:size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {visibleCount < filteredReports.length && (
              <button 
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="w-full py-4 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-xl md:rounded-3xl text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-all flex items-center justify-center gap-3 leading-relaxed"
              >
                {language === 'ta' ? 'மேலும் காட்டு' : 'Show More'} <ChevronDown size={16} />
              </button>
            )}
          </>
        ) : (
          <div className="border-4 border-dashed border-slate-200 dark:border-zinc-800 rounded-[2rem] md:rounded-[3rem] py-20 md:py-24 flex flex-col items-center justify-center bg-white/50 text-center px-8">
            <ClipboardList size={40} md:size={48} className="text-slate-200 mb-6" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs leading-relaxed">
              {language === 'ta' ? 'பதிவுகள் ஏதும் இல்லை' : 'No records found'}
            </p>
          </div>
        )}
      </div>

      {/* Popups */}
      {selectedReport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border-4 border-emerald-500/20 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 bg-emerald-600 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white/20 rounded-xl md:rounded-2xl backdrop-blur-md"><Info size={20} md:size={24} /></div>
                <div>
                  <h2 className="text-lg md:text-xl font-black tracking-tight leading-none">{language === 'ta' ? 'அறிக்கை விவரம்' : 'Submission Summary'}</h2>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-80 mt-2 leading-relaxed">{selectedReport.date} • {selectedReport.section}</p>
                </div>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-1 md:p-2 hover:bg-emerald-700 rounded-full transition-colors"><X size={28} md:size={32} /></button>
            </div>
            
            <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-8">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="bg-slate-50 dark:bg-zinc-800 p-5 md:p-6 rounded-2xl border-2 border-slate-100 dark:border-zinc-700">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-relaxed">{language === 'ta' ? 'வருகை' : 'Attendance'}</p>
                  <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{selectedReport.studentsPresent}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 md:p-6 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2 leading-relaxed">{language === 'ta' ? 'செலவு' : 'Total Cost'}</p>
                  <p className="text-2xl md:text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tighter tabular-nums leading-none">₹{formatNum(selectedReport.totalCost)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Stock Consumption */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                    <ClipboardList size={14} className="text-emerald-500" />
                    {language === 'ta' ? 'சரக்கு பயன்பாடு' : 'Stock Consumption'}
                  </h4>
                  <div className="space-y-2">
                    {selectedReport.itemsUsed.map((item) => (
                      <div key={item.itemId} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-700 rounded-xl">
                        <span className="text-[9px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest truncate max-w-[120px]">{item.itemId}</span>
                        <span className="text-base font-black text-slate-900 dark:text-white tabular-nums">{formatNum(item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                    <Banknote size={14} className="text-amber-500" />
                    {language === 'ta' ? 'விலை கணக்கீடு' : 'Price Breakdown'}
                  </h4>
                  {selectedReport.costBreakdown ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-700 rounded-xl">
                        <span className="text-[9px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{t('vegetables')}</span>
                        <span className="text-base font-black text-amber-600 tabular-nums">₹{formatNum(selectedReport.costBreakdown.veg)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-700 rounded-xl">
                        <span className="text-[9px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{t('grocery')}</span>
                        <span className="text-base font-black text-amber-600 tabular-nums">₹{formatNum(selectedReport.costBreakdown.grocery)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-700 rounded-xl">
                        <span className="text-[9px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{t('gas')}</span>
                        <span className="text-base font-black text-amber-600 tabular-nums">₹{formatNum(selectedReport.costBreakdown.gas)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-4">Legacy record (no breakdown available)</p>
                  )}
                </div>
              </div>

              <button onClick={() => setSelectedReport(null)} className="w-full bg-zinc-900 text-white font-black py-5 rounded-[2rem] text-[11px] uppercase tracking-widest shadow-xl hover:bg-black transition-all leading-relaxed active:scale-[0.98]">
                {language === 'ta' ? 'மூடு' : 'Close Details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionList;
