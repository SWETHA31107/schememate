import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, HandCoins } from 'lucide-react';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg transition-colors py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-primary-900 to-slate-900 z-0 opacity-90"></div>
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-primary-500 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 -right-1/4 w-1/2 h-full bg-secondary rounded-full blur-[120px]"></div>
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center h-full pt-16">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 animate-fade-in font-serif tracking-tight leading-tight px-4">
              {t('home.hero_title')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t('home.hero_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <Link to="/schemes" className="btn-primary py-4 px-10 text-xl font-bold">
                {t('home.find_btn')}
              </Link>
              <Link to="/eligibility" className="btn-secondary">
                {t('home.check_btn')}
              </Link>
            </div>
          </div>
        </section>

        <HowItWorks />
        <Features />
      </div>
    </div>
  );
};

export default Home;
