import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ProfileSettings from './ProfileSettings';
import Navbar from './Navbar';

// Reusable empty state component
const EmptyState = ({ icon, title, description }) => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
      {icon}
    </div>
    <p className="text-lg font-semibold text-slate-600">{title}</p>
    <p className="text-slate-400 mt-1 text-sm">{description}</p>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { users, currentUser, pendingUsers, orders, medicines, approveUser, deleteUser, logoutUser } = useSystemStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminVerifyUsers, setAdminVerifyUsers] = useState([]);
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalOrders: 0,
    totalMedicines: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [aiInsight, setAiInsight] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [commissions, setCommissions] = useState({
    total_commissions: 0,
    companies: [],
    current_rate: 1.0
  });
  const [newRate, setNewRate] = useState('');
  const [systemLogs, setSystemLogs] = useState([]);

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 15;

  const [logsPage, setLogsPage] = useState(1);
  const LOGS_PER_PAGE = 20;

  // fetch users needing verification
  const fetchPendingVerifications = async () => {
    try {
      const res = await fetch('http://localhost/pharma_backend/api/admin_verify.php');
      const data = await res.json();
      if (data.success) {
        setAdminVerifyUsers(data.data.filter(u => u.role?.toLowerCase() !== 'pharmacy'));
      }
    } catch (err) {
      console.error('Failed to fetch pending verifications', err);
    }
  };

  // get basic system stats
  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost/pharma_backend/api/admin_stats.php');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    }
  };

  const fetchSalesData = async () => {
    try {
      const res = await fetch('http://localhost/pharma_backend/api/admin_sales_chart.php');
      const data = await res.json();
      if (data.success) {
        setSalesData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sales data', err);
    }
  };

  const fetchCommissions = async () => {
    try {
      const res = await fetch('http://localhost/pharma_backend/api/admin_commissions.php');
      const data = await res.json();
      if (data.success) {
        setCommissions(data.data);
        setNewRate(data.data.current_rate);
      }
    } catch (err) {
      console.error('Failed to fetch commissions', err);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const res = await fetch('http://localhost/pharma_backend/api/admin_logs.php');
      const data = await res.json();
      if (data.success) {
        setSystemLogs(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch system logs', err);
    }
  };

  const handleGenerateAiInsights = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('http://localhost/pharma_backend/api/ai_sales_analytics.php');
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

  React.useEffect(() => {
    fetchPendingVerifications();
    fetchStats();
    fetchSalesData();
    fetchCommissions();
    fetchSystemLogs();
  }, []);

  const handleVerifyAction = async (userId, action, userName) => {
    try {
      const res = await fetch('http://localhost/pharma_backend/api/admin_verify.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${userName} has been ${action}d!`);
        fetchPendingVerifications();
      } else {
        toast.error(data.error || 'Action failed.');
      }
    } catch (err) {
      toast.error('Network error occurred.');
    }
  };

  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`Are you sure you want to remove ${userName}?`)) {
      deleteUser(userId);
      toast.success(`${userName} has been removed from the system.`);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/admin-login');
  };

  const handleUpdateRate = async () => {
    if (!newRate || isNaN(newRate) || newRate < 0) {
      toast.error('Please enter a valid percentage number.');
      return;
    }
    try {
      const res = await fetch('http://localhost/pharma_backend/api/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commission_rate: parseFloat(newRate) })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Commission rate updated to ${newRate}%!`);
        fetchCommissions();
      } else {
        toast.error(data.error || 'Failed to update rate.');
      }
    } catch (err) {
      toast.error('Network error occurred.');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { id: 'commissions', label: 'Revenue & Commissions', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { id: 'users', label: 'User Management', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
    { id: 'logs', label: 'System Logs', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  ];

  const Sidebar = () => (
    <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col shadow-xl transition-transform duration-300`}>
      <div className="p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Admin Portal</h2>
          <p className="text-xs text-slate-400 mt-1 font-semibold tracking-wider uppercase">Global Medicine</p>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-white w-full px-4 py-3 rounded-xl font-medium transition-colors hover:bg-slate-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign Out
        </button>
      </div>
    </aside>
  );

  // helper to get document display
  const renderUserDocument = (user) => {
    if (user.license_file_path) {
      return <a href={`http://localhost/pharma_backend/uploads/${user.license_file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline bg-blue-50 px-2 py-1 rounded">View License</a>;
    } else if (user.br_number) {
      return <span className="font-mono text-slate-700">BR: {user.br_number}</span>;
    } else if (user.license_no) {
      return <span className="font-mono text-slate-700">Lic: {user.license_no}</span>;
    } else {
      return <span className="italic text-slate-400">No document</span>;
    }
  };

  // Filter and paginate users
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    user.role?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );
  
  const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);

  // Paginate logs
  const totalLogPages = Math.ceil(systemLogs.length / LOGS_PER_PAGE) || 1;
  const paginatedLogs = [...systemLogs].reverse().slice((logsPage - 1) * LOGS_PER_PAGE, logsPage * LOGS_PER_PAGE);

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}
        <Sidebar />

        <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="font-bold text-slate-800">Admin Portal</span>
          </div>
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 rounded-full overflow-hidden border border-slate-200"
          >
            {currentUser?.profile_pic ? (
              <img src={`http://localhost${currentUser.profile_pic}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-slate-400 bg-slate-100 w-full h-full flex items-center justify-center">{currentUser?.name?.charAt(0) || 'U'}</span>
            )}
          </button>
        </div>

        <div className="p-6 md:p-8 lg:p-10 pr-24 md:pr-24 lg:pr-28 max-w-7xl mx-auto relative">
          
          {/* Desktop Top Right Profile Avatar */}
          <div className="hidden md:block absolute top-8 right-10 z-20">
            <button 
              onClick={() => setActiveTab(activeTab === 'profile' ? 'dashboard' : 'profile')}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-200 hover:border-indigo-500 shadow-md transition-all hover:scale-105 bg-white flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              title="My Profile"
            >
              {currentUser?.profile_pic ? (
                <img src={`http://localhost${currentUser.profile_pic}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-slate-400">{currentUser?.name?.charAt(0) || 'U'}</span>
              )}
            </button>
          </div>

          {activeTab === 'profile' && <ProfileSettings />}

          <header className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && 'System Dashboard'}
              {activeTab === 'commissions' && 'Revenue & Commissions'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'logs' && 'System Action Logs'}
            </h1>
            <p className="text-slate-500 mt-2">
              {activeTab === 'dashboard' && 'Monitor operations and verify facility accounts.'}
              {activeTab === 'commissions' && 'Manage platform earnings from order commissions and memberships.'}
              {activeTab === 'users' && 'Manage all active user accounts and their roles.'}
              {activeTab === 'logs' && 'Recent order activities across the platform.'}
            </p>
          </header>

          {activeTab === 'dashboard' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {[
                  { title: 'Total Active Users', value: stats.activeUsers, color: 'blue', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                  { title: 'Total System Orders', value: stats.totalOrders, color: 'emerald', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                  { title: 'Medicine Inventory', value: stats.totalMedicines, color: 'indigo', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
                ].map((card, idx) => (
                  <div key={idx} className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4`}>
                    <div className={`w-14 h-14 rounded-xl bg-${card.color}-50 flex items-center justify-center text-${card.color}-600 shrink-0`}>
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                      <h3 className="text-3xl font-black text-slate-800">{card.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly Sales Chart */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">AI-Powered Sales Analytics</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Historical transactions and AI-predicted future trends.</p>
                  </div>
                  <button 
                    onClick={handleGenerateAiInsights}
                    disabled={isAiLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-70"
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
                </div>

                {aiInsight && (
                  <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl relative overflow-hidden">
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

                <div className="h-80 w-full">
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
              </section>

              {/* Pending License Verifications */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Pending License Verifications</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Review credentials and approve new facility accounts.</p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    {adminVerifyUsers.length} Pending
                  </span>
                </div>
                {adminVerifyUsers.length === 0 ? (
                  <EmptyState
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    title="All caught up!"
                    description="No pending license verifications at the moment."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead><tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="px-6 py-4">Name & Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Document</th><th className="px-6 py-4 text-right">Actions</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminVerifyUsers.map(user => (
                          <tr key={user.user_id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                              {user.status === 'Active' && user.admin_approved == 0 && (
                                <span className="inline-block mt-1 bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200">
                                  Awaiting Medicine Approval
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-blue-100">{user.role}</span></td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {renderUserDocument(user)}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button onClick={() => handleVerifyAction(user.user_id, 'approve', user.name)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm">Approve</button>
                              <button onClick={() => handleVerifyAction(user.user_id, 'reject', user.name)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm">Reject</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search users by name or role..."
                    value={userSearchQuery}
                    onChange={(e) => { setUserSearchQuery(e.target.value); setUserPage(1); }}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {filteredUsers.length === 0 ? (
                  <EmptyState
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>}
                    title="No users found"
                    description={userSearchQuery ? "Try adjusting your search query." : "Approved users will appear here."}
                  />
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead><tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-900">{user.name}</td>
                              <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-blue-100">{user.role}</span></td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {user.license_document && (
                                  <a href={`http://localhost/pharma_backend/uploads/${user.license_document}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors hover:underline">View License</a>
                                )}
                                <button onClick={() => handleDeleteUser(user.id, user.name)} className="text-red-400 hover:text-red-600 font-semibold text-sm transition-colors hover:underline ml-3">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {totalUserPages > 1 && (
                      <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                        <p className="text-sm text-slate-700">
                          Showing <span className="font-bold">{(userPage - 1) * USERS_PER_PAGE + 1}</span> to <span className="font-bold">{Math.min(userPage * USERS_PER_PAGE, filteredUsers.length)}</span> of <span className="font-bold">{filteredUsers.length}</span> results
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setUserPage(p => Math.max(1, p - 1))}
                            disabled={userPage === 1}
                            className="px-3 py-1 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                            disabled={userPage === totalUserPages}
                            className="px-3 py-1 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          )}

          {activeTab === 'commissions' && (
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Platform Commission Rate</h2>
                  <p className="text-sm text-slate-500 mt-1">Current rate applied to all supplier products.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1" 
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      className="w-24 bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-4 top-2.5 text-slate-500 font-bold">%</span>
                  </div>
                  <button 
                    onClick={handleUpdateRate}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm"
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex items-center gap-4 text-white max-w-sm">
                    <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center shrink-0">
                      <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Sales Commissions</p>
                      <h3 className="text-3xl font-black">Rs. {commissions.total_commissions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>
              </div>

              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800">Company Sales Breakdown</h2>
                </div>
                {commissions.companies.length === 0 ? (
                  <EmptyState
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                    title="No Company Sales Data"
                    description="When pharmacies place orders, supplier sales and your commission will appear here."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                          <th className="px-6 py-4">Company / Supplier Name</th>
                          <th className="px-6 py-4">Total Sales (Base)</th>
                          <th className="px-6 py-4">Platform Commission ({commissions.current_rate}%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {commissions.companies.map((comp, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{comp.company_name}</td>
                            <td className="px-6 py-4 font-medium text-slate-600">Rs. {Number(comp.base_sales).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            <td className="px-6 py-4 font-black text-amber-600">Rs. {Number(comp.commission).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'logs' && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {systemLogs.length === 0 ? (
                <EmptyState
                  icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  title="No logs generated yet"
                  description="System actions will appear here automatically as orders are placed."
                />
              ) : (
                <>
                  <div className="p-6 space-y-4">
                    {paginatedLogs.map(order => (
                      <div key={order.id} className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className={`p-2.5 rounded-xl shrink-0 ${order.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {order.status === 'Approved'
                            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        </div>
                        <div>
                          <p className="text-slate-800 font-medium">Order <span className="font-bold">#{order.id.slice(-6)}</span> — <span className="font-bold text-blue-600">{order.quantity} units</span> of <span className="font-bold">{order.medicineName}</span></p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded mt-1 inline-block border ${order.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{order.status.toUpperCase()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalLogPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                      <p className="text-sm text-slate-700">
                        Showing <span className="font-bold">{(logsPage - 1) * LOGS_PER_PAGE + 1}</span> to <span className="font-bold">{Math.min(logsPage * LOGS_PER_PAGE, systemLogs.length)}</span> of <span className="font-bold">{systemLogs.length}</span> results
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                          disabled={logsPage === 1}
                          className="px-3 py-1 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setLogsPage(p => Math.min(totalLogPages, p + 1))}
                          disabled={logsPage === totalLogPages}
                          className="px-3 py-1 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
