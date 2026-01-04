
import React, { useState, useMemo, useEffect } from 'react';
import { getOrganizers, saveOrganizers } from '../../storage';
import { Organizer, SchoolType, SchoolTypeLabels } from '../../types';
import { TAMIL_NADU_DISTRICTS } from '../../constants';
import { useLanguage } from '../../context/LanguageContext';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  UserPlus, Search, Trash2, X, Check, 
  Share2, Phone, Mail, School as SchoolIcon, 
  Key, Globe, Loader2, Building2, Edit2, AlertCircle, Eye, User, MapPin, ChevronRight,
  Keyboard
} from 'lucide-react';

const OrganizerManagement: React.FC = () => {
  const { t, language } = useLanguage();
  const [organizers, setOrganizers] = useState<Organizer[]>(() => getOrganizers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrganizer, setViewingOrganizer] = useState<Organizer | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFetchingSchools, setIsFetchingSchools] = useState(false);
  const [suggestedSchools, setSuggestedSchools] = useState<{en: string, ta: string}[]>([]);
  const [isManualSchoolEntry, setIsManualSchoolEntry] = useState(false);
  
  // Toast Notification State
  const [toast, setToast] = useState<{ msg: string; type: 'error' | 'success' } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    schoolName: '',
    email: '',
    phone: '',
    schoolType: SchoolType.PRIMARY,
    district: '',
    taluk: '',
    town: '',
    initialPassword: '',
  });

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filteredOrganizers = useMemo(() => {
    return organizers.filter(o => 
      `${o.firstName} ${o.lastName} ${o.id} ${o.schoolName} ${o.district}`.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }, [organizers, searchTerm]);

  useEffect(() => {
    if (formData.district && formData.schoolType && !isManualSchoolEntry) {
      fetchSchoolsFromAI();
    }
  }, [formData.district, formData.schoolType, isManualSchoolEntry]);

  const fetchSchoolsFromAI = async () => {
    setIsFetchingSchools(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `List 20 Government ${formData.schoolType} schools in ${formData.district}, Tamil Nadu. 
      Return JSON array of objects: {"en": "School Name", "ta": "பள்ளி பெயர்"}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                en: { type: Type.STRING },
                ta: { type: Type.STRING }
              },
              required: ["en", "ta"]
            }
          }
        },
      });

      let schools = JSON.parse(response.text);
      setSuggestedSchools(schools);
    } catch (error) {
      console.error("Fetch error", error);
      setSuggestedSchools([]);
      setIsManualSchoolEntry(true);
    } finally {
      setIsFetchingSchools(false);
    }
  };

  const showToast = (msg: string, type: 'error' | 'success') => {
    setToast({ msg, type });
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast(language === 'ta' ? "பெயர் தேவை" : "Name is required", 'error');
      return false;
    }
    if (!formData.district) {
      showToast(language === 'ta' ? "மாவட்டம் தேவை" : "District required", 'error');
      return false;
    }
    if (!formData.schoolName.trim()) {
      showToast(language === 'ta' ? "பள்ளி பெயர் தேவை" : "School name required", 'error');
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      showToast(language === 'ta' ? "தவறான மின்னஞ்சல்" : "Invalid email format", 'error');
      return false;
    }
    if (formData.phone.length !== 10 || isNaN(Number(formData.phone))) {
      showToast(language === 'ta' ? "தவறான தொலைபேசி எண்" : "Invalid 10-digit phone", 'error');
      return false;
    }
    return true;
  };

  const generateId = (districtNameEn: string) => {
    const year = new Date().getFullYear().toString().slice(-2);
    const districtObj = TAMIL_NADU_DISTRICTS.find(d => d.nameEn === districtNameEn);
    const rto = districtObj?.rto || '00';
    const districtCount = organizers.filter(o => o.district === districtNameEn).length + 1;
    return `${year}NMO${districtCount}${rto}`;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let updated: Organizer[];
    if (editingId) {
      updated = organizers.map(o => o.id === editingId ? { ...o, ...formData } : o);
      showToast(language === 'ta' ? "புதுப்பிக்கப்பட்டது" : "Updated Successfully", 'success');
    } else {
      const newOrganizer: Organizer = {
        ...formData,
        id: generateId(formData.district),
        password: formData.initialPassword || Math.random().toString(36).slice(-6).toUpperCase(),
        createdAt: new Date().toISOString(),
      };
      updated = [...organizers, newOrganizer];
      showToast(language === 'ta' ? "சேர்க்கப்பட்டது" : "Added Successfully", 'success');
    }

    setOrganizers(updated);
    saveOrganizers(updated);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setIsManualSchoolEntry(false);
    setFormData({
      firstName: '', lastName: '', schoolName: '', email: '', phone: '',
      schoolType: SchoolType.PRIMARY, district: '', taluk: '', town: '', initialPassword: '',
    });
    setSuggestedSchools([]);
  };

  const handleEdit = (org: Organizer) => {
    setEditingId(org.id);
    setFormData({
      firstName: org.firstName,
      lastName: org.lastName,
      schoolName: org.schoolName,
      email: org.email,
      phone: org.phone,
      schoolType: org.schoolType,
      district: org.district,
      taluk: org.taluk || '',
      town: org.town || '',
      initialPassword: org.password,
    });
    setIsManualSchoolEntry(true); // Default to manual when editing to preserve exact name
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(language === 'ta' ? "நிச்சயமாக நீக்க வேண்டுமா?" : "Delete this organizer?")) {
      const updated = organizers.filter(o => o.id !== id);
      setOrganizers(updated);
      saveOrganizers(updated);
      showToast(language === 'ta' ? "நீக்கப்பட்டது" : "Deleted Successfully", 'success');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Small Toast System */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4 duration-300">
          <div className={`px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
            toast.type === 'success' 
            ? 'bg-emerald-600/90 border-emerald-400 text-white' 
            : 'bg-rose-600/90 border-rose-400 text-white'
          }`}>
            {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-relaxed">{t('organizers')}</h1>
           <p className="text-[11px] font-bold text-slate-400 uppercase mt-1 leading-relaxed">District Coordinators Hub</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase transition-all active:scale-95 shadow-lg shadow-emerald-600/10"
        >
          <UserPlus size={16} />
          <span>{t('addOrganizer')}</span>
        </button>
      </div>

      <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm focus:border-emerald-500 outline-none text-sm font-bold transition-all"
          />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="divide-y-2 divide-slate-50 dark:divide-zinc-800">
           {filteredOrganizers.length > 0 ? (
             filteredOrganizers.map((org) => (
               <div key={org.id} onClick={() => setViewingOrganizer(org)} className="p-5 md:p-6 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                       <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded leading-relaxed border border-emerald-100 dark:border-emerald-800 tabular-nums uppercase">{org.id}</span>
                       <span className="text-[9px] font-black text-slate-300 dark:text-zinc-600 uppercase tracking-wider truncate">{org.district}</span>
                    </div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight mb-1 truncate">{org.firstName} {org.lastName}</h3>
                    <p className="text-[11px] font-bold text-slate-400 truncate leading-relaxed break-words max-w-lg">{org.schoolName}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
               </div>
             ))
           ) : (
             <div className="py-20 text-center">
                <Building2 size={48} className="mx-auto text-slate-100 mb-4" />
                <p className="text-[11px] font-bold text-slate-300 uppercase">{t('noSchoolsFound')}</p>
             </div>
           )}
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-2 border-zinc-800">
            <div className="px-8 py-5 bg-emerald-600 text-white flex justify-between items-center shrink-0">
               <h2 className="text-sm font-black uppercase tracking-wider">{editingId ? t('edit') : t('addOrganizer')}</h2>
               <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-1 hover:rotate-90 transition-transform"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b-2 border-slate-50 dark:border-zinc-800 pb-2">
                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">School Context</h3>
                    <button 
                      type="button" 
                      onClick={() => { setIsManualSchoolEntry(!isManualSchoolEntry); setFormData({...formData, schoolName: ''}); }}
                      className="text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 flex items-center gap-1 transition-colors"
                    >
                      {isManualSchoolEntry ? <Globe size={10}/> : <Keyboard size={10}/>}
                      {isManualSchoolEntry ? 'Switch to AI' : 'Manual Entry'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t('district')} *</label>
                      <select required value={formData.district} onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value, schoolName: '' }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-colors">
                        <option value="">-- {t('district')} --</option>
                        {TAMIL_NADU_DISTRICTS.map((d) => (
                          <option key={d.nameEn} value={d.nameEn}>{language === 'ta' ? d.name : d.nameEn}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t('schoolType')} *</label>
                      <select required value={formData.schoolType} onChange={(e) => setFormData({...formData, schoolType: e.target.value as SchoolType, schoolName: ''})}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-colors">
                        {Object.entries(SchoolTypeLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label[language]}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t('schoolName')} *</label>
                      <div className="relative group">
                        {isManualSchoolEntry ? (
                          <div className="relative">
                            <input 
                              type="text" 
                              required
                              value={formData.schoolName}
                              onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                              placeholder="Enter official school name"
                              className="w-full px-4 py-3 bg-emerald-50/20 dark:bg-zinc-950 border-2 border-emerald-500/20 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all"
                            />
                            <Keyboard size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300" />
                          </div>
                        ) : (
                          <div className="relative">
                            <select 
                              required 
                              disabled={!formData.district || isFetchingSchools} 
                              value={formData.schoolName} 
                              onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                              className="w-full pl-4 pr-10 py-3 bg-emerald-50/20 dark:bg-zinc-950 border-2 border-emerald-500/20 dark:border-zinc-800 rounded-xl text-[11px] font-black outline-none appearance-none truncate leading-relaxed focus:border-emerald-500 transition-all"
                            >
                              <option value="">{isFetchingSchools ? t('fetching') : `-- ${t('selectSchool')} --`}</option>
                              {suggestedSchools.map((s, idx) => (
                                <option key={idx} value={language === 'ta' ? s.ta : s.en}>
                                  {language === 'ta' ? s.ta : s.en}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              {isFetchingSchools ? <Loader2 size={16} className="text-emerald-600 animate-spin" /> : <Globe size={16} className="text-emerald-300" />}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest border-b-2 border-slate-50 dark:border-zinc-800 pb-2">{t('organizer')} Credentials</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t('firstName')} *</label>
                      <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t('lastName')} *</label>
                      <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t('email')} *</label>
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t('phone')} *</label>
                    <input required type="tel" maxLength={10} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 tabular-nums" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t('password')} *</label>
                    <input type="text" value={formData.initialPassword} onChange={(e) => setFormData({...formData, initialPassword: e.target.value})}
                      placeholder="Auto-gen if empty"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none font-mono focus:border-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-slate-50 dark:border-zinc-800">
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest px-4">{t('cancel')}</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                  {editingId ? 'Update Organizer' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organizer Info Modal */}
      {viewingOrganizer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
           <div className="bg-white dark:bg-zinc-900 rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border-2 border-zinc-800">
              <div className="p-8 bg-emerald-600 text-white flex justify-between items-center">
                 <div className="flex items-center space-x-4">
                   <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><User size={24} /></div>
                   <div>
                     <h2 className="text-base font-black uppercase tracking-wider leading-none">Organizer Profile</h2>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 mt-2">{viewingOrganizer.id}</p>
                   </div>
                 </div>
                 <button onClick={() => setViewingOrganizer(null)} className="p-1 hover:rotate-90 transition-transform"><X size={24} /></button>
              </div>
              
              <div className="p-8 md:p-10 space-y-7">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('schoolName')}</p>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight mb-2">{viewingOrganizer.schoolName}</h3>
                    <span className="text-[9px] font-black bg-slate-100 dark:bg-zinc-800 text-slate-500 px-3 py-1 rounded-full uppercase">
                      {SchoolTypeLabels[viewingOrganizer.schoolType][language]}
                    </span>
                 </div>

                 <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-slate-50 dark:border-zinc-800">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('firstName')}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">{viewingOrganizer.firstName} {viewingOrganizer.lastName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('district')}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">{viewingOrganizer.district}</p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4">
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-slate-100 dark:border-zinc-700">
                       <Mail size={18} className="text-emerald-600" />
                       <span className="text-xs font-bold truncate flex-1">{viewingOrganizer.email}</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-slate-100 dark:border-zinc-700">
                       <Phone size={18} className="text-emerald-600" />
                       <span className="text-xs font-bold tabular-nums">{viewingOrganizer.phone}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-emerald-950 text-emerald-100 rounded-2xl border-2 border-emerald-900">
                       <div className="flex items-center space-x-4">
                          <Key size={18} className="text-amber-400" />
                          <span className="text-xs font-black font-mono tracking-wider tabular-nums uppercase">{viewingOrganizer.password}</span>
                       </div>
                       <button onClick={() => { navigator.clipboard.writeText(viewingOrganizer.password); showToast('Copied', 'success'); }} className="text-[9px] font-black uppercase hover:text-white transition-colors bg-white/10 px-3 py-1 rounded-lg">Copy</button>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 pt-6">
                    <button 
                       onClick={() => { handleEdit(viewingOrganizer); setViewingOrganizer(null); }}
                       className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-emerald-600/10"
                    >
                      {t('edit')}
                    </button>
                    <button 
                       onClick={() => { handleDelete(viewingOrganizer.id); setViewingOrganizer(null); }}
                       className="p-4 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors active:scale-95 border-2 border-rose-100"
                    >
                      <Trash2 size={20} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerManagement;
