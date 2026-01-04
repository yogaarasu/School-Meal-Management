
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-2">
      {/* Theme Toggle - Top of settings section as requested */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-between w-full px-3 py-2 bg-white/5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 border border-white/5"
      >
        <span className="text-[10px] font-black uppercase tracking-widest">
          {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
        </span>
        <span className="text-[10px] font-black uppercase">{theme === 'light' ? '🌕' : '☀️'}</span>
      </button>

      {/* Language Toggle - Text only, no icons */}
      <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5 overflow-hidden">
        <button
          onClick={() => setLanguage('en')}
          className={`flex-1 py-1.5 text-[10px] font-black rounded transition-all duration-200 ${
            language === 'en' ? 'bg-white text-emerald-900 shadow-sm' : 'text-white/40 hover:text-white/80'
          }`}
        >
          ENGLISH
        </button>
        <button
          onClick={() => setLanguage('ta')}
          className={`flex-1 py-1.5 text-[10px] font-black rounded transition-all duration-200 ${
            language === 'ta' ? 'bg-white text-emerald-900 shadow-sm' : 'text-white/40 hover:text-white/80'
          }`}
        >
          தமிழ்
        </button>
      </div>
    </div>
  );
};

export default LanguageToggle;
