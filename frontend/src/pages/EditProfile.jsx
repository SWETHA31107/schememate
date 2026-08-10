import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, ChevronDown, MapPin, Banknote, ShieldCheck, UserRound, PiggyBank, GraduationCap, Home, Briefcase, HeartHandshake, Ambulance, Baby, Plus, Wheat, User, Save, ArrowLeft } from 'lucide-react';

const EditProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    age: '',
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

  // Sync with user data once it's available (important for refresh or delayed load)
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        age: (user.age !== undefined && user.age !== null) ? user.age : '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        gender: user.gender || '',
        community: user.community || '',
        income: (user.income !== undefined && user.income !== null) ? user.income : '',
        jobType: user.jobType || '',
        maritalStatus: user.maritalStatus || '',
        state: user.state || '',
        financialGoals: user.financialGoals || [],
        otherGoalText: ''
      });
    }
  }, [user]);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 
    'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  const calculateAge = (dobString) => {
    if (!dobString) return '';
    const birthDate = new Date(dobString);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge >= 0 ? calculatedAge : 0;
  };

  useEffect(() => {
    if (formData.dob) {
      const calculatedAge = calculateAge(formData.dob);
      if (calculatedAge !== formData.age) {
        setFormData(prev => ({ ...prev, age: calculatedAge }));
      }
    }
  }, [formData.dob]);

  useEffect(() => {
    const isValidMail = /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,63}$/.test(formData.email);
    const isValidMobile = /^[6-9][0-9]{9}$/.test(formData.mobile);
    
    const otherFieldsValid = (
      formData.name.trim().length >= 2 &&
      isValidMail &&
      isValidMobile &&
      formData.age !== '' &&
      formData.dob !== '' &&
      formData.gender !== '' &&
      formData.community !== '' &&
      formData.maritalStatus !== '' &&
      formData.income !== '' &&
      formData.jobType !== '' &&
      formData.state !== '' &&
      formData.financialGoals.length > 0
    );

    setIsFormValid(otherFieldsValid);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleGoal = (goalId) => {
    setFormData(prev => {
      const goals = prev.financialGoals.includes(goalId) 
        ? prev.financialGoals.filter(g => g !== goalId)
        : [...prev.financialGoals, goalId];
      return { ...prev, financialGoals: goals };
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    
    // Simple filter to remove empty fields if needed
    const result = await updateProfile(formData);
    if (result.success) {
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setError(result.message || "Failed to update profile.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-darkBg transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition font-bold">
              <ArrowLeft size={20} /> {t('scheme_details.back')}
           </button>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white font-serif tracking-tight">Edit Profile</h1>
           <div className="w-10"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel - Avatar & Summary */}
          <div className="lg:col-span-1 space-y-6">
             <div className="card p-8 text-center shadow-xl rounded-3xl border-0 bg-white dark:bg-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-indigo-600"></div>
                <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-slate-700 shadow-lg group-hover:scale-105 transition-transform duration-500">
                   <User size={48} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-xl font-bold dark:text-white">{formData.name}</h2>
                <p className="text-slate-500 text-sm mb-6">{formData.email}</p>
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                      <span>Status</span>
                      <span className="text-emerald-500">Active Account</span>
                   </div>
                </div>
             </div>

             <div className="card p-6 shadow-lg rounded-2xl border-0 bg-primary-600 text-white">
                <h3 className="font-bold mb-2 flex items-center gap-2"><Save size={18} /> Quick Tip</h3>
                <p className="text-sm text-primary-100">Keep your income and goals updated to get the most accurate scheme recommendations from our AI engine.</p>
             </div>
          </div>

          {/* Right Panel - Form */}
          <div className="lg:col-span-2">
            <div className="card p-8 sm:p-10 shadow-2xl border-0 rounded-3xl animate-fade-in-up bg-white dark:bg-slate-800">
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm text-center border border-red-200 mb-6 font-medium">
                  {error}
                </div>
              )}
              
              {successMsg && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-sm text-center border border-emerald-200 mb-6 font-medium flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> {successMsg}
                </div>
              )}

              <form className="space-y-8" onSubmit={handleSubmit} autoComplete="off">
                
                {/* Personal Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                       <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                       Personal Details
                    </h3>
                  </div>

                  <div className="group transition-all duration-300">
                    <input 
                      type="text" 
                      name="name" 
                      placeholder={t('register.name_placeholder')}
                      className="input-field py-4 bg-slate-50 dark:bg-slate-900/50 border-transparent focus:bg-white" 
                      value={formData.name} 
                      onChange={handleChange} 
                    />
                  </div>

                  <div className="group transition-all duration-300">
                    <input 
                      type="tel" 
                      name="mobile" 
                      placeholder={t('register.mobile_placeholder')}
                      className={`input-field py-4 bg-slate-50 dark:bg-slate-900/50 border-transparent focus:bg-white ${formData.mobile && !/^[6-9][0-9]{9}$/.test(formData.mobile) ? 'border-red-500' : ''}`} 
                      value={formData.mobile} 
                      onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})} 
                      maxLength="10"
                    />
                  </div>

                  <div className="group transition-all duration-300">
                    <input 
                      type="date" 
                      name="dob" 
                      className={`input-field py-4 bg-slate-50 dark:bg-slate-900/50 border-transparent focus:bg-white`} 
                      value={formData.dob} 
                      onChange={handleChange} 
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="group transition-all duration-300">
                    <input 
                      type="number" 
                      name="age" 
                      placeholder="Age"
                      className={`input-field py-4 bg-slate-50 dark:bg-slate-900/50 border-transparent focus:bg-white min-w-0 ${formData.age && formData.age < 0 ? 'border-red-500' : ''}`} 
                      value={formData.age} 
                      onChange={handleChange} 
                      readOnly
                      title="Age is auto-calculated from Date of Birth."
                    />
                  </div>

                  <div className="relative group transition-all duration-300">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 z-10 pointer-events-none" />
                    <select 
                      name="state" 
                      className="input-field py-4 pl-10 appearance-none bg-slate-50 dark:bg-slate-900/50 border-transparent focus:bg-white" 
                      value={formData.state} 
                      onChange={handleChange}
                    >
                      <option value="">-- {t('schemes.state')} --</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>

                  <div className="relative group transition-all duration-300">
                    <select 
                      name="gender" 
                      className="input-field py-4 appearance-none bg-slate-50 dark:bg-slate-900/50 border-transparent focus:bg-white" 
                      value={formData.gender} 
                      onChange={handleChange}
                    >
                      <option value="">-- {t('register.gender_label') || 'Gender'} --</option>
                      <option value="male">{t('register.male') || 'Male'}</option>
                      <option value="female">{t('register.female') || 'Female'}</option>
                      <option value="other">{t('register.other') || 'Other'}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>

                  <div className="relative group transition-all duration-300">
                    <select 
                      name="community" 
                      className="input-field py-4 appearance-none bg-slate-50 dark:bg-slate-900/50 border-transparent focus:bg-white" 
                      value={formData.community} 
                      onChange={handleChange}
                    >
                      <option value="">-- {t('register.community_label') || 'Community'} --</option>
                      <option value="SC">{t('register.sc') || 'SC'}</option>
                      <option value="ST">{t('register.st') || 'ST'}</option>
                      <option value="OBC">{t('register.obc') || 'OBC'}</option>
                      <option value="General">{t('register.general') || 'General'}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>

                  <div className="relative group transition-all duration-300">
                    <select 
                      name="maritalStatus" 
                      className="input-field py-4 appearance-none bg-slate-50 dark:bg-slate-900/50 border-transparent focus:bg-white" 
                      value={formData.maritalStatus} 
                      onChange={handleChange}
                    >
                      <option value="">-- Marital Status --</option>
                      <option value="Single">{t('register.single')}</option>
                      <option value="Married">{t('register.married')}</option>
                      <option value="Divorced">{t('register.divorced')}</option>
                      <option value="Widowed">{t('register.widowed')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>

                {/* Financial Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                       <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                       Financial Profile
                    </h3>
                  </div>

                  <div className="group transition-all duration-300">
                    <input 
                      type="number" 
                      name="income" 
                      placeholder={t('register.income_label')}
                      className="input-field py-4 bg-slate-50 dark:bg-slate-900/50 border-transparent focus:bg-white" 
                      value={formData.income} 
                      onChange={handleChange} 
                    />
                  </div>

                  <div className="relative group transition-all duration-300">
                    <select 
                      name="jobType" 
                      className="input-field py-4 appearance-none bg-slate-50 dark:bg-slate-900/50 border-transparent focus:bg-white" 
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

                {/* Goals */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                     <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                     Financial Goals
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {goalOptions.map((goal) => {
                      const isSelected = formData.financialGoals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => toggleGoal(goal.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 ${
                            isSelected 
                              ? `border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300` 
                              : `border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-500`
                          }`}
                        >
                          <div className={isSelected ? 'text-primary-600' : 'text-slate-400'}>
                             {goal.icon}
                          </div>
                          <span className="text-xs font-bold truncate">{goal.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>


                <div className="pt-8">
                  <button 
                    type="submit" 
                    className={`w-full py-4 rounded-2xl text-lg font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${isFormValid && !isLoading ? 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-[1.01] active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`} 
                    disabled={!isFormValid || isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Save size={22} />}
                    Update My Profile
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditProfile;
