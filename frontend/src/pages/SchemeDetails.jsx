import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, CheckCircle, ShieldAlert, FileText, Activity,
  MapPin, Users, Briefcase, Home, Star, ExternalLink, ClipboardCheck, Bookmark, BookmarkCheck
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

// Category color theme
const categoryTheme = {
  insurance: { border: 'border-t-emerald-500', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', icon: '🛡️' },
  loan:       { border: 'border-t-blue-500',    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',       icon: '🏦' },
  pension:    { border: 'border-t-purple-500',  badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400', icon: '👴' },
  savings:    { border: 'border-t-amber-500',   badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',   icon: '💰' },
};

const SchemeDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();
  const [savedSchemes, setSavedSchemes] = useState(() => JSON.parse(localStorage.getItem('savedSchemes') || '[]'));

  const saveAlertShownRef = useRef(false);

  const handleSaveToggle = () => {
    setSavedSchemes(prev => {
      let newList;
      if (prev.includes(id)) {
        newList = prev.filter(item => item !== id);
        // Silent remove to avoid spam
      } else {
        newList = [...prev, id];
        if (!saveAlertShownRef.current) {
          addNotification("Scheme saved successfully!", 'success');
          saveAlertShownRef.current = true;
        }
      }
      localStorage.setItem('savedSchemes', JSON.stringify(newList));
      return newList;
    });
  };

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const { data } = await api.get(`/schemes/${id}`);
        setScheme(data);
      } catch (error) {
        console.error('Error fetching scheme details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScheme();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 dark:text-slate-400">{t('scheme_details.loading')}</p>
      </div>
    </div>
  );

  if (!scheme) return (
    <div className="p-8 text-center text-red-500">
      <ShieldAlert className="mx-auto mb-2" size={40} />
      <p>{t('scheme_details.not_found')}</p>
    </div>
  );

  const theme = categoryTheme[scheme.category?.toLowerCase()] || categoryTheme.savings;
  const isNotApplicableRate = !scheme.interestRate || scheme.interestRate === 0;

  const eligRows = [
    { icon: <Users size={16} />, label: t('scheme_details.age_limit'), value: (scheme.eligibility?.minAge === 0 && scheme.eligibility?.maxAge >= 100) ? t('scheme_details.no_age_restriction') : `${scheme.eligibility?.minAge} – ${scheme.eligibility?.maxAge} ${t('scheme_details.years')}` },
    { icon: <Users size={16} />, label: t('schemes.gender'), value: scheme.eligibility?.gender?.toLowerCase() === 'all' ? t('schemes.gender_all') : scheme.eligibility?.gender || t('schemes.gender_all') },
    { icon: <MapPin size={16} />, label: t('scheme_details.residence'), value: scheme.state || 'N/A' },
    { icon: <Star size={16} />, label: t('scheme_details.income_limit'), value: scheme.eligibility?.maxIncome ? `≤ ₹${scheme.eligibility.maxIncome.toLocaleString('en-IN')} / year` : 'No Limit' },
    { icon: <Briefcase size={16} />, label: t('scheme_details.employment'), value: scheme.eligibility?.jobType?.join(', ') || t('schemes.gender_all') },
    { icon: <Users size={16} />, label: t('scheme_details.social'), value: scheme.eligibility?.community?.join(', ') || t('schemes.gender_all') },
    { icon: <Home size={16} />, label: t('scheme_details.marital'), value: scheme.eligibility?.maritalStatus || t('schemes.interest_na') },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      {/* Back Button */}
      <Link to="/schemes" className="inline-flex items-center text-slate-500 hover:text-primary-600 mb-6 transition font-medium gap-2">
        <ArrowLeft size={16} /> {t('scheme_details.back')}
      </Link>

      <div className={`card border-t-4 ${theme.border} p-0 overflow-hidden`}>

        {/* ── HEADER ── */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{theme.icon}</span>
                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
                  {t(`schemes.cat.${scheme.category?.toLowerCase()}`) || scheme.category}
                </span>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md uppercase font-semibold tracking-wider">
                  {t(`schemes.prov.${scheme.provider?.toLowerCase()}`) || scheme.provider}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight mb-1">
                {scheme.schemeName}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin size={14} /> {scheme.state}
              </p>
            </div>

            <div className="text-center md:text-right shrink-0 flex flex-col md:items-end p-2 gap-4">
              <button 
                 onClick={handleSaveToggle}
                 className="self-end p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-primary-600 hover:scale-110 active:scale-95 transition-all w-10 h-10 flex items-center justify-center"
                 title={savedSchemes.includes(id) ? "Unsave Scheme" : "Save Scheme"}
              >
                 {savedSchemes.includes(id) ? <BookmarkCheck size={20} className="text-primary-600 fill-primary-600" /> : <Bookmark size={20} />}
              </button>
              <div>
                {isNotApplicableRate ? (
                  <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-lg font-semibold text-sm border border-slate-200 dark:border-slate-700">
                    {t('schemes.interest_na')}
                  </span>
                ) : (
                  <span className="inline-block bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-4 py-2 rounded-lg font-bold text-2xl border border-emerald-100 dark:border-emerald-800/30">
                    {scheme.interestRate}%
                  </span>
                )}
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">{t('scheme_details.interest_rate_title')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">

          {/* ── DESCRIPTION ── */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="text-primary-500" size={20} /> {t('scheme_details.description')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {scheme.description}
            </p>
          </section>

          {/* ── BENEFITS ── */}
          <section className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="text-emerald-500" size={20} /> {t('scheme_details.benefits')}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.isArray(scheme.benefits) ? scheme.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <span className="mt-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0">✓</span>
                  {b}
                </li>
              )) : <li>{scheme.benefits}</li>}
            </ul>
          </section>

          {/* ── ELIGIBILITY ── */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="text-amber-500" size={20} /> {t('scheme_details.eligibility')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eligRows.map((row, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  <span className="text-primary-500 mt-0.5 shrink-0">{row.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{row.label}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── DOCUMENTS ── */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="text-indigo-500" size={20} /> {t('scheme_details.documents')}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {scheme.documents?.map((doc, idx) => (
                <li key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs shrink-0 font-bold">{idx + 1}</span>
                  {doc}
                </li>
              ))}
            </ul>
          </section>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <Link
              to="/eligibility"
              className="inline-flex items-center gap-2 py-3 px-10 text-base rounded-xl border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-semibold transition-all"
            >
              <ClipboardCheck size={18} />
              {t('scheme_details.check_my_eligibility')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetails;
