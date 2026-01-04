
import React, { useState, useMemo, useEffect } from 'react';
import { AuthState, DailyReport, StockLedgerEntry, SchoolType, SchoolTypeLabels } from '../../types';
import { getPricingConfig, getStockLedger, saveStockLedger, getDailyReports, saveDailyReports } from '../../storage';
import { CheckCircle2, AlertCircle, Calculator, Calendar, ChevronRight, CheckSquare, Square, Info, Users, Banknote } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Props {
  user: AuthState['user'];
}

const DailyMealReport: React.FC<Props> = ({ user }) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const pricingConfig = useMemo(() => getPricingConfig(), []);
  const mySchoolType = user?.organizerData?.schoolType;
  const isMiddleSchool = mySchoolType === SchoolType.MIDDLE;

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportSection, setReportSection] = useState<'PRIMARY' | 'MIDDLE'>(isMiddleSchool ? 'PRIMARY' : 'PRIMARY');
  const [students, setStudents] = useState<number>(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(['rice', 'dal', 'oil', 'chickpeas', 'greenBeans', 'veg', 'grocery', 'gas']));

  useEffect(() => {
    const existing = getDailyReports().find(r => 
      r.date === date && 
      r.organizerId === user?.id && 
      (isMiddleSchool ? r.section === reportSection : true)
    );
    
    if (existing && !editId) {
      setIsAlreadySubmitted(true);
      setStudents(existing.studentsPresent);
      setSelectedItems(new Set(existing.itemsUsed.map(i => i.itemId)));
    } else if (editId) {
      const editRep = getDailyReports().find(r => r.id === editId);
      if (editRep) {
        setDate(editRep.date);
        setStudents(editRep.studentsPresent);
        setReportSection(editRep.section as any);
        setSelectedItems(new Set(editRep.itemsUsed.map(i => i.itemId)));
      }
    } else {
      setIsAlreadySubmitted(false);
      setStudents(0);
    }
  }, [date, reportSection, user?.id, isMiddleSchool, editId]);

  const toggleItem = (id: string) => {
    if (isAlreadySubmitted && !editId) return;
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  const sectionType = reportSection === 'PRIMARY' ? SchoolType.PRIMARY : SchoolType.MIDDLE;
  const activeConfig = pricingConfig[sectionType];

  const calculations = useMemo(() => {
    const getVal = (field: keyof typeof activeConfig, itemId: string) => {
      if (!selectedItems.has(itemId)) return 0;
      return (activeConfig[field] as number) * (students || 0);
    };

    return [
      { id: 'rice', name: t('rice'), quantity: getVal('riceGrams', 'rice') / 1000, unit: 'kg' },
      { id: 'dal', name: t('dal'), quantity: getVal('dalGrams', 'dal') / 1000, unit: 'kg' },
      { id: 'oil', name: t('oil'), quantity: getVal('oilMl', 'oil') / 1000, unit: 'L' },
      { id: 'chickpeas', name: t('chickpeas'), quantity: getVal('chickpeasGrams', 'chickpeas') / 1000, unit: 'kg' },
      { id: 'greenBeans', name: t('greenBeans'), quantity: getVal('greenBeansGrams', 'greenBeans') / 1000, unit: 'kg' },
      { id: 'COST_VEG', name: t('vegetables'), quantity: getVal('vegPrice', 'veg'), unit: '₹' },
      { id: 'COST_GROCERY', name: t('grocery'), quantity: getVal('groceryPrice', 'grocery'), unit: '₹' },
      { id: 'COST_GAS', name: t('gas'), quantity: getVal('gasPrice', 'gas'), unit: '₹' },
    ];
  }, [students, reportSection, activeConfig, t, selectedItems]);

  const financialBreakdown = useMemo(() => {
    const getCost = (field: keyof typeof activeConfig, itemId: string) => {
      if (!selectedItems.has(itemId)) return 0;
      return (activeConfig[field] as number) * (students || 0);
    };
    return {
      veg: getCost('vegPrice', 'veg'),
      grocery: getCost('groceryPrice', 'grocery'),
      gas: getCost('gasPrice', 'gas')
    };
  }, [students, selectedItems, activeConfig]);

  const totalCost = financialBreakdown.veg + financialBreakdown.grocery + financialBreakdown.gas;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAlreadySubmitted && !editId) return;
    if (students <= 0) {
      setError(language === 'ta' ? 'வருகையை உள்ளிடவும்' : 'Enter attendance');
      return;
    }

    const reportId = editId || `rep_${Date.now()}`;
    const itemsUsed = calculations
      .filter(c => !c.id.startsWith('COST_') && c.quantity > 0)
      .map(c => ({ itemId: c.id, quantity: c.quantity }));

    const report: DailyReport = {
      id: reportId,
      organizerId: user!.id,
      date,
      mealId: 'standard_meal',
      section: isMiddleSchool ? reportSection : 'ALL',
      studentsPresent: students,
      students1to5: reportSection === 'PRIMARY' ? students : 0,
      students6to8: reportSection === 'MIDDLE' ? students : 0,
      itemsUsed,
      totalCost,
      costBreakdown: financialBreakdown
    };

    let reportsList = getDailyReports();
    if (editId) {
      reportsList = reportsList.map(r => r.id === editId ? report : r);
    } else {
      reportsList.push(report);
    }
    saveDailyReports(reportsList);

    const ledger = getStockLedger().filter(l => l.id !== `OUT_${reportId}`);
    const newLedgerEntries: StockLedgerEntry[] = itemsUsed.map(c => ({
      id: `OUT_${reportId}`,
      organizerId: user!.id,
      date,
      itemId: c.itemId,
      quantity: c.quantity,
      type: 'OUT',
      description: `Daily usage (${reportSection})`
    }));
    saveStockLedger([...ledger, ...newLedgerEntries]);

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigate('/submissions');
    }, 1500);
  };

  const formatNum = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const ingredientOptions = [
    { id: 'rice', label: t('rice') },
    { id: 'dal', label: t('dal') },
    { id: 'oil', label: t('oil') },
    { id: 'chickpeas', label: t('chickpeas') },
    { id: 'greenBeans', label: t('greenBeans') },
    { id: 'veg', label: t('vegetables') },
    { id: 'grocery', label: t('grocery') },
    { id: 'gas', label: t('gas') },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">
            {language === 'ta' ? 'தினசரி அறிக்கை' : 'Daily Meal Report'}
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Automatic Calculation & Submission</p>
        </div>
        <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-black rounded-xl border border-amber-100">
          {SchoolTypeLabels[mySchoolType!][language]}
        </div>
      </div>

      {success && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={20} />
          <span className="font-bold text-sm">{language === 'ta' ? 'சேமிக்கப்பட்டது!' : 'Saved!'}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-zinc-800">
             <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight ml-1">{t('date')}</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        type="date" 
                        required
                        disabled={!!editId}
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 transition-all tabular-nums" 
                      />
                    </div>
                  </div>

                  {isMiddleSchool && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight ml-1">Section</label>
                      <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border-2 border-slate-100 dark:border-zinc-700">
                        <button
                          type="button"
                          disabled={!!editId}
                          onClick={() => setReportSection('PRIMARY')}
                          className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${
                            reportSection === 'PRIMARY' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          Primary
                        </button>
                        <button
                          type="button"
                          disabled={!!editId}
                          onClick={() => setReportSection('MIDDLE')}
                          className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${
                            reportSection === 'MIDDLE' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          Middle
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-tight block text-center">
                    {language === 'ta' ? 'மாணவர் வருகை' : 'Student Attendance'}
                  </label>
                  <div className="relative group mx-auto max-w-[280px]">
                    <input 
                      type="number" 
                      required
                      disabled={isAlreadySubmitted && !editId}
                      value={students === 0 ? '' : students} 
                      onChange={(e) => setStudents(Number(e.target.value))} 
                      className="w-full py-8 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 focus:border-emerald-500 rounded-[2rem] font-black text-5xl text-center outline-none transition-all tabular-nums" 
                      placeholder="0" 
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-200 pointer-events-none group-focus-within:opacity-0 transition-opacity">
                      <Users size={32} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                   <div className="flex items-center space-x-2 text-slate-400 ml-1">
                      <Info size={14} />
                      <h2 className="text-[11px] font-black uppercase tracking-tight">
                        {language === 'ta' ? 'பயன்படுத்தப்பட்ட பொருட்கள்' : 'Daily Items Selection'}
                      </h2>
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {ingredientOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggleItem(opt.id)}
                          className={`flex items-center space-x-2 p-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase text-left ${
                            selectedItems.has(opt.id)
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                              : 'bg-slate-50 border-slate-100 text-slate-400'
                          }`}
                        >
                          {selectedItems.has(opt.id) ? <CheckSquare size={16} className="shrink-0" /> : <Square size={16} className="shrink-0" />}
                          <span className="truncate leading-tight">{opt.label}</span>
                        </button>
                      ))}
                   </div>
                </div>

                {error && (
                  <div className="bg-rose-50 text-rose-600 p-3 rounded-xl flex items-center space-x-3 font-bold text-xs border border-rose-100">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                {(!isAlreadySubmitted || editId) && (
                  <button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-emerald-600/10 uppercase text-xs flex items-center justify-center space-x-3 active:scale-[0.98]"
                  >
                    <span>{editId ? 'Update Report' : 'Confirm Submission'}</span>
                    <ChevronRight size={18} />
                  </button>
                )}
             </form>
          </div>
        </div>

        {/* Info Column with Breakdown */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-zinc-900 text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden border border-zinc-800">
             <div className="absolute -top-10 -right-10 opacity-5 rotate-12 scale-150"><Calculator size={180} /></div>
             
             <section className="mb-10">
                <h2 className="text-[11px] font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-4 text-emerald-500">Stock Consumption</h2>
                <div className="space-y-4">
                   {calculations.filter(c => !c.id.startsWith('COST_')).map((calc) => (
                     <div key={calc.id} className={`flex justify-between items-center transition-opacity ${!selectedItems.has(calc.id) ? 'opacity-10' : 'opacity-100'}`}>
                       <span className="text-zinc-500 font-black uppercase text-[10px]">{calc.name}</span>
                       <div className="flex items-baseline space-x-2">
                         <span className="text-2xl font-black text-white tabular-nums">{formatNum(calc.quantity)}</span>
                         <span className="text-[9px] font-bold uppercase text-emerald-600">{calc.unit}</span>
                       </div>
                     </div>
                   ))}
                </div>
             </section>

             <section>
                <h2 className="text-[11px] font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-4 text-amber-500">Price Calculation</h2>
                <div className="space-y-4">
                   {[
                     { label: t('vegetables'), val: financialBreakdown.veg, active: selectedItems.has('veg') },
                     { label: t('grocery'), val: financialBreakdown.grocery, active: selectedItems.has('grocery') },
                     { label: t('gas'), val: financialBreakdown.gas, active: selectedItems.has('gas') },
                   ].map((cost, idx) => (
                     <div key={idx} className={`flex justify-between items-center transition-opacity ${!cost.active ? 'opacity-10' : 'opacity-100'}`}>
                        <span className="text-zinc-500 font-black uppercase text-[10px]">{cost.label}</span>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-[10px] font-bold text-amber-600">₹</span>
                          <span className="text-xl font-black text-white tabular-nums">{formatNum(cost.val)}</span>
                        </div>
                     </div>
                   ))}
                </div>
             </section>

             <div className="mt-12 p-6 bg-white/5 rounded-2xl border-2 border-white/10 backdrop-blur-md">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Total Estimated Cost</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-amber-400">₹</span>
                    <span className="text-5xl font-black text-white tabular-nums">{formatNum(totalCost)}</span>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DailyMealReport;
