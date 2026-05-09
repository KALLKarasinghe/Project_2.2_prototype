import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import toast from 'react-hot-toast';

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

  const handleApprove = (userId, userName) => {
    approveUser(userId);
    toast.success(`${userName} has been approved successfully!`);
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
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
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'logs' && 'System Action Logs'}
            </h1>
            <p className="text-slate-500 mt-2">
              {activeTab === 'dashboard' && 'Monitor operations and verify facility accounts.'}
              {activeTab === 'users' && 'Manage all active user accounts and their roles.'}
              {activeTab === 'logs' && 'Recent order activities across the platform.'}
            </p>
          </header>

          {activeTab === 'dashboard' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {[
                  { title: 'Total Active Users', value: users.length, color: 'blue', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                  { title: 'Total System Orders', value: orders.length, color: 'emerald', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                  { title: 'Medicine Inventory', value: medicines.length, color: 'indigo', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
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

              {/* Pending License Verifications */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Pending License Verifications</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Review credentials and approve new facility accounts.</p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    {pendingUsers.length} Pending
                  </span>
                </div>
                {pendingUsers.length === 0 ? (
                  <EmptyState
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    title="All caught up!"
                    description="No pending license verifications at the moment."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead><tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Document</th><th className="px-6 py-4 text-right">Action</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingUsers.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4"><p className="font-bold text-slate-900">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></td>
                            <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-blue-100">{user.role}</span></td>
                            <td className="px-6 py-4 text-sm text-slate-500">{user.licenseDocument || <span className="italic">No document</span>}</td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => handleApprove(user.id, user.name)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm">Approve</button>
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
