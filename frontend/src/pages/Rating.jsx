import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Send, MessageSquare, Mail, Award, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const Rating = () => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      addNotification('Please select a star rating', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/feedback', { email, rating, message });
      addNotification('Thank you for your feedback!', 'success');
      setTimeout(() => {
        navigate('/admin?tab=feedback');
      }, 1500);
    } catch (error) {
      addNotification('Failed to submit. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[3rem] p-10 shadow-2xl text-center border border-slate-100 dark:border-slate-700 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">You're Awesome!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Your feedback helps us build a better SchemeMate for everyone. We've received your rating of {rating} stars.</p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="w-full btn-primary py-4 rounded-2xl shadow-xl shadow-primary-500/20"
          >
            Submit Another?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white font-serif tracking-tight mb-4">Rate Your Experience</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">We value your thoughts! Tell us how we’re doing and where we can improve your financial journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-700">
        <div className="space-y-8">
           <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-600">Step 1: The Rating</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      size={48} 
                      className={`${(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'text-slate-200 dark:text-slate-700'} transition-all duration-300`} 
                    />
                  </button>
                ))}
              </div>
           </div>

           <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                 <Award className="text-primary-500" />
                 <span className="font-bold">Trusted by 2.5k+ Users</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                 <MessageSquare className="text-primary-500" />
                 <span className="font-bold">Real-time Admin Review</span>
              </div>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-900 dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Your Message</label>
              <textarea 
                required 
                rows="4" 
                placeholder="What did you love? What can we fix?"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-900 dark:text-white resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
           </div>

           <button 
             type="submit" 
             disabled={isSubmitting}
             className="w-full btn-primary py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary-500/25 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
           >
              {isSubmitting ? 'Sending...' : 'Send Feedback'} 
              {!isSubmitting && <Send size={16} />}
           </button>
        </form>
      </div>
    </div>
  );
};

export default Rating;
