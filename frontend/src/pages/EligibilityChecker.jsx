import { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, XCircle, ChevronRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EligibilityChecker = () => {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState('');
  
  const [formData, setFormData] = useState({
    age: '',
    income: '',
    jobType: 'salaried',
    caste: 'General',
    gender: 'All',
    state: 'National',
    maritalStatus: 'All',
    differentlyAbled: false
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const states = [
    'National', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 
    'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal'
  ];

  useEffect(() => {
    api.get('/schemes').then(res => setSchemes(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!selectedScheme) return;
    
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        schemeId: selectedScheme,
        age: Number(formData.age),
        income: Number(formData.income),
        jobType: formData.jobType,
        caste: formData.caste,
        gender: formData.gender,
        state: formData.state,
        maritalStatus: formData.maritalStatus,
        differentlyAbled: formData.differentlyAbled
      };
      
      const { data } = await api.post('/check-eligibility', payload);
      setResult(data);
    } catch (error) {
      console.error('Error checking eligibility', error);
      setResult({ eligible: false, missingConditions: ['Server logic constraint or missing route logic.']});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-serif">{t('eligibility.title')}</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{t('eligibility.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form Column */}
        <div className="card h-fit shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('eligibility.applicant_profile')}</h3>
             <p className="text-sm text-slate-500">{t('eligibility.profile_desc')}</p>
          </div>
          
          <form onSubmit={handleCheck} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('eligibility.select_scheme')} *</label>
              <select 
                required
                className="input-field mt-0 font-medium"
                value={selectedScheme}
                onChange={(e) => {
                  setSelectedScheme(e.target.value);
                  const s = schemes.find(sch => sch._id === e.target.value);
                  if (s) {
                    setFormData(prev => ({
                      ...prev,
                      gender: s.eligibility?.gender || 'All',
                      caste: s.eligibility?.community?.[0] || 'General',
                      state: s.state || 'National',
                      maritalStatus: s.eligibility?.maritalStatus || 'All'
                    }));
                  }
                }}
              >
                <option value="" disabled>{t('eligibility.choose_scheme')}</option>
                {schemes.map(s => (
                  <option key={s._id} value={s._id}>{s.schemeName} ({s.state})</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('eligibility.age')} *</label>
                  <input type="number" name="age" required min="1" max="120" className="input-field mt-0" value={formData.age} onChange={handleChange} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('eligibility.income')} (₹) *</label>
                  <input type="number" name="income" required min="0" className="input-field mt-0" value={formData.income} onChange={handleChange} />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('eligibility.job_type')} *</label>
                <select name="jobType" className="input-field mt-0" value={formData.jobType} onChange={handleChange}>
                  <option value="salaried">{t('eligibility.salaried')}</option>
                  <option value="self-employed">{t('eligibility.self_employed')}</option>
                  <option value="student">{t('eligibility.student')}</option>
                  <option value="farmer">{t('eligibility.farmer')}</option>
                  <option value="retired">{t('eligibility.retired')}</option>
                  <option value="unemployed">{t('eligibility.unemployed')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('eligibility.community')} *</label>
                <select name="caste" className="input-field mt-0" value={formData.caste} onChange={handleChange}>
                  <option value="General">General / OC</option>
                  <option value="BC">BC</option>
                  <option value="MBC">MBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('schemes.gender')}</label>
                <select name="gender" className="input-field mt-0" value={formData.gender} onChange={handleChange}>
                  <option value="All">{t('eligibility.any')}</option>
                  <option value="Male">{t('eligibility.male')}</option>
                  <option value="Female">{t('eligibility.female')}</option>
                  <option value="Other">{t('eligibility.other')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('eligibility.resident')}</label>
                <select name="state" className="input-field mt-0" value={formData.state} onChange={handleChange}>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('scheme_details.marital')}</label>
                <select name="maritalStatus" className="input-field mt-0" value={formData.maritalStatus} onChange={handleChange}>
                  <option value="All">{t('eligibility.any')}</option>
                  <option value="Single">{t('eligibility.single')}</option>
                  <option value="Married">{t('eligibility.married')}</option>
                  <option value="Widowed">{t('eligibility.widowed')}</option>
                  <option value="Divorced">{t('eligibility.divorced')}</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                 <input 
                   type="checkbox" 
                   id="differentlyAbled" 
                   name="differentlyAbled" 
                   className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
                   checked={formData.differentlyAbled}
                   onChange={handleChange}
                 />
                 <label htmlFor="differentlyAbled" className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                   {t('compare.differently_abled')}
                 </label>
              </div>
            </div>

            <button type="submit" className="btn-primary py-3.5 w-full text-lg mt-4 shadow-lg hover:shadow-primary-500/30 transition-all font-bold" disabled={loading}>
              {loading ? t('eligibility.checking') : t('eligibility.check_status')}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="relative h-full flex items-center justify-center">
          {result ? (
            <div className="w-full animate-fade-in-up">
              <div className={`card overflow-hidden border-2 shadow-2xl relative ${result.eligible ? 'border-green-400 bg-green-50/80 dark:bg-green-900/10' : 'border-red-400 bg-red-50/80 dark:bg-red-900/10'}`}>
                {/* Status Header */}
                <div className="text-center py-8">
                  {result.eligible ? (
                    <>
                      <CheckCircle className="mx-auto text-green-500 mb-4 h-20 w-20 animate-bounce" />
                      <h3 className="text-3xl font-black text-green-700 dark:text-green-400 mb-2 font-serif">{t('eligibility.eligible_title')}</h3>
                      <p className="text-green-600 dark:text-green-500 max-w-sm mx-auto">
                        {t('eligibility.eligible_desc')}
                      </p>
                      <div className="mt-8">
                         <Link to={`/schemes/${selectedScheme}`} className="btn-primary inline-flex bg-green-600 hover:bg-green-700 px-8 py-3">
                           {t('eligibility.proceed_btn')}
                         </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="mx-auto text-red-500 mb-4 h-20 w-20" />
                      <h3 className="text-2xl font-black text-red-700 dark:text-red-400 font-serif">{t('eligibility.not_eligible_title')}</h3>
                      
                      <div className="mt-8 text-left bg-white dark:bg-darkCard p-6 rounded-xl shadow-sm border border-red-100 dark:border-red-800">
                         <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                           <AlertTriangle size={18} className="text-red-500" /> {t('eligibility.unmet_criteria')}
                         </h4>
                         <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 font-medium">
                           {result.missingConditions?.map((cond, idx) => (
                             <li key={idx}>{cond}</li>
                           ))}
                           {(!result.missingConditions || result.missingConditions.length === 0) && (
                             <li>{t('eligibility.no_criteria_match')}</li>
                           )}
                         </ul>
                      </div>

                      {result.alternatives && result.alternatives.length > 0 && (
                        <div className="mt-8 text-left">
                          <h4 className="font-bold text-primary-600 dark:text-primary-400 mb-4 flex items-center gap-2">
                             {t('eligibility.alternatives_title')} <ChevronRight size={18} />
                          </h4>
                          <div className="grid gap-3">
                             {result.alternatives.map(alt => (
                                <Link key={alt._id} to={`/schemes/${alt._id}`} className="block p-4 bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition shadow-sm hover:shadow-md">
                                  <div className="font-bold text-slate-900 dark:text-slate-100">{alt.schemeName}</div>
                                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">{t(`schemes.prov.${alt.provider?.toLowerCase()}`) || alt.provider} • {t(`schemes.cat.${alt.category?.toLowerCase()}`) || alt.category}</div>
                                </Link>
                             ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
             <div className="card w-full h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/20">
                <CheckCircle size={64} className="mb-6 opacity-20" />
                <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">{t('eligibility.awaiting_assessment')}</h3>
                <p className="max-w-xs text-center">{t('eligibility.awaiting_desc')}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EligibilityChecker;
