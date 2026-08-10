import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Plus, X, ArrowRightLeft } from 'lucide-react';

const Compare = () => {
  const { t } = useTranslation();
  const [allSchemes, setAllSchemes] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => {
    const saved = localStorage.getItem('compareIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all lightweight schemes for dropdown selection
    api.get('/schemes').then(res => setAllSchemes(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedIds.length > 0) {
      handleCompare();
    }
  }, []);

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;
    setLoading(true);
    try {
      const { data } = await api.post('/compare', { schemeIds: selectedIds });
      setComparisonData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScheme = (e) => {
    const id = e.target.value;
    if (id && !selectedIds.includes(id) && selectedIds.length < 3) {
      const newIds = [...selectedIds, id];
      setSelectedIds(newIds);
      localStorage.setItem('compareIds', JSON.stringify(newIds));
    }
  };

  const removeSelected = (idToRemove) => {
    const newIds = selectedIds.filter(id => id !== idToRemove);
    setSelectedIds(newIds);
    localStorage.setItem('compareIds', JSON.stringify(newIds));
    setComparisonData(comparisonData.filter(scheme => scheme._id !== idToRemove));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <ArrowRightLeft className="text-primary-500" /> {t('compare.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Select 2 to 3 schemes to compare them side-by-side. A minimum of 2 is required to start the comparison.</p>
      </div>

      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('compare.add_label')}</label>
             <select 
               className="input-field mt-0 w-full" 
               onChange={handleSelectScheme} 
               value=""
               disabled={selectedIds.length >= 3}
             >
                <option value="" disabled>{t('compare.select_placeholder')}</option>
                {allSchemes.filter(s => !selectedIds.includes(s._id)).map(s => (
                  <option key={s._id} value={s._id}>{s.schemeName}</option>
                ))}
             </select>
          </div>
          <button 
            onClick={handleCompare}
            disabled={selectedIds.length < 2 || loading}
            className="btn-primary"
          >
            {loading ? t('compare.processing') : t('compare.btn_compare')}
          </button>
        </div>

        {/* Selected Badges */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedIds.map(id => {
              const matched = allSchemes.find(s => s._id === id);
              return matched ? (
                <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {matched.schemeName}
                  <button onClick={() => removeSelected(id)} className="text-slate-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {comparisonData.length > 1 && (
        <div className="overflow-x-auto card p-0 border-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b border-r bg-slate-50 dark:bg-slate-800 dark:border-slate-700 w-1/5 text-slate-500 font-semibold uppercase text-xs">{t('compare.features')}</th>
                {comparisonData.map(scheme => (
                  <th key={scheme._id} className="p-4 border-b bg-white dark:bg-darkCard dark:border-slate-700 text-lg font-bold w-1/4">
                    {scheme.schemeName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td className="p-4 border-b border-r font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">{t('schemes.provider')}</td>
                {comparisonData.map(scheme => (
                  <td key={scheme._id} className="p-4 border-b dark:border-slate-700 capitalize">{t(`schemes.prov.${scheme.provider?.toLowerCase()}`) || scheme.provider}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b border-r font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">{t('schemes.category')}</td>
                {comparisonData.map(scheme => (
                  <td key={scheme._id} className="p-4 border-b dark:border-slate-700 capitalize">
                     <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-md text-xs">{t(`schemes.cat.${scheme.category?.toLowerCase()}`) || scheme.category}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b border-r font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">{t('scheme_details.interest_rate_title')}</td>
                {comparisonData.map(scheme => (
                  <td key={scheme._id} className="p-4 border-b dark:border-slate-700 font-bold text-lg text-emerald-600 dark:text-emerald-400">{scheme.interestRate}%</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b border-r font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">{t('compare.age_req')}</td>
                {comparisonData.map(scheme => {
                  const min = scheme.eligibility?.minAge;
                  const max = scheme.eligibility?.maxAge;
                  return (
                    <td key={scheme._id} className="p-4 border-b dark:border-slate-700">
                      {min && max ? `${min} to ${max} ${t('scheme_details.years')}` : min ? `${t('compare.min')} ${min} ${t('scheme_details.years')}` : max ? `${t('compare.max')} ${max} ${t('scheme_details.years')}` : t('compare.none')}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-4 border-b border-r font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">{t('compare.income_limits')}</td>
                {comparisonData.map(scheme => {
                  const min = scheme.eligibility?.minIncome;
                  const max = scheme.eligibility?.maxIncome;
                  return (
                    <td key={scheme._id} className="p-4 border-b dark:border-slate-700">
                      {min && max ? `₹${min} - ₹${max}` : min ? `${t('compare.min')} ₹${min}` : max ? `${t('compare.max')} ₹${max}` : t('compare.none')}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-4 border-b border-r font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">{t('compare.gender_req')}</td>
                {comparisonData.map(scheme => (
                  <td key={scheme._id} className="p-4 border-b dark:border-slate-700">
                    {scheme.eligibility?.gender?.toLowerCase() === 'all' ? t('schemes.gender_all') : scheme.eligibility?.gender || t('schemes.gender_all')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b border-r font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">{t('compare.community_req')}</td>
                {comparisonData.map(scheme => (
                  <td key={scheme._id} className="p-4 border-b dark:border-slate-700">
                    {scheme.eligibility?.community?.length > 0 ? scheme.eligibility.community.join(', ') : t('compare.all_communities')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b border-r font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">{t('compare.state_req')}</td>
                {comparisonData.map(scheme => (
                  <td key={scheme._id} className="p-4 border-b dark:border-slate-700">{scheme.state || t('compare.national_all')}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b border-r font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">{t('compare.marital_req')}</td>
                {comparisonData.map(scheme => (
                  <td key={scheme._id} className="p-4 border-b dark:border-slate-700">
                    {scheme.eligibility?.maritalStatus || t('compare.any')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b border-r font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">{t('compare.differently_abled')}</td>
                {comparisonData.map(scheme => (
                  <td key={scheme._id} className="p-4 border-b dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {scheme.eligibility?.differentlyAbled ? t('compare.required') : t('compare.not_required')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b border-r font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">{t('compare.documents_req')}</td>
                {comparisonData.map(scheme => (
                  <td key={scheme._id} className="p-4 border-b dark:border-slate-700">
                     <ul className="list-disc pl-4 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                        {scheme.documents && scheme.documents.length > 0 ? (
                           scheme.documents.map((doc, i) => <li key={i}>{doc}</li>)
                        ) : (
                           <li>{t('compare.standard_kyc')}</li>
                        )}
                     </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b border-r font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">{t('compare.benefits_req')}</td>
                {comparisonData.map(scheme => (
                  <td key={scheme._id} className="p-4 border-b dark:border-slate-700 text-slate-600 dark:text-slate-300">{scheme.benefits}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Compare;
