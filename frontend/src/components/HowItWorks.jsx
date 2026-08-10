import { UserPlus, Sparkles, FileCheck, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: <UserPlus className="w-8 h-8 text-primary-500" />,
      title: t('how_it_works.step1_title'),
      description: t('how_it_works.step1_desc'),
      bgClass: "bg-primary-50 dark:bg-primary-900/20",
      borderClass: "border-primary-100 dark:border-primary-800/30",
      hoverColor: "group-hover:text-primary-600 dark:group-hover:text-primary-400"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-amber-500" />,
      title: t('how_it_works.step2_title'),
      description: t('how_it_works.step2_desc'),
      bgClass: "bg-amber-50 dark:bg-amber-900/20",
      borderClass: "border-amber-100 dark:border-amber-800/30",
      hoverColor: "group-hover:text-amber-600 dark:group-hover:text-amber-400"
    },
    {
      icon: <FileCheck className="w-8 h-8 text-emerald-500" />,
      title: t('how_it_works.step3_title'),
      description: t('how_it_works.step3_desc'),
      bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
      borderClass: "border-emerald-100 dark:border-emerald-800/30",
      hoverColor: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
    },
    {
      icon: <Scale className="w-8 h-8 text-indigo-500" />,
      title: t('how_it_works.step4_title'),
      description: t('how_it_works.step4_desc'),
      bgClass: "bg-indigo-50 dark:bg-indigo-900/20",
      borderClass: "border-indigo-100 dark:border-indigo-800/30",
      hoverColor: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
    }
  ];

  return (
    <div className="py-20 relative overflow-hidden bg-slate-50 dark:bg-darkBg transition-colors">
      {/* Subtle background light animation */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('home.how_it_works_title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">{t('home.how_it_works_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="card p-8 aspect-square bg-white dark:bg-darkCard border border-slate-100 dark:border-slate-800 hover:border-primary-500/50 dark:hover:border-primary-500/50 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col items-center justify-center text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
               <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 border ${step.bgClass} ${step.borderClass} group-hover:scale-110 group-hover:shadow-lg group-hover:animate-pulse transition-transform duration-300 relative`}>
                  {step.icon}
                  {/* Small step number indicator */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                     {index + 1}
                  </div>
               </div>
               <h3 className={`text-xl font-bold mb-3 text-slate-800 dark:text-slate-100 ${step.hoverColor} transition-colors`}>{step.title}</h3>
               <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
