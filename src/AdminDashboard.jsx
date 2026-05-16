import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const { users, pendingUsers, orders, medicines, approveUser, deleteUser, logoutUser } = useSystemStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminVerifyUsers, setAdminVerifyUsers] = useState([]);
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalOrders: 0,
    totalMedicines: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [commissions, setCommissions] = useState({
    total_commissions: 0,
    subscription_revenue: 0,
    total_subs: 0,
    companies: [],
    current_rate: 1.0
  });
  const [newRate, setNewRate] = useState('');

  const fetchPendingVerifications = async () => {
    try {
      const res = await fetch('http://localhost/pharma_backend/api/admin_verify.php');
      const data = await res.json();
      if (data.success) {
        setAdminVerifyUsers(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch pending verifications', err);
    }
  };

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

  React.useEffect(() => {
    fetchPendingVerifications();
    fetchStats();
    fetchSalesData();
    fetchCommissions();
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

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="font-bold text-slate-800">Admin Portal</span>
        </div>

        <div className="p-6 lg:p-10">
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
                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900">Monthly Sales Overview</h2>
                  <p className="text-slate-500 text-sm mt-0.5">Total system transaction volume across all suppliers.</p>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `Rs. ${value}`} width={80} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`Rs. ${value.toFixed(2)}`, 'Sales']}
                      />
                      <Legend iconType="circle" />
                      <Line type="monotone" dataKey="sales" name="Total Revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: '#fff' }} />
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
                            <td className="px-6 py-4"><p className="font-bold text-slate-900">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></td>
                            <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-blue-100">{user.role}</span></td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {user.license_file_path ? (
                                <a href={`http://localhost/pharma_backend/uploads/${user.license_file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline bg-blue-50 px-2 py-1 rounded">View License</a>
                              ) : user.br_number ? (
                                <span className="font-mono text-slate-700">BR: {user.br_number}</span>
                              ) : user.license_no ? (
                                <span className="font-mono text-slate-700">Lic: {user.license_no}</span>
                              ) : (
                                <span className="italic text-slate-400">No document</span>
                              )}
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
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {users.length === 0 ? (
                <EmptyState
                  icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>}
                  title="No active users"
                  description="Approved users will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{user.name}</td>
                          <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-blue-100">{user.role}</span></td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeleteUser(user.id, user.name)} className="text-red-400 hover:text-red-600 font-semibold text-sm transition-colors hover:underline ml-3">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex items-center gap-4 text-white">
                    <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center shrink-0">
                      <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Sales Commissions</p>
                      <h3 className="text-3xl font-black">Rs. {commissions.total_commissions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl shadow-lg border border-indigo-500 flex items-center gap-4 text-white">
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Premium Subscriptions ({commissions.total_subs})</p>
                      <h3 className="text-3xl font-black">Rs. {commissions.subscription_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
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
              {orders.length === 0 ? (
                <EmptyState
                  icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  title="No logs generated yet"
                  description="System actions will appear here automatically as orders are placed."
                />
              ) : (
                <div className="p-6 space-y-4">
                  {[...orders].reverse().map(order => (
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
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
