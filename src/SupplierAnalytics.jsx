import React, { useState, useEffect } from 'react';

const SupplierAnalytics = ({ currentUser, setActiveTab }) => {
  const [hasPremium, setHasPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSub = async () => {
      try {
        const res = await fetch(`http://localhost/pharma_backend/api/subscription.php?user_id=${currentUser.id}`);
        const data = await res.json();
        if (data.success && data.data?.status === 'Active') {
          setHasPremium(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkSub();
  }, [currentUser]);

  if (loading) return <div className="p-8 text-center text-slate-500">Checking premium access...</div>;

  if (!hasPremium) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center max-w-2xl mx-auto mt-10 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3">Premium Analytics Locked</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Unlock advanced sales forecasting, inventory demand trends, and detailed revenue reports with a platform membership.
        </p>
        <button 
          onClick={() => setActiveTab('subscriptions')} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-sm inline-flex items-center gap-2"
        >
          View Membership Plans
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Advanced Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">Premium feature: Real-time insights for your business.</p>
        </div>
        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          Premium Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Demand Forecast</p>
          <p className="text-2xl font-black text-slate-900">+24%</p>
          <p className="text-xs text-slate-500 mt-1">Expected growth next month</p>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Inventory Health</p>
          <p className="text-2xl font-black text-slate-900">Optimal</p>
          <p className="text-xs text-slate-500 mt-1">Based on current burn rate</p>
        </div>
        <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6">
          <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Market Share</p>
          <p className="text-2xl font-black text-slate-900">12.4%</p>
          <p className="text-xs text-slate-500 mt-1">In your selected categories</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl h-64 border border-slate-200 border-dashed flex items-center justify-center">
         <p className="text-slate-400 font-medium">Detailed Charts & Graphs Area (Pro Version)</p>
      </div>
    </div>
  );
};

export default SupplierAnalytics;
