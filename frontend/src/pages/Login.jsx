import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (identifier.trim().length < 4) return t('login.error_email');
    if (password.length < 6) return t('login.error_password');
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    
    const result = await login(identifier, password);
    if (result.success) {
      setSuccessMsg(t('login.success'));
      setTimeout(() => {
         if (result.user?.role === 'admin') {
           navigate('/admin');
         } else {
           navigate('/');
         }
      }, 500);
    } else {
      setError(result.message || t('login.error_general'));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-darkBg transition-colors">
      <div className="max-w-md w-full space-y-8 card p-8 sm:p-10 shadow-xl border-slate-200 dark:border-slate-800 rounded-3xl animate-fade-in-up">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white font-serif tracking-tight">
            {t('login.title')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t('login.subtitle')}
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t('login.identifier_label')}</label>
              <input 
                type="text" 
                autoComplete="off"
                required 
                className="input-field py-3 text-base" 
                placeholder={t('login.identifier_placeholder')}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <div>
               <div className="flex justify-between items-center mb-1">
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('login.password_label')}</label>
                 <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition">{t('login.forgot_password')}</Link>
               </div>
               <div className="relative">
                 <input 
                   type={showPassword ? "text" : "password"} 
                   autoComplete="off"
                   required 
                   className="input-field py-3 text-base pr-12" 
                   placeholder={t('login.password_placeholder')}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                 />
                 <button 
                   type="button" 
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1"
                 >
                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
               </div>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="btn-primary w-full flex justify-center items-center gap-2 py-3.5 text-lg shadow-md" 
              disabled={isLoading}
            >
              {isLoading ? <><Loader2 size={20} className="animate-spin" /> {t('login.processing')}</> : t('login.submit')}
            </button>
          </div>
          
          <div className="text-center text-sm pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">{t('login.no_account')} </span>
            <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition">
              {t('login.create_one')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
