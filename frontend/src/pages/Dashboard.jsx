import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Activity, Target, Award, User, Mail, Phone, MapPin, Briefcase, Users, Heart, Banknote, Calendar, ChevronRight, Sparkles, Quote, Info, ExternalLink, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState([]);
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState('recommended');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: recData } = await api.post('/recommend');
      setRecommendations(recData);

      // Load saved schemes from localStorage IDs
      const savedIds = JSON.parse(localStorage.getItem('savedSchemes') || '[]');
      if (savedIds.length > 0) {
        const { data: allSchemes } = await api.get('/schemes');
        const matched = allSchemes.filter(s => savedIds.includes(s._id));
        setSavedSchemes(matched);
      }
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = (id) => {
    const savedIds = JSON.parse(localStorage.getItem('savedSchemes') || '[]');
    const newList = savedIds.filter(itemId => itemId !== id);
    localStorage.setItem('savedSchemes', JSON.stringify(newList));
    
    // Update local state to reflect UI change immediately
    setSavedSchemes(prev => prev.filter(s => s._id !== id));
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkBg transition-colors">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={48} className="animate-spin text-primary-500" />
        <p className="text-slate-500 font-bold animate-pulse">Personalizing your experience...</p>
      </div>
    </div>
  );

  const motivationalQuotes = [
    t('dashboard.motivation_quote') || "Small steps today lead to big financial success tomorrow."
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg transition-colors py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="mb-10 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 text-white shadow-2xl animate-fade-in">
          <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-1/4 -translate-y-1/4">
             <Sparkles size={240} className="text-white" />
          </div>
          <div className="relative p-10 sm:p-14 z-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl">
                  <User size={48} className="text-white" />
               </div>
               <div className="text-center md:text-left flex-1">
                  <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight mb-3">
                    Hello, {user?.name.split(' ')[0]}! 👋
                  </h1>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 opacity-90">
                     <div className="flex items-center gap-2 text-sm font-bold bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                        <Quote size={16} className="text-primary-300" />
                        <span className="italic">"{motivationalQuotes[0]}"</span>
                     </div>
                  </div>
               </div>
               <Link 
                to="/edit-profile" 
                className="px-8 py-3 bg-white text-primary-700 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-50 transition-all shadow-xl hover:scale-105 active:scale-95"
               >
                 Profile Settings
               </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Sidebar - Comprehensive Profile */}
          <div className="lg:col-span-4 space-y-8">
            <div className="card p-8 rounded-[2rem] border-0 shadow-xl bg-white dark:bg-slate-800 relative overflow-hidden group">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-2xl"><Users size={24} /></div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Your Profile Summary</h3>
               </div>

               <div className="space-y-5">
                  <ProfileDetail icon={<Mail size={18}/>} label="Email" value={user?.email}/>
                  <ProfileDetail icon={<Phone size={18}/>} label="Mobile" value={user?.mobile}/>
                  <ProfileDetail icon={<Calendar size={18}/>} label="Age" value={(user?.age !== undefined && user?.age !== null) ? `${user.age} Yrs` : 'Not Specified'}/>
                  <ProfileDetail icon={<Calendar size={18}/>} label="Date of Birth" value={user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not Specified'}/>
                  <ProfileDetail icon={<Banknote size={18}/>} label="Annual Income" value={`₹${user?.income?.toLocaleString()}`}/>
                  <ProfileDetail icon={<Briefcase size={18}/>} label="Employment" value={user?.jobType} capitalize/>
                  <ProfileDetail icon={<User size={18}/>} label="Gender" value={user?.gender} capitalize/>
                  <ProfileDetail icon={<Users size={18}/>} label="Community" value={user?.community}/>
                  <ProfileDetail icon={<MapPin size={18}/>} label="Location" value={user?.state}/>
                  <ProfileDetail icon={<Heart size={18}/>} label="Marital Status" value={user?.maritalStatus}/>
               </div>

               <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-700">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Financial Interests</h4>
                  <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <div className="flex flex-wrap gap-2">
                     {user?.financialGoals?.map((goal, i) => (
                       <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-100 dark:border-slate-800 capitalize">
                          {goal.replace(/-/g, ' ')}
                       </span>
                     ))}
                  </div>
               </div>
            </div>
            </div>

          </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 w-fit mb-4">
             <button
                onClick={() => setActiveTab('recommended')}
                className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'recommended' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
             >
                Recommended
             </button>
             <button
                onClick={() => setActiveTab('saved')}
                className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'saved' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
             >
                Saved Schemes
             </button>
          </div>

          {activeTab === 'recommended' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between px-2 mb-6">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                    <Target className="text-primary-600" /> 
                    Recommended Schemes Based on User Details
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">Customized specifically to your user profile and goals.</p>
               </div>
               <span className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-2xl text-xs font-black uppercase tracking-widest">
                  {recommendations.length} Active
               </span>
            </div>

            {(showAll ? recommendations : recommendations.slice(0, visibleCount)).map((rec, index) => {
              const score = parseInt(rec.score);
              const isHigh = score >= 60;
              const barColor = isHigh ? 'bg-emerald-500' : 'bg-red-500';
              const label = isHigh ? t('dashboard.match_high') : t('dashboard.match_low');
              const labelColor = isHigh ? 'text-emerald-600' : 'text-red-500';
              return (
                <div key={rec.scheme._id} className="card p-6 rounded-[2rem] bg-white dark:bg-slate-800 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {t(`schemes.cat.${rec.scheme.category?.toLowerCase()}`) || rec.scheme.category}
                    </span>
                    <span className={`text-[10px] font-black uppercase ${labelColor}`}>
                      {label}
                    </span>
                  </div>
                  <Link to={`/schemes/${rec.scheme._id}`} className="hover:text-primary-600 transition-colors">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2">{rec.scheme.schemeName}</h3>
                  </Link>
                  <p className="text-slate-500 dark:text-slate-400 text-xs italic line-clamp-2 mb-3">"{rec.reason}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">{rec.scheme.provider}</span>
                    <Link to={`/schemes/${rec.scheme._id}`} className="p-2 px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold text-sm flex items-center gap-1">
                      Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}

            {recommendations.length > visibleCount && !showAll && (
              <button 
               onClick={() => setShowAll(true)}
               className="w-full py-4 rounded-[2rem] bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 font-black hover:border-primary-500 hover:text-primary-600 transition-all uppercase tracking-widest"
              >
                 {t('dashboard.view_more_btn') || 'View More >>'}
              </button>
            )}
          </div>
          )}

          {activeTab === 'saved' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between px-2 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-primary-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                  Saved Schemes
                </h2>
                <p className="text-slate-500 text-sm font-medium">Schemes you bookmarked for quick access.</p>
              </div>
              <span className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-2xl text-xs font-black uppercase tracking-widest">
                {savedSchemes.length} Saved
              </span>
            </div>

            {savedSchemes.length === 0 ? (
              <div className="card p-10 rounded-[2rem] bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 text-slate-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                <p className="text-slate-400 font-bold">No saved schemes yet.</p>
                <p className="text-slate-400 text-sm mt-1">Browse schemes and bookmark them to see them here.</p>
                <Link to="/schemes" className="inline-block mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all">Browse Schemes</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {savedSchemes.map((scheme) => (
                  <div key={scheme._id} className="card p-6 rounded-[2rem] bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl hover:scale-[1.005] transition-all duration-300 border-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-[10px] rounded-md uppercase font-black tracking-widest">{scheme.category}</span>
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] rounded-md uppercase font-black tracking-widest">{scheme.provider}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{scheme.schemeName}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2">{scheme.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400 uppercase font-bold">Rate</p>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{scheme.interestRate > 0 ? `${scheme.interestRate}%` : 'N/A'}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Link to={`/schemes/${scheme._id}`} className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 transition">
                            View →
                          </Link>
                          <button 
                            onClick={() => handleRemoveSaved(scheme._id)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-red-500 transition"
                            title="Remove from saved"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

        </div>
        </div>
      </div>
    </div>
  );
};

const ProfileDetail = ({ icon, label, value, capitalize }) => (
  <div className="flex items-center gap-4 group/item">
     <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 group-hover/item:text-primary-500 group-hover/item:bg-primary-50 transition-all border border-slate-100 dark:border-slate-700/50">
        {icon}
     </div>
     <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">{label}</p>
        <p className={`text-slate-800 dark:text-slate-200 font-bold truncate text-sm ${capitalize ? 'capitalize' : ''}`}>
           {value || 'Not Specified'}
        </p>
     </div>
  </div>
);

const Loader2 = ({ size, className }) =>(
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default Dashboard;
