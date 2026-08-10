import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    confirmPassword: ''
  });
  
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    complex: false,
    special: false,
    noSpaces: false
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password') validatePassword(value);
  };

  const isFormValid = 
    formData.identifier.trim().length >= 4 &&
    passwordCriteria.length &&
    passwordCriteria.complex &&
    passwordCriteria.special &&
    passwordCriteria.noSpaces &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isFormValid) {
      setError('Please resolve all validation errors before proceeding.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/reset-password', {
        identifier: formData.identifier,
        newPassword: formData.password
      });
      
      setSuccessMsg(response.data.message || 'Password has been efficiently reset.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-darkBg transition-colors">
      <div className="max-w-md w-full space-y-8 card p-8 sm:p-10 shadow-xl border-slate-200 dark:border-slate-800 rounded-3xl animate-fade-in-up">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white font-serif tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter your associated email or mobile to set a new password.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm text-center border border-red-200 dark:border-red-800/30 font-medium">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-sm text-center border border-emerald-200 dark:border-emerald-800/30 font-medium flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('login.identifier_label')}</label>
              <input 
                type="text" 
                name="identifier"
                autoComplete="off"
                required 
                className="input-field py-3 text-base" 
                placeholder={t('login.identifier_placeholder')}
                value={formData.identifier}
                onChange={handleChange}
              />
            </div>

            <div className="group transition-all duration-300 transform">
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password *</label>
               <div className="relative">
                 <input 
                   type={showPassword ? "text" : "password"} 
                   name="password" 
                   autoComplete="off"
                   required 
                   placeholder={t('register.password_placeholder')}
                   className={`input-field py-3 text-base pr-12 ${formData.password && !passwordCriteria.length ? 'border-amber-400 focus:ring-amber-400/20' : formData.password && passwordCriteria.complex ? 'border-emerald-500 focus:ring-emerald-500/20' : ''}`} 
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
                     {passwordCriteria.length ? <CheckCircle2 size={14} /> : <XCircle size={14} />} At least 8-64 characters
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

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password *</label>
              <input 
                type="password" 
                name="confirmPassword"
                autoComplete="off"
                required 
                className={`input-field py-3 text-base ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : formData.confirmPassword ? 'border-emerald-500 focus:ring-emerald-500/20' : ''}`} 
                placeholder="Re-enter your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
               {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                 <p className="text-[10px] text-red-500 mt-1 pl-2 font-bold animate-shake">
                    Passwords do not match
                 </p>
               )}
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className={`w-full flex justify-center items-center gap-2 py-3.5 rounded-xl text-lg font-bold shadow-lg transition-all ${isFormValid && !isLoading ? 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-[1.01] active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`} 
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? <><Loader2 size={24} className="animate-spin" /> Processing...</> : 'Reset Password'}
            </button>
          </div>
          
          <div className="text-center text-sm pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <Link to="/login" className="font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
