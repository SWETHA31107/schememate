import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, AlertCircle } from 'lucide-react';

const EMICalculator = () => {
  const { t } = useTranslation();
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  
  const [error, setError] = useState('');
  
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    setError('');
    
    const P = parseFloat(principal);
    const r = parseFloat(rate);
    const n = parseFloat(tenure);
    
    if (isNaN(P) || P <= 0) {
      setError(t('emi.error_amount'));
      return;
    }
    if (isNaN(r) || r <= 0 || r > 100) {
      setError(t('emi.error_rate'));
      return;
    }
    if (isNaN(n) || n <= 0 || !Number.isInteger(n)) {
      setError(t('emi.error_tenure'));
      return;
    }

    const monthlyRate = r / 12 / 100;
    const emi = (P * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    
    setResult({
      emi: emi,
      principal: P,
      totalInterest: (emi * n) - P,
      totalAmount: emi * n
    });
  };

  const handleReset = () => {
    setPrincipal('');
    setRate('');
    setTenure('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-center">
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4 shadow-sm">
          <Calculator size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-serif tracking-tight">{t('emi.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">{t('emi.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
        {/* Input Form Area */}
        <div className="card p-8 bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg h-full flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">{t('emi.loan_details')}</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg flex items-start gap-3 text-red-700 dark:text-red-400">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleCalculate} className="space-y-6 flex-grow flex flex-col justify-center">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('emi.amount')}</label>
              <input 
                type="number" 
                value={principal} 
                onChange={(e) => setPrincipal(e.target.value)} 
                placeholder="e.g. 500000"
                className="input-field text-lg font-medium py-3"
                min="0"
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('emi.rate')}</label>
              <input 
                type="number" 
                value={rate} 
                onChange={(e) => setRate(e.target.value)} 
                placeholder="e.g. 10.5"
                className="input-field text-lg font-medium py-3"
                min="0"
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('emi.tenure')}</label>
              <input 
                type="number" 
                value={tenure} 
                onChange={(e) => setTenure(e.target.value)} 
                placeholder="e.g. 60"
                className="input-field text-lg font-medium py-3"
                min="0"
                step="1"
              />
            </div>

            <div className="pt-4 flex gap-4">
              <button type="submit" className="btn-primary py-3 flex-1 text-lg">
                {t('emi.btn_calc')}
              </button>
              {result && (
                <button type="button" onClick={handleReset} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition font-medium">
                  {t('emi.btn_reset')}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Area */}
        <div className="card p-8 bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/10 border border-primary-100 dark:border-primary-800/30 rounded-2xl shadow-lg h-full flex flex-col justify-center items-center text-center">
          {result ? (
            <div className="space-y-8 w-full animate-fade-in-up">
              <div>
                <p className="text-primary-700 dark:text-primary-400 mb-2 font-bold uppercase tracking-wider text-sm">{t('emi.monthly_emi')}</p>
                <h2 className="text-5xl lg:text-6xl font-extrabold text-primary-600 dark:text-primary-400">₹{Math.round(result.emi).toLocaleString()}</h2>
              </div>
              
              <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-primary-200/50 dark:border-primary-700/30 shadow-sm text-left space-y-4">
                <div className="flex justify-between items-center text-sm md:text-base">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{t('emi.principal')}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">₹{Math.round(result.principal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm md:text-base">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{t('emi.interest')}</span>
                  <span className="font-bold text-slate-900 dark:text-white-100">₹{Math.round(result.totalInterest).toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center bg-transparent">
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{t('emi.total_payment')}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-xl">₹{Math.round(result.totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 opacity-60">
                <Calculator size={80} className="mb-6 stroke-1" />
                <p className="text-xl font-medium">{t('emi.awaiting_desc')}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EMICalculator;
