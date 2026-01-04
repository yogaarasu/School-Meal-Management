
import React, { useState, useMemo, useEffect } from 'react';
import { AuthState, StockLedgerEntry } from '../../types';
import { getStockLedger, saveStockLedger } from '../../storage';
import { STOCK_ITEMS } from '../../constants';
import { PlusCircle, History, Package, Trash2, Calendar, ShoppingCart, CheckCircle, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  user: AuthState['user'];
}

const StockManagement: React.FC<Props> = ({ user }) => {
  const { language, t } = useLanguage();
  const [alert, setAlert] = useState<string | null>(null);
  const [ledger, setLedger] = useState<StockLedgerEntry[]>(() => 
    getStockLedger().filter(l => l.organizerId === user?.id)
  );
  const [visibleHistory, setVisibleHistory] = useState(10);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    itemId: 'rice',
    quantity: 0,
    description: ''
  });

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const currentStock = useMemo(() => {
    return STOCK_ITEMS.filter(item => ['rice', 'dal', 'oil', 'chickpeas', 'greenBeans'].includes(item.id)).map(item => {
      const balance = ledger
        .filter(l => l.itemId === item.id)
        .reduce((sum, curr) => curr.type === 'IN' ? sum + curr.quantity : sum - curr.quantity, 0);
      return { ...item, balance: Math.max(0, balance) };
    });
  }, [ledger]);

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity <= 0) return;

    const newEntry: StockLedgerEntry = {
      id: `IN_${Date.now()}`,
      organizerId: user!.id,
      date: formData.date,
      itemId: formData.itemId,
      quantity: formData.quantity,
      type: 'IN',
      description: formData.description
    };

    const updatedLedger = [...getStockLedger(), newEntry];
    saveStockLedger(updatedLedger);
    setLedger(updatedLedger.filter(l => l.organizerId === user?.id));
    
    setFormData({ ...formData, quantity: 0, description: '' });
    setAlert(language === 'ta' ? 'சேமிக்கப்பட்டது!' : 'Stock Added!');
  };

  const deleteEntry = (id: string) => {
    if (confirm(language === 'ta' ? 'நீக்க வேண்டுமா?' : 'Confirm Delete?')) {
      const updated = getStockLedger().filter(l => l.id !== id);
      saveStockLedger(updated);
      setLedger(updated.filter(l => l.organizerId === user?.id));
      setAlert(language === 'ta' ? 'நீக்கப்பட்டது' : 'Deleted');
    }
  };

  const formatNum = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Toast Alert */}
      {alert && (
        <div className="fixed top-6 md:top-10 left-1/2 -translate-x-1/2 z-[200] bg-zinc-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-emerald-500 animate-in slide-in-from-top-4">
          <CheckCircle size={20} className="text-emerald-500" />
          <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">{alert}</span>
        </div>
      )}

      <header className="bg-emerald-950 p-8 md:p-10 rounded-[2rem] text-white shadow-xl flex justify-between items-center border-4 border-emerald-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><Package size={200} /></div>
        <div className="relative z-10 flex-1 min-w-0 pr-4">
          <h1 className="text-xl md:text-3xl font-black tracking-tight uppercase leading-relaxed truncate">{t('stock')}</h1>
          <p className="text-[9px] md:text-[11px] font-black text-emerald-400 mt-2 uppercase tracking-widest leading-relaxed break-words">{t('currentStock')}</p>
        </div>
        <Package className="text-amber-400 opacity-20 shrink-0" size={40} />
      </header>

      {/* Denser Item Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
        {currentStock.map(item => (
          <div key={item.id} className="bg-white dark:bg-zinc-900 p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm border-2 border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center group hover:border-emerald-500 transition-all min-h-[120px] md:min-h-[140px]">
            <p className="text-[8px] md:text-[9px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-2 leading-relaxed break-words text-center w-full px-1">
              {language === 'ta' ? item.nameTa : item.nameEn}
            </p>
            <p className="text-xl md:text-3xl font-black text-emerald-950 dark:text-emerald-400 tracking-tighter tabular-nums leading-none">
              {formatNum(item.balance)}
            </p>
            <p className="text-[7px] md:text-[8px] font-black text-slate-300 dark:text-zinc-600 uppercase tracking-widest mt-1 leading-relaxed">
              {language === 'ta' ? item.unitTa : item.unitEn}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">
        {/* Form Area - Sticky on desktop */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-200 dark:border-zinc-800 shadow-sm md:sticky md:top-10">
          <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-emerald-900 dark:text-emerald-400 mb-8 flex items-center gap-4 leading-relaxed">
            <PlusCircle size={20} className="text-amber-500" />
            {t('addStock')}
          </h2>
          <form onSubmit={handleAddStock} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-1 leading-relaxed">{t('date')}</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600" size={16} />
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 dark:bg-zinc-800/50 pl-12 pr-4 py-3 rounded-xl font-black text-xs md:text-sm outline-none border-2 border-slate-100 dark:border-zinc-700 focus:border-emerald-500 transition-colors tabular-nums" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-1 leading-relaxed">{t('item')}</label>
              <div className="relative">
                <ShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600" size={16} />
                <select value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})} className="w-full bg-slate-50 dark:bg-zinc-800/50 pl-12 pr-4 py-3 rounded-xl font-black text-xs md:text-sm outline-none border-2 border-slate-100 dark:border-zinc-700 focus:border-emerald-500 appearance-none transition-colors leading-relaxed">
                  {STOCK_ITEMS.filter(i => ['rice', 'dal', 'oil', 'chickpeas', 'greenBeans'].includes(i.id)).map(i => (
                    <option key={i.id} value={i.id}>{language === 'ta' ? i.nameTa : i.nameEn}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-1 leading-relaxed">{t('quantity')}</label>
              <input type="number" step="0.001" value={formData.quantity === 0 ? '' : formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full bg-white dark:bg-zinc-900 p-5 rounded-xl font-black text-3xl md:text-5xl outline-none border-2 border-slate-200 dark:border-zinc-700 focus:border-emerald-500 transition-colors tabular-nums text-center" placeholder="0.000" />
            </div>
            <button type="submit" className="w-full bg-emerald-900 dark:bg-emerald-800 text-white font-black py-4 md:py-5 rounded-xl md:rounded-[1.5rem] text-[10px] md:text-[11px] uppercase tracking-widest shadow-xl hover:bg-black transition-all mt-4 active:scale-95 shadow-emerald-500/20 leading-relaxed">
              {t('save')}
            </button>
          </form>
        </div>

        {/* History Area - Max Height Scrollable */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-[1.5rem] md:rounded-[3rem] border-2 border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full max-h-[75vh]">
          <div className="p-6 md:p-8 bg-slate-50 dark:bg-black/20 border-b-2 border-slate-100 dark:border-zinc-800 flex items-center gap-4">
            <History size={20} className="text-emerald-700" />
            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-emerald-950 dark:text-emerald-400 leading-relaxed">{t('history')}</h2>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-black/20 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-zinc-800 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-4 md:px-8 py-5 leading-relaxed">{t('date')}</th>
                  <th className="px-3 md:px-6 py-5 leading-relaxed">{t('item')}</th>
                  <th className="px-3 md:px-6 py-5 text-right leading-relaxed">{t('quantity')}</th>
                  <th className="px-4 md:px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {ledger.sort((a,b) => b.date.localeCompare(a.date)).slice(0, visibleHistory).map(entry => {
                  const item = STOCK_ITEMS.find(i => i.id === entry.itemId);
                  return (
                    <tr key={entry.id} className="text-xs group hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all">
                      <td className="px-4 md:px-8 py-4 font-mono font-black text-emerald-800 dark:text-emerald-500 tabular-nums leading-relaxed whitespace-nowrap">{entry.date}</td>
                      <td className="px-3 md:px-6 py-4 font-black text-slate-800 dark:text-zinc-300 leading-relaxed break-words text-[11px] md:text-[12px]">{language === 'ta' ? item?.nameTa : item?.nameEn}</td>
                      <td className={`px-3 md:px-6 py-4 text-right font-black tabular-nums text-[12px] md:text-[13px] ${entry.type === 'IN' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {entry.type === 'IN' ? '+' : '-'} {formatNum(entry.quantity)}
                      </td>
                      <td className="px-4 md:px-8 py-4 text-right">
                        <button onClick={() => deleteEntry(entry.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors group-hover:opacity-100 active:scale-95 shrink-0"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visibleHistory < ledger.length && (
              <div className="p-6 bg-slate-50/30 dark:bg-black/10 border-t border-slate-100 dark:border-zinc-800">
                <button 
                  onClick={() => setVisibleHistory(prev => prev + 15)}
                  className="w-full py-4 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-3 hover:text-emerald-600 transition-all border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl leading-relaxed"
                >
                  {language === 'ta' ? 'மேலும் காட்டு' : 'View More'} <ChevronDown size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
