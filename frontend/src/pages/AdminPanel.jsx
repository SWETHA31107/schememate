import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Users, FolderOpen, Grid, Star, Trash2, Mail, MessageSquare, Clock, Plus, X, Pencil, Eye, RefreshCw } from 'lucide-react';

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

const AdminPanel = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('schemes');
  
  // New Scheme Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    schemeName: '',
    provider: 'government',
    category: 'loan',
    subCategory: '',
    state: 'National',
    interestRate: '',
    minAge: '',
    maxAge: '',
    minIncome: '',
    gender: 'All',
    jobType: [],
    benefits: '',
    description: '',
    officialWebsite: '',
    maritalStatus: 'All',
    differentlyAbled: false,
    maxIncome: '',
    community: [],
    documents: '',
    applicationSteps: ''
  });

  const location = useLocation();

  const fetchData = async () => {
    try {
      const schemesRes = await api.get('/schemes');
      setSchemes(schemesRes.data);
      
      const feedbackRes = await api.get('/feedback');
      setFeedbacks(feedbackRes.data);
    } catch (error) {
       console.error('Admin fetch error:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'feedback') {
      setActiveTab('feedback');
      setShowAddForm(false);
    }
  }, [location]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleJobTypeChange = (e) => {
    const value = e.target.value;
    const currentTypes = [...formData.jobType];
    const index = currentTypes.indexOf(value);
    if (index > -1) currentTypes.splice(index, 1);
    else currentTypes.push(value);
    setFormData({ ...formData, jobType: currentTypes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        schemeName: formData.schemeName,
        provider: formData.provider,
        category: formData.category,
        subCategory: formData.subCategory,
        state: formData.state,
        interestRate: Number(formData.interestRate),
        eligibility: {
          minAge: formData.minAge ? Number(formData.minAge) : null,
          maxAge: formData.maxAge ? Number(formData.maxAge) : null,
          minIncome: formData.minIncome ? Number(formData.minIncome) : null,
          gender: formData.gender,
          maritalStatus: formData.maritalStatus,
          differentlyAbled: formData.differentlyAbled,
          jobType: formData.jobType.length > 0 ? formData.jobType : []
        },
        benefits: formData.benefits.split('.').map(b => b.trim()).filter(b => b),
        description: formData.description,
        officialWebsite: formData.officialWebsite,
        documents: formData.documents.split('.').map(d => d.trim()).filter(d => d),
        applicationSteps: formData.applicationSteps.split('.').map((s, index) => ({
          step: index + 1,
          description: s.trim()
        })).filter(s => s.description)
      };

      if (formData.community && formData.community.length > 0) {
        payload.eligibility.community = formData.community;
      }
      if (formData.maxIncome) {
        payload.eligibility.maxIncome = Number(formData.maxIncome);
      }
      
      if (isEditing) {
        await api.put(`/schemes/${editId}`, payload);
        alert("Scheme updated successfully!");
      } else {
        await api.post('/schemes', payload);
        alert(t('admin_panel.success_create'));
      }
      
      handleResetForm();
      fetchData();
    } catch (error) {
      alert(t('admin_panel.error_create'));
      console.error(error);
    }
  };

  const handleEditClick = (scheme) => {
    setIsEditing(true);
    setEditId(scheme._id);
    setFormData({
      schemeName: scheme.schemeName,
      provider: scheme.provider,
      category: scheme.category,
      subCategory: scheme.subCategory || '',
      state: scheme.state || 'National',
      interestRate: scheme.interestRate || '',
      minAge: scheme.eligibility?.minAge || '',
      maxAge: scheme.eligibility?.maxAge || '',
      minIncome: scheme.eligibility?.minIncome || '',
      gender: scheme.eligibility?.gender || 'All',
      maritalStatus: scheme.eligibility?.maritalStatus || 'All',
      differentlyAbled: scheme.eligibility?.differentlyAbled || false,
      jobType: scheme.eligibility?.jobType || [],
      benefits: Array.isArray(scheme.benefits) ? scheme.benefits.join('. ') : scheme.benefits || '',
      description: scheme.description || '',
      officialWebsite: scheme.officialWebsite || '',
      maxIncome: scheme.eligibility?.maxIncome || '',
      community: scheme.eligibility?.community || [],
      documents: Array.isArray(scheme.documents) ? scheme.documents.join('. ') : scheme.documents || '',
      applicationSteps: Array.isArray(scheme.applicationSteps) ? scheme.applicationSteps.map(s => s.description).join('. ') : scheme.applicationSteps || ''
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setFormData({
      schemeName: '',
      provider: 'government',
      category: 'loan',
      subCategory: '',
      state: 'National',
      interestRate: '',
      minAge: '',
      maxAge: '',
      minIncome: '',
      gender: 'All',
      jobType: [],
      benefits: '',
      description: '',
      officialWebsite: '',
      maritalStatus: 'All',
      differentlyAbled: false,
      maxIncome: '',
      community: [],
      documents: '',
      applicationSteps: ''
    });
    setIsEditing(false);
    setEditId(null);
    setShowAddForm(false);
  };

  const handleDeleteScheme = async (id) => {
    if (window.confirm(t('admin_panel.confirm_delete'))) {
      try {
        await api.delete(`/schemes/${id}`);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm("Delete this feedback entry?")) {
      try {
        await api.delete(`/feedback/${id}`);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };


  const handleSystemReset = async () => {
    if (window.confirm("CRITICAL ACTION: This will delete ALL custom schemes and restore default data. Proceed?")) {
      try {
        await api.post('/schemes/reset');
        alert("Database Reset Successful!");
        fetchData();
        handleResetForm();
      } catch (error) {
        alert("Reset Failed: " + error.message);
        console.error(error);
      }
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <ShieldAlert size={64} className="mb-4" />
        <h2 className="text-2xl font-bold font-serif">{t('admin_panel.access_denied')}</h2>
        <p className="text-slate-500 mt-2">{t('admin_panel.no_privileges')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg py-12 px-4 sm:px-6 lg:px-8 focus-visible:outline-none">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Main Banner Header - Hidden when editing/adding */}
        {!showAddForm && (
          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-900 via-primary-900 to-slate-900 dark:from-indigo-950 dark:to-black p-10 md:p-16 shadow-2xl border border-white/10 animate-fade-in">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 blur-[100px] -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -ml-32 -mb-32"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-indigo-200 text-xs font-black uppercase tracking-[0.2em]">
                 <ShieldAlert size={14} /> {t('admin_panel.secure_access')}
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white font-serif tracking-tight leading-tight">
                {t('admin_panel.control_counter')}
              </h1>
              <div className="flex flex-wrap items-center gap-6">
                <p className="text-slate-300 text-lg font-medium max-w-xl">
                  {t('admin_panel.universal_gov')}
                </p>
                <div className="h-10 w-[1px] bg-white/20 hidden lg:block"></div>
                <div className="flex items-center gap-3">
                   <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-primary-600 flex items-center justify-center font-bold text-xs text-white">A</div>)}
                   </div>
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('admin_panel.active_staff')}</span>
                </div>
              </div>
            </div>

            <div className="flex bg-white/5 backdrop-blur-xl p-2 rounded-[2rem] border border-white/10 shadow-inner">
                <button 
                 onClick={() => { setActiveTab('schemes'); setShowAddForm(false); }}
                 className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'schemes' && !showAddForm ? 'bg-white text-primary-900 shadow-xl scale-105' : 'text-slate-400 hover:text-white'}`}
               >
                  <FolderOpen size={18} /> {t('nav.schemes')}
               </button>
               <button 
                 onClick={() => { setActiveTab('schemes'); setShowAddForm(true); setIsEditing(false); }}
                 className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${showAddForm ? 'bg-white text-primary-900 shadow-xl scale-105' : 'text-slate-400 hover:text-white'}`}
               >
                  <Plus size={18} /> {t('admin_panel.btn_add')}
               </button>
               <button 
                 onClick={() => { setActiveTab('feedback'); setShowAddForm(false); }}
                 className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'feedback' ? 'bg-white text-primary-900 shadow-xl scale-105' : 'text-slate-400 hover:text-white'}`}
               >
                  <Star size={18} /> {t('footer.rate_feedback')}
               </button>
            </div>
          </div>
          
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
          {activeTab === 'schemes' ? (
            <>
                {/* This section only shows when NOT editing/adding */}
                {!showAddForm && (
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 gap-6 animate-fade-in">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/40 rounded-3xl flex items-center justify-center text-primary-600">
                         <Grid size={32} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{t('admin_panel.master_db')}</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1  flex items-center gap-1 cursor-pointer hover:underline" onClick={handleSystemReset}>
                          <ShieldAlert size={10} /> {t('admin_panel.emergency_reset')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/40 rounded-3xl text-primary-600 font-black text-2xl shadow-inner border border-primary-200/50">
                          {schemes.length}
                       </div>
                       <button 
                         onClick={() => setShowAddForm(true)} 
                         className="flex items-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl bg-primary-600 text-white hover:bg-primary-500 hover:scale-[1.03] active:scale-95 shadow-primary-500/30"
                       >
                         <Plus size={18} /> {t('admin_panel.new_product')}
                       </button>
                    </div>
                  </div>
                )}

              {showAddForm && (
                <div className="card shadow-2xl border-primary-500 rounded-3xl p-8 animate-fade-in mb-8">
                  <h3 className="text-xl font-black mb-8 text-slate-900 dark:text-white flex items-center gap-2">
                     <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
                     {isEditing ? t('admin_panel.modify_scheme') : t('admin_panel.deploy_asset')}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('admin_panel.form_name')}</label>
                        <input type="text" name="schemeName" required className="input-field py-3" placeholder="Enter scheme title" value={formData.schemeName} onChange={handleInputChange} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('admin_panel.form_provider')}</label>
                          <select name="provider" className="input-field py-3" value={formData.provider} onChange={handleInputChange}>
                            <option value="government">{t('schemes.prov.government')}</option>
                            <option value="private">{t('schemes.prov.private')}</option>
                            <option value="corporate">{t('schemes.prov.corporate')}</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('admin_panel.form_category')}</label>
                          <select name="category" className="input-field py-3" value={formData.category} onChange={handleInputChange}>
                            <option value="">Select Category</option>
                            {Object.keys(subCats).map(cat => (
                              <option key={cat} value={cat}>{t(`schemes.cat.${cat}`)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('admin_panel.sub_category')}</label>
                         <input type="text" name="subCategory" required className="input-field py-3" placeholder="e.g. Home Loan, Fixed Deposit" value={formData.subCategory} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                         <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('admin_panel.target_state')}</label>
                         <input type="text" name="state" required className="input-field py-3" placeholder="e.g. National or Kerala" value={formData.state} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl space-y-6 border border-slate-200 dark:border-slate-800">
                       <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <ShieldAlert size={18} className="text-primary-500" />
                          {t('admin_panel.eligibility_thresholds')}
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                         <div className="space-y-2">
                           <label className="block text-xs font-black uppercase text-slate-500 tracking-widest">{t('admin_panel.form_min_age')}</label>
                           <input type="number" name="minAge" className="input-field py-2.5" value={formData.minAge} onChange={handleInputChange} />
                         </div>
                         <div className="space-y-2">
                           <label className="block text-xs font-black uppercase text-slate-500 tracking-widest">{t('admin_panel.form_max_age')}</label>
                           <input type="number" name="maxAge" className="input-field py-2.5" value={formData.maxAge} onChange={handleInputChange} />
                         </div>
                         <div className="space-y-2">
                           <label className="block text-xs font-black uppercase text-slate-500 tracking-widest">{t('admin_panel.form_min_income')}</label>
                           <input type="number" name="minIncome" className="input-field py-2.5" value={formData.minIncome} onChange={handleInputChange} />
                         </div>
                         <div className="space-y-2">
                            <label className="block text-xs font-black uppercase text-slate-500 tracking-widest">{t('admin_panel.max_income')}</label>
                            <input type="number" name="maxIncome" className="input-field py-2.5" placeholder="None" value={formData.maxIncome} onChange={handleInputChange} />
                         </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          <div className="space-y-2">
                             <label className="block text-xs font-black uppercase text-slate-500 tracking-widest">{t('admin_panel.gender')}</label>
                             <select name="gender" className="input-field py-2.5" value={formData.gender} onChange={handleInputChange}>
                                <option value="All">{t('schemes.gender_all')}</option>
                                <option value="Male">{t('eligibility.male')}</option>
                                <option value="Female">{t('eligibility.female')}</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-black uppercase text-slate-500 tracking-widest">{t('admin_panel.marital_status')}</label>
                            <select name="maritalStatus" className="input-field py-2.5" value={formData.maritalStatus} onChange={handleInputChange}>
                               <option value="All">{t('schemes.marital_all')}</option>
                               <option value="Single">{t('schemes.marital_single')}</option>
                               <option value="Married">{t('schemes.marital_married')}</option>
                               <option value="Widowed">{t('schemes.marital_widowed')}</option>
                               <option value="Divorced">{t('schemes.marital_divorced')}</option>
                            </select>
                          </div>
                       </div>

                       <div className="space-y-3 pt-2">
                           <label className="block text-xs font-black uppercase text-slate-500 tracking-widest">{t('eligibility.community')}</label>
                           <div className="flex flex-wrap gap-3">
                             {['General', 'BC', 'MBC', 'SC', 'ST'].map(comm => (
                               <label key={comm} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border transition-all ${formData.community?.includes(comm) ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-900/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                                 <input 
                                   type="checkbox" 
                                   className="hidden" 
                                   checked={formData.community?.includes(comm)}
                                   onChange={() => {
                                      const current = [...(formData.community || [])];
                                      const index = current.indexOf(comm);
                                      if (index > -1) current.splice(index, 1);
                                      else current.push(comm);
                                      setFormData({...formData, community: current});
                                   }}
                                 />
                                 <span className="text-xs font-bold">{comm}</span>
                               </label>
                             ))}
                           </div>
                        </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          <div className="flex items-center gap-4 h-full pt-2">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                 <div className="relative">
                                    <input 
                                      type="checkbox" 
                                      className="hidden" 
                                      checked={formData.differentlyAbled}
                                      onChange={(e) => setFormData({...formData, differentlyAbled: e.target.checked})}
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-all ${formData.differentlyAbled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${formData.differentlyAbled ? 'translate-x-6' : ''}`}></div>
                                 </div>
                                 <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('admin_panel.specially_abled')}</span>
                              </label>
                          </div>
                       </div>
                       
                       <div className="space-y-3">
                          <label className="block text-xs font-black uppercase text-slate-500 tracking-widest">{t('admin_panel.eligible_occupations')}</label>
                          <div className="flex flex-wrap gap-4">
                            {['salaried', 'self_employed', 'student', 'farmer', 'unemployed', 'retired'].map(job => (
                              <label key={job} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border transition-all ${formData.jobType.includes(job) ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                                <input type="checkbox" value={job} checked={formData.jobType.includes(job)} onChange={handleJobTypeChange} className="hidden" />
                                <span className="capitalize text-sm font-bold">{t(`eligibility.${job}`)}</span>
                              </label>
                            ))}
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('admin_panel.form_rate')} (%)</label>
                        <input type="number" name="interestRate" required step="0.1" className="input-field py-3" value={formData.interestRate} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('admin_panel.form_benefits')}</label>
                        <input type="text" name="benefits" required className="input-field py-3" placeholder="Key benefits (separate with dots)" value={formData.benefits} onChange={handleInputChange} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('admin_panel.req_docs')}</label>
                        <input type="text" name="documents" className="input-field py-3" placeholder="Aadhar, Income Certificate (separate with dots)" value={formData.documents} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('admin_panel.app_steps')}</label>
                        <input type="text" name="applicationSteps" className="input-field py-3" placeholder="1. Visit portal. 2. Login (separate with dots)" value={formData.applicationSteps} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('admin_panel.official_url')}</label>
                        <input type="url" name="officialWebsite" className="input-field py-3" placeholder="https://example.gov.in" value={formData.officialWebsite} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('admin_panel.form_desc')}</label>
                      <textarea name="description" required rows="4" className="input-field py-3 resize-none" placeholder="Detailed program explanation..." value={formData.description} onChange={handleInputChange}></textarea>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button type="button" onClick={handleResetForm} className="px-8 py-3 rounded-2xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest text-xs">{t('admin_panel.discard_changes')}</button>
                      <button type="submit" className="btn-primary px-10 py-3 rounded-2xl shadow-xl shadow-primary-500/25">
                         {isEditing ? t('admin_panel.verify_update') : t('admin_panel.deploy_scheme')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* The Schemes Table - Hidden when editing/adding */}
              {!showAddForm && (
                <div className="bg-white dark:bg-slate-800 overflow-hidden rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 animate-fade-in-up">
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                              <th className="px-10 py-7">{t('admin_panel.prod_identity')}</th>
                              <th className="px-10 py-7">{t('admin_panel.distribution')}</th>
                              <th className="px-10 py-7 text-center">{t('admin_panel.efficiency')}</th>
                              <th className="px-10 py-7 text-right">{t('admin_panel.operations')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {schemes.map(scheme => (
                              <tr key={scheme._id} className="hover:bg-slate-50/80 dark:hover:bg-primary-900/5 transition-all group">
                                  <td className="px-10 py-8">
                                    <div className="space-y-1">
                                      <div className="font-black text-lg text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase tracking-tight">{scheme.schemeName}</div>
                                      <div className="flex items-center gap-2">
                                         <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{scheme.provider}</span>
                                         <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                         <span className="text-[10px] text-slate-400 font-bold">{scheme.state} Network</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-10 py-8">
                                     <div className="flex flex-col gap-1.5">
                                        <span className="w-fit px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                                            {t(`schemes.cat.${scheme.category}`)}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 ml-1 truncate max-w-[150px]">{scheme.subCategory}</span>
                                     </div>
                                  </td>
                                  <td className="px-10 py-8 text-center">
                                     <div className="inline-flex items-center justify-center w-16 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                        {scheme.interestRate}%
                                     </div>
                                  </td>
                                  <td className="px-10 py-8 text-right">
                                    <div className="flex justify-end gap-3 transition-opacity">
                                      <Link 
                                        to={`/schemes/${scheme._id}`} 
                                        className="p-3 bg-white dark:bg-slate-700 text-slate-400 hover:text-emerald-600 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-600 hover:scale-110 active:scale-95 transition-all"
                                        title="View Product"
                                        target="_blank"
                                      >
                                          <Eye size={20} />
                                      </Link>
                                      <button 
                                        onClick={() => handleEditClick(scheme)} 
                                        className="p-3 bg-white dark:bg-slate-700 text-slate-400 hover:text-primary-600 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-600 hover:scale-110 active:scale-95 transition-all"
                                        title="Edit Attributes"
                                      >
                                          <Pencil size={20} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteScheme(scheme._id)} 
                                        className="p-3 bg-white dark:bg-slate-700 text-slate-400 hover:text-red-500 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-600 hover:scale-110 active:scale-95 transition-all"
                                        title="Archive/Delete"
                                      >
                                          <Trash2 size={20} />
                                      </button>
                                    </div>
                                  </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="animate-fade-in space-y-12">
              <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div>
                   <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('admin_panel.public_sentiments')}</h2>
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">{t('admin_panel.agg_feedback')}</p>
                </div>
                <div className="flex gap-4">
                   <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 min-w-[100px]">
                      <span className="text-2xl font-black text-amber-500">{(feedbacks.reduce((acc, f) => acc + f.rating, 0) / (feedbacks.length || 1)).toFixed(1)}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('admin_panel.avg_rating')}</span>
                   </div>
                   <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 min-w-[100px]">
                      <span className="text-2xl font-black text-primary-600">{feedbacks.length}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('admin_panel.entries')}</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {feedbacks.length === 0 ? (
                  <div className="col-span-full card p-24 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                       <MessageSquare size={40} />
                    </div>
                    <p className="text-xl">{t('admin_panel.waiting_sentiments')}</p>
                  </div>
                ) : (
                  feedbacks.map(fb => (
                    <div key={fb._id} className="relative group overflow-hidden bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-primary-500/10 transition-colors"></div>
                      
                      <div className="flex flex-col h-full space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="flex text-amber-400 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={18} className={i < fb.rating ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'} />
                            ))}
                          </div>

                        </div>

                        <div className="flex-grow">
                          <div className="flex gap-3 mb-4">
                             <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                                <Mail size={18} />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t('admin_panel.contributor')}</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{fb.email}</span>
                             </div>
                          </div>
                          
                          <div className="relative">
                            <MessageSquare size={16} className="absolute -left-2 -top-2 text-primary-500/20" />
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium italic relative z-10 px-2 line-clamp-4">
                              "{fb.message}"
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteFeedback(fb._id)}
                          className="w-full py-4 mt-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                        >
                          <Trash2 size={14} /> {t('admin_panel.purge_entry')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
