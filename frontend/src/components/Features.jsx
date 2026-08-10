import { useTranslation } from 'react-i18next';
import { MessageSquare, Search, CheckCircle, Scale, Globe, Sparkles } from 'lucide-react';

const Features = () => {
  const { t } = useTranslation();

  const allFeatures = [
    {
      icon: <Search className="w-8 h-8 text-purple-600 dark:text-purple-400 group-hover:animate-pulse" />,
      title: t('features.find_title'),
      description: t('features.find_desc'),
      cardBg: "bg-purple-50/30 dark:bg-purple-900/10 border-purple-100/50 dark:border-purple-800/30",
      accent: "bg-purple-100 dark:bg-purple-900/40"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 group-hover:animate-pulse" />,
      title: t('features.checker_title'),
      description: t('features.checker_desc'),
      cardBg: "bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100/50 dark:border-emerald-800/30",
      accent: "bg-emerald-100 dark:bg-emerald-900/40"
    },
    {
      icon: <Scale className="w-8 h-8 text-orange-600 dark:text-orange-400 group-hover:animate-pulse" />,
      title: t('features.compare_title'),
      description: t('features.compare_desc'),
      cardBg: "bg-orange-50/30 dark:bg-orange-900/10 border-orange-100/50 dark:border-orange-800/30",
      accent: "bg-orange-100 dark:bg-orange-900/40"
    },
    {
      icon: <Globe className="w-8 h-8 text-teal-600 dark:text-teal-400 group-hover:animate-pulse" />,
      title: t('features.i18n_title'),
      description: t('features.i18n_desc'),
      cardBg: "bg-teal-50/30 dark:bg-teal-900/10 border-teal-100/50 dark:border-teal-800/30",
      accent: "bg-teal-100 dark:bg-teal-900/40"
    }
  ];

  const FeatureCard = ({ feature, delay }) => (
    <div
      className={`feature-card-lift glass-premium p-6 rounded-3xl border ${feature.cardBg} flex flex-col items-center justify-center text-center group animate-fade-in-up relative overflow-hidden`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {feature.badge && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white tracking-wide">
          {feature.badge}
        </span>
      )}
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 ${feature.accent} shadow-inner`}>
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white tracking-tight leading-tight">{feature.title}</h3>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm max-w-[200px]">{feature.description}</p>
    </div>
  );

  return (
    <div className="py-24 bg-slate-50 dark:bg-darkBg border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 px-4 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('home.features_title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">{t('home.features_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {allFeatures.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} delay={idx * 150} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
