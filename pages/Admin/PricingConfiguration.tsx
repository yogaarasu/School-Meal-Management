
import React, { useState } from 'react';
import { SchoolType, GlobalPricingConfig, PortionConfig, SchoolTypeLabels } from '../../types';
import { getPricingConfig, savePricingConfig } from '../../storage';
import { Save, Scale, BadgeIndianRupee, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const PricingConfiguration: React.FC = () => {
  const { t, language } = useLanguage();
  const [config, setConfig] = useState<GlobalPricingConfig>(() => getPricingConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [activeType, setActiveType] = useState<SchoolType>(SchoolType.PRIMARY);

  const handleSave = () => {
    savePricingConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const updateVal = (sType: SchoolType, field: keyof PortionConfig, val: number) => {
    setConfig(prev => ({
      ...prev,
      [sType]: {
        ...prev[sType],
        [field]: val
      }
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      {saveSuccess && (
        <div className="fixed top-24 md:top-10 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-emerald-500 animate-in slide-in-from-top-4">
          <CheckCircle size={22} />
          <span className="font-black text-xs uppercase tracking-widest">{language === 'ta' ? 'சேமிக்கப்பட்டது!' : 'SAVED SUCCESSFULLY'}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[2rem] border-2 border-slate-100 dark:border-zinc-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase leading-relaxed">{t('pricing')}</h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Configure Ration and Allowances</p>
        </div>
        <button 
          onClick={handleSave}
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 font-black text-xs uppercase shadow-xl shadow-emerald-600/10"
        >
          <Save size={18} />
          <span>{t('save')}</span>
        </button>
      </header>

      {/* Fixed Grid Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.values(SchoolType).map(st => (
          <button
            key={st}
            onClick={() => setActiveType(st)}
            className={`py-4 px-6 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all border-2 text-center ${
              activeType === st 
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl scale-[1.02]' 
                : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 text-slate-400'
            }`}
          >
            {SchoolTypeLabels[st][language]}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Quantity Settings - Top */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 shadow-xl border-2 border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-4 mb-10 border-b border-slate-50 dark:border-zinc-800 pb-5">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 rounded-xl border border-emerald-100">
              <Scale size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-tight">{t('quantitySettings')}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Grams/ML per student</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { id: 'riceGrams', label: t('rice'), unit: 'g' },
              { id: 'dalGrams', label: t('dal'), unit: 'g' },
              { id: 'oilMl', label: t('oil'), unit: 'ml' },
              { id: 'chickpeasGrams', label: t('chickpeas'), unit: 'g' },
              { id: 'greenBeansGrams', label: t('greenBeans'), unit: 'g' },
            ].map(field => (
              <div key={field.id} className="p-5 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border-2 border-slate-200 dark:border-zinc-700">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 block text-center truncate">
                  {field.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config[activeType][field.id as keyof PortionConfig]}
                    onChange={(e) => updateVal(activeType, field.id as keyof PortionConfig, Number(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-950 px-3 py-3 rounded-xl text-center font-black text-xl text-emerald-800 dark:text-emerald-400 outline-none border-2 border-slate-200 dark:border-zinc-800 focus:border-emerald-500 tabular-nums"
                  />
                  <span className="text-[9px] font-black text-slate-300 uppercase">{field.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Settings - Bottom */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 shadow-xl border-2 border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-4 mb-10 border-b border-slate-50 dark:border-zinc-800 pb-5">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl border border-amber-100">
              <BadgeIndianRupee size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-tight">{t('expenseSettings')}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Financial allowance per student</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'vegPrice', label: t('vegetables') },
              { id: 'groceryPrice', label: t('grocery') },
              { id: 'gasPrice', label: t('gas') },
            ].map(field => (
              <div key={field.id} className="p-6 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border-2 border-slate-200 dark:border-zinc-700">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 block text-center">
                  {field.label}
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-amber-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={config[activeType][field.id as keyof PortionConfig]}
                    onChange={(e) => updateVal(activeType, field.id as keyof PortionConfig, Number(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-950 px-4 py-3 rounded-xl text-center font-black text-2xl text-slate-900 dark:text-white outline-none border-2 border-slate-200 dark:border-zinc-800 focus:border-amber-500 tabular-nums"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-zinc-900 rounded-3xl border-2 border-zinc-800 flex flex-col items-center">
            <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-2">Total Daily Cost</p>
            <p className="text-5xl font-black text-white tracking-tighter tabular-nums">
              ₹ {(config[activeType].vegPrice + config[activeType].groceryPrice + config[activeType].gasPrice).toFixed(3)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingConfiguration;
