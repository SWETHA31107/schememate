import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, Filter, AlertCircle, Check, Bookmark, BookmarkCheck, Scale, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const subCats = {
  loan: ['Home Loan', 'Education Loan', 'Personal Loan', 'Business Loan', 'Gold Loan'],
  savings: ['Fixed Deposit', 'Recurring Deposit', 'Savings Account', 'Sukanya Samriddhi Yojana', 'PPF'],
  insurance: ['Life Insurance', 'Health Insurance', 'Motor Insurance', 'Crop Insurance'],
  pension: ['Atal Pension Yojana', 'Old Age Pension', 'NPS'],
  student: ['Higher Education Scholarship', 'Study Abroad Loan', 'Skill Development'],
  housing: ['Urban Housing Support', 'Rural Home Renovation', 'Affordable Housing Scheme', 'PMAY Urban'],
  business: ['Startup Growth Fund', 'MSME Support', 'Women Entrepreneurship Initiative'],
  marriage: ['Community Marriage Support', 'Wedding Savings Scheme'],
  health: ['Comprehensive Health Cover', 'Maternity Benefit', 'Senior Citizen Healthcare'],
  child: ['Child Education Fund', 'Child Health Savings'],
  agriculture: ['Kisan Credit Card', 'Pradhan Mantri Fasal Bima Yojana', 'Soil Health Card', 'PM Kisan Samman Nidhi'],
  education: ['Merit Scholarship', 'Post-Matric Scholarship', 'Pre-Matric Scholarship'],
  employment: ['PMKVY Skill India', 'NRLM Livelihood Support', 'MGNREGA Employment Guarantee'],
  women_welfare: ['Beti Bachao Beti Padhao', 'Mahila Shakti Kendra', 'One Stop Centre', 'Ujjwala Yojana'],
  child_welfare: ['Integrated Child Development Service', 'POCSO Legal Aid', 'Bal Shakti Award'],
  senior_citizen: ['Indira Gandhi National Old Age Pension', 'Senior Citizen Savings Scheme', 'Ayushman Bharat Senior'],
  disability: ['ADIP Scheme', 'Disability Pension', 'Accessible India Campaign Grant']
};

const SchemeListing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const { addNotification } = useNotification();
  const compareAlertShownRef = useRef(false);
  
  const [compareList, setCompareList] = useState(() => {
    const saved = localStorage.getItem('compareIds');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedSchemes, setSavedSchemes] = useState(() => {
    const saved = localStorage.getItem('savedSchemes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const states = [
    'National', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 
    'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 
    'Lakshadweep', 'Puducherry'
  ];

  const communities = ['General', 'OBC', 'BC', 'MBC', 'SC', 'ST'];

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    provider: '',
    state: '',
    gender: 'All',
    community: '',
    maritalStatus: 'All',
    age: '',
    interestRate: ''
  });

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.provider) queryParams.append('provider', filters.provider);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.gender !== 'All') queryParams.append('gender', filters.gender);
      if (filters.community) queryParams.append('community', filters.community);
      if (filters.maritalStatus !== 'All') queryParams.append('maritalStatus', filters.maritalStatus);
      if (filters.age) queryParams.append('age', filters.age);
      if (filters.interestRate) queryParams.append('interestRate', filters.interestRate);
      
      const { data } = await api.get(`/schemes?${queryParams.toString()}`);
      // Hard limit to 500 results as per user request
      setSchemes(data.slice(0, 500));
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSchemes();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleCompareToggle = (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const isInCompare = compareList.includes(id);
    let newList = compareList;

    if (isInCompare) {
      newList = compareList.filter(item => item !== id);
      compareAlertShownRef.current = false;
    } else if (compareList.length < 3) {
      newList = [...compareList, id];
    } else {
      if (!compareAlertShownRef.current) {
        addNotification("You can compare up to 3 schemes only", 'warning');
        compareAlertShownRef.current = true;
      }
      return;
    }

    setCompareList(newList);
    localStorage.setItem('compareIds', JSON.stringify(newList));
  };

  const handleSaveToggle = (id, e) => {
    e.stopPropagation();
    e.preventDefault();

    const isSaved = savedSchemes.includes(id);
    const newList = isSaved 
      ? savedSchemes.filter(item => item !== id)
      : [...savedSchemes, id];

    setSavedSchemes(newList);
    localStorage.setItem('savedSchemes', JSON.stringify(newList));

    if (isSaved) {
      addNotification("Scheme removed from saved", 'info');
    } else {
      addNotification("Scheme saved successfully!", 'success');
    }
  };

  const handleCompareGo = () => {
    if (compareList.length >= 2) {
      navigate('/compare');
    } else {
      addNotification("Please select at least 2 schemes to compare.", 'warning');
    }
  };

  const handleClearCompare = () => {
    setCompareList([]);
    localStorage.removeItem('compareIds');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{t('schemes.title')}</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-slate-500 underline decoration-primary-500/30 underline-offset-4">{t('schemes.subtitle')}</p>
          </div>
        </div>
        {!loading && (
          <div className="bg-primary-50 dark:bg-primary-900/30 px-6 py-3 rounded-2xl border border-primary-100 dark:border-primary-800 shadow-sm flex items-center gap-3">
             <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
             <span className="text-primary-900 dark:text-primary-100 font-black text-xl leading-none">{schemes.length}</span>
             <span className="text-primary-600 dark:text-primary-400 font-bold uppercase tracking-widest text-xs">{t('schemes.found_suffix')}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Responsive Sidebar Filters */}
        <div className="w-full lg:w-1/4 shrink-0">
          <div className="card p-6 lg:sticky lg:top-24 space-y-6 lg:max-h-[80vh] lg:overflow-y-auto custom-scrollbar animate-fade-in-left shadow-xl border-slate-200/50">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 pb-4 pt-2 -mt-2 -mx-2 px-2">
              <Filter className="text-primary-600" size={22} />
              <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-wider">{t('schemes.filters_title')}</h3>
            </div>

            {/* Filter Grid - 1 col on mobile, 2 cols on tablet, 1 col on desktop sidebar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500">{t('schemes.category')}</label>
                <select name="category" className="input-field w-full" value={filters.category} onChange={handleFilterChange}>
                  <option value="">{t('schemes.all_categories')}</option>
                  {Object.keys(subCats).map(cat => (
                    <option key={cat} value={cat}>{t(`schemes.cat.${cat}`) || cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500">{t('schemes.provider')}</label>
                <select name="provider" className="input-field w-full" value={filters.provider} onChange={handleFilterChange}>
                  <option value="">{t('schemes.all_providers')}</option>
                  <option value="government">{t('schemes.prov.government')}</option>
                  <option value="private">{t('schemes.prov.private')}</option>
                  <option value="corporate">{t('schemes.prov.corporate')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500">{t('schemes.state')}</label>
                <select name="state" className="input-field w-full" value={filters.state} onChange={handleFilterChange}>
                  <option value="">{t('schemes.all_states')}</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500">{t('schemes.age')}</label>
                <input 
                  type="number" name="age" className="input-field w-full" 
                  placeholder="e.g. 25" min="1" max="120"
                  value={filters.age} onChange={handleFilterChange} 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500">{t('schemes.gender')}</label>
                <select name="gender" className="input-field w-full" value={filters.gender} onChange={handleFilterChange}>
                  <option value="All">{t('schemes.gender_all')}</option>
                  <option value="Female">{t('schemes.gender_female')}</option>
                  <option value="Male">{t('schemes.gender_male')}</option>
                  <option value="Other">{t('schemes.gender_others')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500">{t('schemes.community')}</label>
                <select name="community" className="input-field w-full" value={filters.community} onChange={handleFilterChange}>
                  <option value="">{t('schemes.all_communities')}</option>
                  {communities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500">{t('schemes.max_interest_rate')}</label>
                <input 
                  type="number" name="interestRate" className="input-field w-full" 
                  placeholder="e.g. 7.5" step="0.1"
                  value={filters.interestRate} onChange={handleFilterChange} 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setFilters({search: filters.search, category: '', provider: '', state: '', gender: 'All', community: '', maritalStatus: 'All', age: '', interestRate: ''})}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 font-black text-xs uppercase tracking-widest transition-all"
              >
                <X size={14} /> {t('schemes.clear_filters')}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text" name="search"
              className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl py-5 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
              placeholder={t('schemes.search_placeholder')}
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : schemes.length === 0 ? (
            <div className="card p-16 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 opacity-60">
              <AlertCircle className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <p className="text-xl font-bold text-slate-500">{t('schemes.not_found')}</p>
              <button onClick={() => setFilters({search: '', category: '', provider: '', state: '', gender: 'All', community: '', maritalStatus: 'All', age: '', interestRate: ''})} className="mt-4 text-primary-600 font-black uppercase tracking-widest text-sm hover:underline">Reset Search</button>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {schemes.slice(0, visibleCount).map((scheme, index) => (
                  <div key={scheme._id} className="relative group">
                    <Link 
                      to={`/schemes/${scheme._id}`} 
                      className="card flex flex-col h-full hover:shadow-2xl hover:-translate-y-2 hover:border-primary-500/30 transition-all duration-500 overflow-hidden group animate-fade-in-up shadow-lg border border-slate-100 dark:border-slate-800"
                      style={{ animationDelay: `${index % 6 * 100}ms` }}
                    >
                      <div className="p-8 flex-1">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-wrap gap-2">
                             <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-[10px] font-black uppercase tracking-widest rounded-lg">
                               {t(`schemes.cat.${scheme.category?.toLowerCase()}`) || scheme.category}
                             </span>
                             <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                               {scheme.state}
                             </span>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={(e) => handleSaveToggle(scheme._id, e)} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all">
                              {savedSchemes.includes(scheme._id) ? <BookmarkCheck className="text-primary-600 fill-primary-600" /> : <Bookmark className="text-slate-400" />}
                            </button>
                            <button onClick={(e) => handleCompareToggle(scheme._id, e)} className={`p-2 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all ${compareList.includes(scheme._id) ? 'bg-primary-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>
                              <Scale size={20} />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-4 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors min-h-[3rem] flex items-center">
                          {scheme.schemeName}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-3 mb-6 leading-relaxed min-h-[3.5rem]">
                          {scheme.description}
                        </p>
                      </div>

                      <div className="mt-auto px-8 py-5 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center group-hover:bg-primary-500/5 transition-colors">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('schemes.interest_rate')}</p>
                           <p className="text-xl font-black text-slate-900 dark:text-white">{scheme.interestRate > 0 ? `${scheme.interestRate}%` : 'FREE'}</p>
                        </div>
                        <span className="flex items-center gap-2 text-primary-600 font-black text-xs uppercase tracking-tighter group-hover:translate-x-2 transition-transform">
                          {t('schemes.view_details')} <ChevronDown className="-rotate-90" size={16} />
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {schemes.length > visibleCount && (
                <div className="flex justify-center">
                  <button onClick={() => setVisibleCount(prev => prev + 10)} className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-sm rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl">
                    {t('schemes.view_more_results')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {compareList.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up w-full max-w-lg px-4">
          <div className="bg-slate-900 dark:bg-slate-800 text-white p-5 rounded-3xl shadow-2xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center font-black">{compareList.length}</div>
               <div>
                  <p className="font-black uppercase text-xs tracking-widest">{t('schemes.compare_ready')}</p>
                  <p className="text-[10px] text-slate-400">{t('schemes.compare_selection_info')}</p>
               </div>
            </div>
            <div className="flex gap-3">
               <button onClick={handleClearCompare} className="p-3 text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
               <button onClick={handleCompareGo} disabled={compareList.length < 2} className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${compareList.length < 2 ? 'bg-slate-800 text-slate-600' : 'bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/30'}`}>
                 {t('compare.btn_compare')}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeListing;
