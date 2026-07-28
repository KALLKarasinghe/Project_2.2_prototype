import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SupplierAnalytics = ({ currentUser, setActiveTab }) => {
  const [salesData, setSalesData] = useState([]);
  const [aiInsight, setAiInsight] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // fetch AI insights from backend
  const handleGenerateAiInsights = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch(`http://localhost/pharma_backend/api/ai_sales_analytics.php?supplier_id=${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        setSalesData(data.data.chartData);
        setAiInsight(data.data.insight);
        toast.success('AI Insights Generated Successfully!');
      } else {
        toast.error(data.message || data.error || 'Failed to fetch AI insights');
      }
    } catch (err) {
      toast.error('Network error occurred while fetching AI insights.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">AI-Powered Sales Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">Generate AI insights and predictions based on your historical sales data.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleGenerateAiInsights}
            disabled={isAiLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-70 shrink-0"
          >
            {isAiLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Generate AI Insights
              </>
            )}
          </button>
          
          {/* User profile button */}
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-12 h-12 shrink-0 rounded-full overflow-hidden border-2 border-indigo-200 hover:border-indigo-500 shadow-md transition-all hover:scale-105 bg-white flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            title="My Profile"
          >
            {currentUser?.profile_pic ? (
              <img src={`http://localhost${currentUser.profile_pic}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-slate-400">{currentUser?.name?.charAt(0) || 'U'}</span>
            )}
          </button>
        </div>
      </div>

      {aiInsight && (
        <div className="mb-8 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-2xl opacity-50"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-1">Gemini AI Insight</h3>
              <p className="text-indigo-800 font-medium leading-relaxed">{aiInsight}</p>
            </div>
          </div>
        </div>
      )}

      {salesData.length > 0 ? (
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `Rs. ${value}`} width={80} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                formatter={(value, name) => [`Rs. ${value.toFixed(2)}`, name === 'sales' ? 'Actual Sales' : 'Predicted Sales']}
              />
              <Legend iconType="circle" />
              <Line type="monotone" dataKey="sales" name="Actual Sales" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: '#fff' }} connectNulls />
              <Line type="monotone" dataKey="predicted_sales" name="AI Prediction" stroke="#9333ea" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#9333ea', strokeWidth: 2, fill: '#fff' }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl h-64 border border-slate-200 border-dashed flex items-center justify-center">
          <p className="text-slate-400 font-medium">Click the button above to generate your AI Sales Analytics.</p>
        </div>
      )}
    </div>
  );
};

export default SupplierAnalytics;
