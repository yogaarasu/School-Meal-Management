
import React, { useState, useMemo } from 'react';
import { AuthState } from '../../types';
import { getStockLedger } from '../../storage';
import { STOCK_ITEMS } from '../../constants';
import { FileText, Download, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props { user: AuthState['user']; }

const MonthlyReport: React.FC<Props> = ({ user }) => {
  const { language, t } = useLanguage();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const ledger = useMemo(() => 
    getStockLedger().filter(l => l.organizerId === user?.id), 
    [user?.id]
  );

  const reportData = useMemo(() => {
    return STOCK_ITEMS.filter(item => ['rice', 'dal', 'oil', 'chickpeas', 'greenBeans'].includes(item.id)).map(item => {
      const startingStock = ledger
        .filter(l => l.itemId === item.id && l.date < `${selectedMonth}-01`)
        .reduce((sum, curr) => curr.type === 'IN' ? sum + curr.quantity : sum - curr.quantity, 0);

      const totalIn = ledger
        .filter(l => l.itemId === item.id && l.date.startsWith(selectedMonth) && l.type === 'IN')
        .reduce((sum, curr) => sum + curr.quantity, 0);

      const totalOut = ledger
        .filter(l => l.itemId === item.id && l.date.startsWith(selectedMonth) && l.type === 'OUT')
        .reduce((sum, curr) => sum + curr.quantity, 0);

      return {
        id: item.id,
        name: language === 'ta' ? item.nameTa : item.nameEn,
        unit: language === 'ta' ? item.unitTa : item.unitEn,
        starting: Math.max(0, startingStock),
        added: totalIn,
        spent: totalOut,
        remaining: Math.max(0, startingStock + totalIn - totalOut)
      };
    });
  }, [ledger, selectedMonth, language]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 px-1">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-emerald-950 dark:text-emerald-100 leading-relaxed break-words">
            {language === 'ta' ? 'மாதாந்திர இருப்பு அறிக்கை' : 'Monthly Stock Report'}
          </h1>
          <p className="text-[10px] md:text-[11px] text-gray-400 font-black mt-2 uppercase tracking-widest break-words leading-relaxed">
            {language === 'ta' ? 'சரக்கு பயன்பாட்டுச் சுருக்கம்' : 'Consolidated monthly inventory'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white dark:bg-zinc-900 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm border-2 border-slate-100 dark:border-zinc-800 self-start md:self-auto">
          <Calendar size={18} className="text-emerald-700 ml-1" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2 py-1 outline-none border-none focus:ring-0 text-[10px] md:text-sm font-black text-emerald-950 dark:text-emerald-400 uppercase bg-transparent tabular-nums leading-relaxed"
          />
        </div>
      </header>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-[3rem] shadow-xl border-2 border-slate-100 dark:border-zinc-800 overflow-hidden print:border-none print:shadow-none">
        <div className="p-6 md:p-10 border-b-2 border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6 bg-emerald-50/30 dark:bg-emerald-800/10">
          <div className="flex items-center space-x-4">
            <div className="p-3 md:p-4 bg-emerald-700 text-white rounded-xl shadow-lg shrink-0"><FileText size={20} md:size={24} /></div>
            <div>
              <h2 className="text-base md:text-xl font-black text-emerald-950 dark:text-emerald-400 tracking-tight leading-none break-words">
                {t('monthlyReport')} — <span className="tabular-nums">{selectedMonth}</span>
              </h2>
              <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-emerald-600/60 mt-2 leading-relaxed">Official Resource Inventory</p>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="w-full md:w-auto flex items-center justify-center space-x-3 text-emerald-800 dark:text-emerald-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl border-2 border-emerald-100 dark:border-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-95 shrink-0 leading-relaxed"
          >
            <Download size={16} />
            <span>{language === 'ta' ? 'பதிவிறக்கம்' : 'Download'}</span>
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-black/20 text-[8px] md:text-[9px] uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 md:px-12 py-5 font-black leading-relaxed">{t('item')}</th>
                <th className="px-3 md:px-6 py-5 font-black text-center leading-relaxed">{t('startingStock')}</th>
                <th className="px-3 md:px-6 py-5 font-black text-center text-emerald-600 leading-relaxed">{t('addedStock')}</th>
                <th className="px-3 md:px-6 py-5 font-black text-center text-amber-600 leading-relaxed">{t('spentStock')}</th>
                <th className="px-6 md:px-12 py-5 font-black text-right text-emerald-900 dark:text-emerald-400 leading-relaxed">{t('remaining')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {reportData.map((row) => (
                <tr key={row.id} className="hover:bg-emerald-50/10 transition-colors">
                  <td className="px-6 md:px-12 py-5">
                    <div className="font-black text-slate-900 dark:text-white text-base md:text-lg leading-relaxed break-words max-w-[120px] md:max-w-[200px]">{row.name}</div>
                    <div className="text-[9px] font-black uppercase text-emerald-500 tracking-widest mt-1 leading-relaxed">{row.unit}</div>
                  </td>
                  <td className="px-3 md:px-6 py-5 text-center font-mono font-bold text-slate-600 dark:text-zinc-400 text-sm md:text-base tabular-nums leading-none">{row.starting.toFixed(3)}</td>
                  <td className="px-3 md:px-6 py-5 text-center font-mono font-black text-emerald-600 text-sm md:text-base tabular-nums leading-none">+{row.added.toFixed(3)}</td>
                  <td className="px-3 md:px-6 py-5 text-center font-mono font-black text-amber-600 text-sm md:text-base tabular-nums leading-none">-{row.spent.toFixed(3)}</td>
                  <td className="px-6 md:px-12 py-5 text-right">
                    <span className="font-mono font-black text-2xl md:text-4xl text-emerald-900 dark:text-emerald-400 tracking-tighter tabular-nums leading-none">{row.remaining.toFixed(3)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 md:p-12 bg-slate-50/50 dark:bg-zinc-800/30 border-t-2 border-slate-100 dark:border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <div className="space-y-4">
              <h4 className="text-[10px] md:text-[11px] font-black text-emerald-800 dark:text-emerald-600 uppercase tracking-widest border-b border-emerald-100 dark:border-emerald-800 pb-2 leading-relaxed">உறுதிமொழி (Declaration)</h4>
              <p className="text-[11px] md:text-xs text-slate-500 dark:text-zinc-400 font-bold leading-relaxed italic break-words">
                {language === 'ta' 
                  ? 'மேலே குறிப்பிட்டுள்ள விவரங்கள் அனைத்தும் உண்மையானவை மற்றும் பள்ளி பதிவேடுகளின்படி சரிபார்க்கப்பட்டவை என உறுதி அளிக்கிறேன்.'
                  : 'I hereby declare that all information provided above is true and verified according to school records.'}
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end justify-end">
              <div className="w-full md:w-64 border-t-4 border-emerald-900 dark:border-emerald-700 pt-6 text-center">
                <p className="font-black text-emerald-950 dark:text-emerald-300 text-[10px] md:text-xs uppercase tracking-widest break-words leading-relaxed">
                  {language === 'ta' ? 'பள்ளி அமைப்பாளர்' : 'School Organizer'}
                </p>
                <p className="text-[8px] md:text-[9px] text-emerald-400 uppercase font-black tracking-widest mt-2 leading-relaxed opacity-60">(Seal & Signature)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
