import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import toast from 'react-hot-toast';
import ProfileSettings from './ProfileSettings';
import Navbar from './Navbar';

const EmptyState = ({ icon, title, description }) => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">{icon}</div>
    <p className="text-lg font-semibold text-slate-600">{title}</p>
    <p className="text-slate-400 mt-1 text-sm">{description}</p>
  </div>
);

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { logoutUser, specialMedicines, addSpecialMedicine, currentUser } = useSystemStore();
  const [activeTab, setActiveTab] = useState('requests');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // New Special Medicine Form State
  const [newMedName, setNewMedName] = useState('');
  const [newMedUsedFor, setNewMedUsedFor] = useState('');
  const [newMedContact, setNewMedContact] = useState('');

  // save the new special medicine to the system
  const handleAddSpecialMedicine = (e) => {
    e.preventDefault();
    if (!newMedName || !newMedUsedFor || !newMedContact) return;
    addSpecialMedicine({
      name: newMedName,
      usedFor: newMedUsedFor,
      agentName: currentUser.name,
      agentPhone: newMedContact
    });
    setNewMedName('');
    setNewMedUsedFor('');
    setNewMedContact('');
    toast.success('Special medicine added successfully!');
  };

  const [specialInventory] = useState([
    { id: 'sm1', name: 'Pembrolizumab (Keytruda)', category: 'Oncology', stock: 12, price: 1500000 },
    { id: 'sm2', name: 'Nivolumab (Opdivo)', category: 'Oncology', stock: 8, price: 1200000 },
    { id: 'sm3', name: 'Eculizumab (Soliris)', category: 'Rare Disease', stock: 5, price: 2000000 },
  ]);

  const [specialRequests, setSpecialRequests] = useState([
    { id: 'req1', patientName: 'Saman Kumara', medicine: 'Pembrolizumab', prescription: 'saman_rx.pdf', status: 'Pending' },
    { id: 'req2', patientName: 'Nimali Perera', medicine: 'Nivolumab', prescription: 'nimali_oncology.pdf', status: 'Pending' },
  ]);

  // approve a special request from a patient
  const handleApprove = (reqId, patientName) => {
    setSpecialRequests(prev => prev.map(req => req.id === reqId ? { ...req, status: 'Approved' } : req));
    toast.success(`Request for ${patientName} has been approved!`);
  };

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  const navItems = [
    { id: 'requests', label: 'Patient Requests', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'inventory', label: 'Special Inventory', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'special_medicines', label: 'Manage Special Medicines', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  ];

  const Sidebar = () => (
    <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-fuchsia-950 text-white flex flex-col shadow-xl transition-transform duration-300`}>
      <div className="p-5 border-b border-fuchsia-900 flex items-center justify-between">
        <div><h2 className="text-lg font-black text-white">Agent Portal</h2><p className="text-xs text-fuchsia-300 mt-0.5 uppercase tracking-wider">Global Medicine</p></div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-fuchsia-300 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-fuchsia-600 text-white shadow-md' : 'text-fuchsia-200 hover:text-white hover:bg-fuchsia-800'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            {item.label}
            {item.id === 'requests' && specialRequests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{specialRequests.filter(r => r.status === 'Pending').length}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-fuchsia-900">
        <button onClick={handleLogout} className="flex items-center gap-3 text-fuchsia-200 hover:text-white w-full px-4 py-3 rounded-xl font-medium hover:bg-fuchsia-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <span className="font-bold text-slate-800">Agent Portal</span>
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
              onClick={() => setActiveTab(activeTab === 'profile' ? 'requests' : 'profile')}
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
            <h1 className="text-3xl font-extrabold text-slate-900">
              {activeTab === 'requests' && 'Patient Special Requests'}
              {activeTab === 'inventory' && 'Specialized Inventory'}
              {activeTab === 'special_medicines' && 'Manage Special Medicines'}
            </h1>
            <p className="text-slate-500 mt-1">
              {activeTab === 'requests' && 'Review prescriptions and approve specialized medicine orders.'}
              {activeTab === 'inventory' && 'Monitor highly regulated and specialized medical supplies.'}
              {activeTab === 'special_medicines' && 'Add critical care directory listings for patients to find.'}
            </p>
          </header>

          {activeTab === 'requests' && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {specialRequests.length === 0 ? (
                <EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} title="No patient requests" description="Special medicine requests from patients will appear here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-4">Patient</th><th className="px-6 py-4">Medicine</th><th className="px-6 py-4">Prescription</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {specialRequests.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-900">{req.patientName}</td>
                          <td className="px-6 py-4 font-bold text-fuchsia-700">{req.medicine}</td>
                          <td className="px-6 py-4"><button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>{req.prescription}</button></td>
                          <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{req.status}</span></td>
                          <td className="px-6 py-4 text-right">
                            {currentUser?.admin_approved == 0 ? (
                              <span className="text-amber-600 font-semibold text-xs border border-amber-200 bg-amber-50 px-2 py-1 rounded-lg">Awaiting Admin Approval</span>
                            ) : (
                              req.status === 'Pending'
                                ? <button onClick={() => handleApprove(req.id, req.patientName)} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95">Approve</button>
                                : <span className="text-slate-400 font-semibold text-xs">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'inventory' && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4">Category</th><th className="px-6 py-4">Medicine</th><th className="px-6 py-4">Price</th><th className="px-6 py-4 text-right">Stock</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {specialInventory.map(med => (
                      <tr key={med.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4"><span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs uppercase tracking-wider">{med.category}</span></td>
                        <td className="px-6 py-4 font-bold text-slate-900">{med.name}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">Rs. {med.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right"><span className={`text-lg font-black ${med.stock < 10 ? 'text-red-500' : 'text-slate-800'}`}>{med.stock}</span><span className="text-slate-400 text-xs ml-1">units</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'special_medicines' && (
            <div className="space-y-8">
              {/* Add Form */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Add Critical Medicine</h3>
                <form onSubmit={handleAddSpecialMedicine} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Medicine Name</label>
                    <input type="text" required value={newMedName} onChange={(e) => setNewMedName(e.target.value)} placeholder="e.g., Paclitaxel 100mg" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Used For</label>
                    <input type="text" required value={newMedUsedFor} onChange={(e) => setNewMedUsedFor(e.target.value)} placeholder="e.g., Breast Cancer" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Number</label>
                    <div className="flex gap-2">
                      <input type="text" required value={newMedContact} onChange={(e) => setNewMedContact(e.target.value)} placeholder="071 234 5678" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                      <button type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all">Add</button>
                    </div>
                  </div>
                </form>
              </section>

              {/* Table */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-slate-800">Your Listed Medicines</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-4">Medicine Name</th><th className="px-6 py-4">Used For</th><th className="px-6 py-4 text-right">Contact Ref</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {specialMedicines.filter(m => m.agentName === currentUser.name).length > 0 ? (
                        specialMedicines.filter(m => m.agentName === currentUser.name).map(med => (
                          <tr key={med.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-bold text-slate-900">{med.name}</td>
                            <td className="px-6 py-4"><span className="bg-rose-50 text-rose-700 font-bold px-2.5 py-1 rounded-lg text-xs tracking-wider">{med.usedFor}</span></td>
                            <td className="px-6 py-4 text-right font-medium text-slate-600">{med.agentPhone}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">You haven't listed any special medicines yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;
