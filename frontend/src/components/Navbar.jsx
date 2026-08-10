import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe, LogOut, ChevronDown, Check, Calculator, Menu, X } from 'lucide-react';
import LogoutModal from './LogoutModal';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' }
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const { isDarkMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('appLanguage', code);
    setShowLangDropdown(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
    <nav className="fixed w-full z-50 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-900 font-serif">
              SchemeMate
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/schemes" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition">
              {t('nav.schemes')}
            </Link>
            <Link to="/compare" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition">
              {t('nav.compare')}
            </Link>
            <Link to="/eligibility" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition">
              {t('nav.checker')}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowLangDropdown(!showLangDropdown)} 
                className="flex items-center space-x-1 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300" 
                title="Toggle Language"
              >
                <Globe size={20} />
                <ChevronDown size={14} />
              </button>
              
              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-darkCard rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 max-h-64 overflow-y-auto custom-scrollbar">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex justify-between items-center"
                    >
                      <span>{lang.label}</span>
                      {i18n.language === lang.code && <Check size={16} className="text-primary-600 dark:text-primary-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link to="/emi-calculator" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300" title="EMI Calculator">
              <Calculator size={20} />
            </Link>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-amber-500 dark:text-amber-400" title="Toggle Theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-3 ml-2 relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white font-bold cursor-pointer"
                  title={t('nav.profile')}
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
                {showProfileDropdown && (
                  <div className="absolute top-10 right-0 w-48 bg-white dark:bg-darkCard rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                     <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{t('nav.hi')}, {user.name.split(' ')[0]} 👋</p>
                     </div>
                     <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setShowProfileDropdown(false)} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                       {user.role === 'admin' ? t('nav.admin') : t('nav.dashboard')}
                     </Link>
                     {user.role !== 'admin' && (
                       <Link to="/edit-profile" onClick={() => setShowProfileDropdown(false)} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                         {t('nav.profile')}
                       </Link>
                     )}
                     <button onClick={() => { setShowProfileDropdown(false); setShowLogoutModal(true); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                       <LogOut size={16} className="mr-2" /> {t('nav.logout')}
                     </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-2">
                <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 font-medium transition">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary py-1.5 px-3 text-sm">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogout} 
      />

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white dark:bg-darkCard border-b border-slate-200 dark:border-slate-800 animate-slide-down">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link 
              to="/schemes" 
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-3 rounded-xl text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.schemes')}
            </Link>
            <Link 
              to="/compare" 
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-3 rounded-xl text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.compare')}
            </Link>
            <Link 
              to="/eligibility" 
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-3 rounded-xl text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.checker')}
            </Link>
            <Link 
              to="/emi-calculator" 
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-3 rounded-xl text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.emi_calculator')}
            </Link>
          </div>
        </div>
      )}
    </nav>
    </>
  );
};

export default Navbar;
