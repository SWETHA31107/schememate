import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Star, Home, Search, FileCheck, Scale, LogIn, UserPlus } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleReset = () => {
    setRating(0);
    setHoverRating(0);
    setFeedbackEmail('');
    setFeedbackMessage('');
    setErrors({});
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const emailPattern = /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,63}$/;
    
    if (rating === 0) newErrors.rating = t('feedback.error_rating') || 'Please select a rating';
    
    if (!feedbackEmail) newErrors.email = t('feedback.error_email_invalid') || 'Invalid email';
    else if (!emailPattern.test(feedbackEmail)) newErrors.email = t('feedback.error_email_invalid') || 'Invalid email';
    
    if (!feedbackMessage) newErrors.message = t('feedback.error_msg_required') || 'Message required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});

    try {
      await api.post('/feedback', {
        email: feedbackEmail,
        rating,
        message: feedbackMessage
      });
      addNotification('Thank you for your feedback!', 'success');
      setRating(0);
      setHoverRating(0);
      setFeedbackEmail('');
      setFeedbackMessage('');
    } catch (error) {
      addNotification('Failed to submit feedback. Please try again.', 'error');
    }
    setIsSubmitting(false);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 dark:bg-black/80 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* About & Contact */}
        <div className="md:col-span-4">
          <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-400 font-serif mb-4 block">
            SchemeMate
          </Link>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed mb-6">
            {t('footer.about_p')}
          </p>
          <ul className="space-y-4 text-sm">
             <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary-400" /> schememate@gmail.com
             </li>
             <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary-400" /> +91 9345600030
             </li>
             <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary-400 shrink-0 mt-0.5" /> 
                <span>Erode, Tamil Nadu<br/>638 452</span>
             </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3">
          <h4 className="text-lg font-bold text-white mb-6">{t('footer.quick_links')}</h4>
          <ul className="space-y-4 text-sm flex flex-col">
            <li>
              <NavLink to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={({ isActive }) => `flex items-center gap-2 transition-all duration-200 hover:translate-x-1 ${isActive ? 'text-primary-400 font-semibold' : 'text-slate-400 hover:text-primary-400'}`}>
                <Home size={16} /> {t('nav.home')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/schemes" className={({ isActive }) => `flex items-center gap-2 transition-all duration-200 hover:translate-x-1 ${isActive ? 'text-primary-400 font-semibold' : 'text-slate-400 hover:text-primary-400'}`}>
                <Search size={16} /> {t('schemes.title')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/eligibility" className={({ isActive }) => `flex items-center gap-2 transition-all duration-200 hover:translate-x-1 ${isActive ? 'text-primary-400 font-semibold' : 'text-slate-400 hover:text-primary-400'}`}>
                <FileCheck size={16} /> {t('nav.checker')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/compare" className={({ isActive }) => `flex items-center gap-2 transition-all duration-200 hover:translate-x-1 ${isActive ? 'text-primary-400 font-semibold' : 'text-slate-400 hover:text-primary-400'}`}>
                <Scale size={16} /> {t('nav.compare')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/login" className={({ isActive }) => `flex items-center gap-2 transition-all duration-200 hover:translate-x-1 ${isActive ? 'text-primary-400 font-semibold' : 'text-slate-400 hover:text-primary-400'}`}>
                <LogIn size={16} /> {t('nav.login')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className={({ isActive }) => `flex items-center gap-2 transition-all duration-200 hover:translate-x-1 ${isActive ? 'text-primary-400 font-semibold' : 'text-slate-400 hover:text-primary-400'}`}>
                <UserPlus size={16} /> {t('nav.register')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/rating" className={({ isActive }) => `flex items-center gap-2 transition-all duration-200 hover:translate-x-1 ${isActive ? 'text-primary-400 font-semibold' : 'text-slate-400 hover:text-primary-400'}`}>
                <Star size={16} /> {t('footer.rate_feedback')}
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Feedback Module */}
        <div className="md:col-span-5 bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary-500/20 transition-colors"></div>
           <h4 className="text-xl font-black text-white mb-6 flex items-center gap-3">
              <Star className="text-amber-400 fill-amber-400" size={24} />
              {t('footer.rate_platform')}
           </h4>
           <form onSubmit={handleFeedbackSubmit} className="space-y-5 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('footer.your_rating')}</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => {
                        setRating(star);
                        if (errors.rating) setErrors({ ...errors, rating: null });
                      }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-all duration-200 hover:scale-125 transform active:scale-95"
                    >
                      <Star 
                        size={28} 
                        className={`${(hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-slate-600'} transition-all`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              {errors.rating && <p className="text-xs font-bold text-red-500 mt-0">{errors.rating}</p>}
              
              <div className="space-y-4 pt-1">
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder={t('footer.email_placeholder')} 
                    className={`w-full bg-slate-900/50 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-transparent'} rounded-xl px-5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all`}
                    value={feedbackEmail}
                    onChange={(e) => {
                      setFeedbackEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                  />
                  {errors.email && <p className="text-xs font-bold text-red-500 mt-1">{errors.email}</p>}
                </div>
                
                <div className="relative">
                  <textarea 
                    placeholder={t('footer.feedback_placeholder')} 
                    rows="3"
                    className={`w-full bg-slate-900/50 border ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-transparent'} rounded-xl px-5 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none`}
                    value={feedbackMessage}
                    onChange={(e) => {
                      setFeedbackMessage(e.target.value);
                      if (errors.message) setErrors({ ...errors, message: null });
                    }}
                  ></textarea>
                  {errors.message && <p className="text-xs font-bold text-red-500 mt-1">{errors.message}</p>}
                </div>
              </div>
              
               <div className="flex gap-4 pt-2">
                 <button 
                   type="submit" 
                   disabled={isSubmitting}
                   className="flex-[2] bg-primary-600 hover:bg-primary-500 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transform active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs order-1"
                 >
                   {isSubmitting ? t('footer.submitting') : t('footer.submit')}
                 </button>
                 <button 
                   type="button" 
                   onClick={handleReset}
                   disabled={isSubmitting}
                   className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all border border-slate-700 hover:text-white uppercase tracking-widest text-xs order-2"
                 >
                   {t('feedback.btn_reset')}
                 </button>
               </div>
           </form>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-800 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <p>&copy; {currentYear} SchemeMate. {t('footer.copyright')}</p>
        <p className="mt-2 md:mt-0">{t('footer.tagline')}</p>
      </div>
    </footer>
  );
};

export default Footer;
