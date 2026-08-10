import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, ChevronDown, Calendar, Hash, MapPin, Banknote, ShieldCheck, UserRound, PiggyBank, GraduationCap, Home, Briefcase, HeartHandshake, Ambulance, Baby, Plus, Wheat } from 'lucide-react';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    dob: '',
    gender: '',
    community: '',
    income: '',
    jobType: '',
    maritalStatus: '',
    state: '',
    financialGoals: [],
    otherGoalText: ''
  });
  
  const [age, setAge] = useState('');
  const [ageError, setAgeError] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 
    'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  // Real-time validation states
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    complex: false,
    special: false,
    noSpaces: false
  });

  const [emailStatus, setEmailStatus] = useState({
    isValid: false,
    message: ''
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const calculateAge = (dobString) => {
    if (!dobString) return '';
    const birthDate = new Date(dobString);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  };

  useEffect(() => {
    if (formData.dob) {
      const calculatedAge = calculateAge(formData.dob);
      setAge(calculatedAge);
      setAgeError('');
    } else {
      setAge('');
      setAgeError('');
    }
  }, [formData.dob]);

  const validatePassword = (pass) => {
    const criteria = {
      length: pass.length >= 8 && pass.length <= 64,
      complex: /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[0-9]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
      noSpaces: !/\s/.test(pass) && pass.length > 0
    };
    setPasswordCriteria(criteria);
    return criteria.length && criteria.complex && criteria.special && criteria.noSpaces;
  };

  const validateEmail = (email) => {
    if (!email) {
      setEmailStatus({ isValid: false, message: '' });
      return false;
    }
    
    const emailPattern = /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,63}$/;
    const noSpaces = !/\s/.test(email);
    const singleAt = (email.match(/@/g) || []).length === 1;
    
    let isValid = false;
    let message = '';

    if (!noSpaces) {
      message = t('register.error_email_chars');
    } else if (!singleAt) {
      message = t('register.error_email_invalid');
    } else if (!emailPattern.test(email)) {
      message = t('register.error_domain');
    } else {
      isValid = true;
    }

    setEmailStatus({ isValid, message });
    return isValid;
  };

  useEffect(() => {
    const isPassValid = validatePassword(formData.password);
    const isEmailValid = validateEmail(formData.email);
    
    const otherFieldsValid = (
      formData.name.trim().length >= 2 &&
      /^[6-9][0-9]{9}$/.test(formData.mobile) &&
      formData.dob !== '' &&
      age !== '' &&
      formData.gender !== '' &&
      formData.community !== '' &&
      formData.maritalStatus !== '' &&
      formData.income !== '' &&
      formData.jobType !== '' &&
      formData.state !== '' &&
      formData.financialGoals.length > 0 &&
      (!formData.financialGoals.includes('others') || formData.otherGoalText.trim().length > 0)
    );

    setIsFormValid(isPassValid && isEmailValid && otherFieldsValid);
  }, [formData, age]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    
    const goalsToSubmit = formData.financialGoals.map(g => g === 'others' ? formData.otherGoalText : g);
    const result = await register({ ...formData, financialGoals: goalsToSubmit, age: Number(age) });
    if (result.success) {
      setSuccessMsg(t('register.success'));
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError(result.message || t('register.error_general'));
      setIsLoading(false);
    }
  };

  const goalOptions = [
    { id: 'loan', label: t('register.goal_loan'), icon: <Banknote size={24} />, color: 'bg-blue-50 text-blue-600 border-blue-100', active: 'bg-blue-600 text-white border-blue-600 shadow-blue-200' },
    { id: 'insurance', label: t('register.goal_insurance'), icon: <ShieldCheck size={24} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', active: 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200' },
    { id: 'pension', label: t('register.goal_pension'), icon: <UserRound size={24} />, color: 'bg-purple-50 text-purple-600 border-purple-100', active: 'bg-purple-600 text-white border-purple-600 shadow-purple-200' },
    { id: 'savings', label: t('register.goal_savings'), icon: <PiggyBank size={24} />, color: 'bg-amber-50 text-amber-600 border-amber-100', active: 'bg-amber-600 text-white border-amber-600 shadow-amber-200' },
    { id: 'student', label: t('register.goal_student'), icon: <GraduationCap size={24} />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', active: 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200' },
    { id: 'housing', label: t('register.goal_housing'), icon: <Home size={24} />, color: 'bg-orange-50 text-orange-600 border-orange-100', active: 'bg-orange-600 text-white border-orange-600 shadow-orange-200' },
    { id: 'business', label: t('register.goal_business'), icon: <Briefcase size={24} />, color: 'bg-cyan-50 text-cyan-600 border-cyan-100', active: 'bg-cyan-600 text-white border-cyan-600 shadow-cyan-200' },
    { id: 'marriage', label: t('register.goal_marriage'), icon: <HeartHandshake size={24} />, color: 'bg-pink-50 text-pink-600 border-pink-100', active: 'bg-pink-600 text-white border-pink-600 shadow-pink-200' },
    { id: 'health', label: t('register.goal_health'), icon: <Ambulance size={24} />, color: 'bg-red-50 text-red-600 border-red-100', active: 'bg-red-600 text-white border-red-600 shadow-red-200' },
    { id: 'child', label: t('register.goal_child'), icon: <Baby size={24} />, color: 'bg-teal-50 text-teal-600 border-teal-100', active: 'bg-teal-600 text-white border-teal-600 shadow-teal-200' },
    { id: 'agri', label: t('register.goal_agri') || 'Agriculture', icon: <Wheat size={24} />, color: 'bg-yellow-50 text-yellow-600 border-yellow-100', active: 'bg-yellow-600 text-white border-yellow-600 shadow-yellow-200' },
    { id: 'others', label: t('register.goal_others'), icon: <Plus size={24} />, color: 'bg-slate-50 text-slate-600 border-slate-200', active: 'bg-slate-800 text-white border-slate-800 shadow-slate-300' }
  ];

  const toggleGoal = (goalId) => {
    setFormData(prev => {
      const goals = prev.financialGoals.includes(goalId) 
        ? prev.financialGoals.filter(g => g !== goalId)
        : [...prev.financialGoals, goalId];
      return { ...prev, financialGoals: goals };
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-darkBg transition-colors">
      <div className="max-w-2xl w-full space-y-6 card p-8 sm:p-10 shadow-2xl border-slate-200 dark:border-slate-800 rounded-3xl animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-serif tracking-tight">
            {t('register.title')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t('register.subtitle')}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm text-center border border-red-200 dark:border-red-800/30 font-medium">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-sm text-center border border-emerald-200 dark:border-emerald-800/30 font-medium flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> {successMsg}
          </div>
        )}

        <form className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit} autoComplete="off">
          
          {/* Basic Info */}
          <div className="space-y-5 col-span-1 md:col-span-2">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
               {t('register.personal_info')}
             </h3>
          </div>

          <div className="group transition-all duration-300 transform hover:scale-[1.02]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('register.name_label')}</label>
            <input 
              type="text" 
              name="name" 
              autoComplete="off"
              required 
              placeholder={t('register.name_placeholder')}
              className="input-field py-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all" 
              value={formData.name} 
              onChange={handleChange} 
            />
          </div>

          <div className="group transition-all duration-300 transform hover:scale-[1.02]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('register.mobile_label')}</label>
            <input 
              type="tel" 
              name="mobile" 
              autoComplete="off"
              required 
              placeholder={t('register.mobile_placeholder')}
              className={`input-field py-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all ${formData.mobile && !/^[6-9][0-9]{9}$/.test(formData.mobile) ? 'border-red-500 focus:ring-red-500/20' : ''}`} 
              value={formData.mobile} 
              onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})} 
              maxLength="10"
            />
            {formData.mobile && !/^[6-9][0-9]{9}$/.test(formData.mobile) && (
              <p className="text-[10px] text-red-500 mt-1 pl-2 font-bold animate-shake">
                {t('register.error_mobile')} (Starts with 6-9)
              </p>
            )}
          </div>

          <div className="group transition-all duration-300 transform hover:scale-[1.02]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('register.dob_label')}</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 z-10 pointer-events-none" />
              <input 
                type="date" 
                name="dob" 
                autoComplete="off"
                required 
                max={new Date().toISOString().split('T')[0]}
                className={`input-field py-4 pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all ${ageError ? 'border-red-500 focus:ring-red-500/20' : ''}`} 
                value={formData.dob} 
                onChange={handleChange} 
              />
            </div>
            {ageError && (
              <p className="text-[10px] text-red-500 mt-1 pl-2 font-bold flex items-center gap-1">
                <XCircle size={10} /> {ageError}
              </p>
            )}
          </div>

          <div className="group transition-all duration-300 transform hover:scale-[1.02]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('nav.age') || 'Age'}</label>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 z-10 pointer-events-none" />
              <input 
                type="text" 
                readOnly 
                className="input-field py-4 pl-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 cursor-not-allowed font-bold text-slate-500" 
                value={age ? `${age} ${t('dashboard.yrs')}` : ''} 
                placeholder="Age (Auto)"
              />
            </div>
          </div>

          <div className="group transition-all duration-300 transform hover:scale-[1.02]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('schemes.state') || 'State'}</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 z-10 pointer-events-none" />
              <select 
                name="state" 
                required 
                className="input-field py-4 pl-10 appearance-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all" 
                value={formData.state} 
                onChange={handleChange}
              >
                <option value="">-- {t('schemes.state') || 'Select State'} --</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="group transition-all duration-300 transform hover:scale-[1.02]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('register.gender_label')}</label>
            <div className="relative">
              <select 
                name="gender" 
                required 
                className="input-field py-4 appearance-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all" 
                value={formData.gender} 
                onChange={handleChange}
              >
                <option value="">-- {t('register.gender_label')} --</option>
                <option value="male">{t('register.male')}</option>
                <option value="female">{t('register.female')}</option>
                <option value="other">{t('register.other')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Social & Financial */}
          <div className="space-y-5 col-span-1 md:col-span-2 mt-4 text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
             {t('register.profile_details')}
          </div>

          <div className="group transition-all duration-300 transform hover:scale-[1.02]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('register.community_label')}</label>
            <div className="relative">
              <select 
                name="community" 
                required 
                className="input-field py-4 appearance-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all" 
                value={formData.community} 
                onChange={handleChange}
              >
                <option value="">-- {t('register.community_label')} --</option>
                <option value="SC">{t('register.sc')}</option>
                <option value="ST">{t('register.st')}</option>
                <option value="OBC">{t('register.obc')}</option>
                <option value="General">{t('register.general')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="group transition-all duration-300 transform hover:scale-[1.02]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('register.job_type_label')}</label>
            <div className="relative">
              <select 
                name="jobType" 
                required 
                className="input-field py-4 appearance-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all" 
                value={formData.jobType} 
                onChange={handleChange}
              >
                <option value="">-- {t('register.job_type_label')} --</option>
                <option value="salaried">{t('eligibility.salaried')}</option>
                <option value="self_employed">{t('eligibility.self_employed')}</option>
                <option value="student">{t('eligibility.student')}</option>
                <option value="farmer">{t('eligibility.farmer')}</option>
                <option value="retired">{t('eligibility.retired')}</option>
                <option value="unemployed">{t('eligibility.unemployed')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="group transition-all duration-300 transform hover:scale-[1.02]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('register.marital_status_label')}</label>
            <div className="relative">
              <select 
                name="maritalStatus" 
                required 
                className="input-field py-4 appearance-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all" 
                value={formData.maritalStatus} 
                onChange={handleChange}
              >
                <option value="">-- {t('register.marital_status_label') || 'Marital Status'} --</option>
                <option value="Single">{t('register.single')}</option>
                <option value="Married">{t('register.married')}</option>
                <option value="Divorced">{t('register.divorced')}</option>
                <option value="Widowed">{t('register.widowed')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="group transition-all duration-300 transform hover:scale-[1.02]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('register.income_label')}</label>
            <input 
              type="number" 
              name="income" 
              autoComplete="off"
              required 
              placeholder={t('register.income_label')}
              className="input-field py-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all" 
              value={formData.income} 
              onChange={handleChange} 
            />
          </div>

          {/* Financial Goals Section */}
          <div className="col-span-1 md:col-span-2 mt-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('register.goals_title')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t('register.goals_subtitle')}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {goalOptions.map((goal) => {
                const isSelected = formData.financialGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 group hover:scale-105 active:scale-95 ${
                      isSelected 
                        ? `${goal.active} scale-105 ring-4 ring-offset-2 ring-primary-500/20` 
                        : `${goal.color} border-transparent dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 grayscale hover:grayscale-0`
                    }`}
                  >
                    <div className={`mb-3 transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'animate-pulse' : ''}`}>
                      {goal.icon}
                    </div>
                    <span className="text-[12px] font-bold text-center leading-tight">{goal.label}</span>
                  </button>
                );
              })}
            </div>

            {formData.financialGoals.includes('others') && (
              <div className="mt-6 animate-fade-in-up">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('register.goal_others')}</label>
                <input
                  type="text"
                  name="otherGoalText"
                  placeholder={t('register.others_placeholder')}
                  className="input-field py-3"
                  value={formData.otherGoalText}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* Credentials */}
          <div className="space-y-5 col-span-1 md:col-span-2 mt-4 text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
             {t('register.account_credentials')}
          </div>

          <div className="group transition-all duration-300 transform hover:scale-[1.02]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('register.email_label')}</label>
            <input 
              type="email" 
              name="email" 
              autoComplete="off"
              required 
              placeholder={t('register.email_placeholder')}
              className={`input-field py-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all ${formData.email && !emailStatus.isValid ? 'border-red-500 ring-red-100 focus:ring-red-500/20' : formData.email && emailStatus.isValid ? 'border-emerald-500 ring-emerald-100 focus:ring-emerald-500/20' : ''}`} 
              value={formData.email} 
              onChange={handleChange} 
            />
            {formData.email && emailStatus.message && (
              <p className="text-[10px] text-red-500 mt-1 pl-2 font-bold animate-shake">
                 {emailStatus.message}
              </p>
            )}
          </div>

          <div className="group transition-all duration-300 transform hover:scale-[1.02]">
             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('register.password_label')}</label>
             <div className="relative">
               <input 
                 type={showPassword ? "text" : "password"} 
                 name="password" 
                 autoComplete="off"
                 required 
                 placeholder={t('register.password_placeholder')}
                 className={`input-field py-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all pr-12 ${formData.password && !passwordCriteria.length ? 'border-amber-400 focus:ring-amber-400/20' : formData.password && passwordCriteria.complex ? 'border-emerald-500 focus:ring-emerald-500/20' : ''}`} 
                 value={formData.password} 
                 onChange={handleChange} 
               />
               <button 
                 type="button" 
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1"
               >
                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
             </div>
             {formData.password && (
               <div className="mt-3 space-y-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm animate-fade-in-up transition-all">
                 <p className={`text-xs font-bold flex items-center gap-2 ${passwordCriteria.length ? 'text-emerald-500' : 'text-red-500'}`}>
                   {passwordCriteria.length ? <CheckCircle2 size={14} /> : <XCircle size={14} />} At least 8 characters
                 </p>
                 <p className={`text-xs font-bold flex items-center gap-2 ${passwordCriteria.complex ? 'text-emerald-500' : 'text-red-500'}`}>
                   {passwordCriteria.complex ? <CheckCircle2 size={14} /> : <XCircle size={14} />} Contains uppercase, lowercase, and numbers
                 </p>
                 <p className={`text-xs font-bold flex items-center gap-2 ${passwordCriteria.special ? 'text-emerald-500' : 'text-red-500'}`}>
                   {passwordCriteria.special ? <CheckCircle2 size={14} /> : <XCircle size={14} />} At least 1 special character (!@#$%)
                 </p>
                 <p className={`text-xs font-bold flex items-center gap-2 ${passwordCriteria.noSpaces ? 'text-emerald-500' : 'text-red-500'}`}>
                   {passwordCriteria.noSpaces ? <CheckCircle2 size={14} /> : <XCircle size={14} />} No spaces allowed
                 </p>
               </div>
             )}
          </div>

          <div className="col-span-1 md:col-span-2 pt-6">
            <button 
              type="submit" 
              className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${isFormValid && !isLoading ? 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-[1.01] active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`} 
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? <><Loader2 size={24} className="animate-spin" /> {t('login.processing')}</> : t('register.submit')}
            </button>
          </div>
          
          <div className="col-span-1 md:col-span-2 text-center text-sm pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">{t('register.have_account')} </span>
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition">
              {t('register.login_here')}
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Register;
