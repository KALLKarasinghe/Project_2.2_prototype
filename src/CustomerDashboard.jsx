import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { medicines, logoutUser } = useSystemStore();
  const [activeTab, setActiveTab] = useState('browse');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reqMedicine, setReqMedicine] = useState('');
  const [reqAgent, setReqAgent] = useState('');
  const [reqFile, setReqFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const agents = ['Global Health Oncology Agents', 'RareMeds Dispatch', 'Specialty Pharma Connect'];

  const validateForm = () => {
    const e = {};
    if (!reqMedicine.trim()) e.reqMedicine = 'Please specify the medicine name.';
    if (!reqAgent) e.reqAgent = 'Please select a verified Medical Agent.';
    if (!reqFile) e.reqFile = 'A valid prescription upload is required.';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    toast.success(`Special request for ${reqMedicine} sent to ${reqAgent}!`);
    setReqMedicine(''); setReqAgent(''); setReqFile(null); setFormErrors({});
  };

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  const navItems = [
    { id: 'browse', label: 'Standard Medicines', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'special_request', label: 'Special Requests', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  const Sidebar = () => (
    <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-sky-950 text-white flex flex-col shadow-xl transition-transform duration-300`}>
      <div className="p-5 border-b border-sky-900 flex items-center justify-between">
        <div><h2 className="text-lg font-black text-white">Patient Portal</h2><p className="text-xs text-sky-300 mt-0.5 uppercase tracking-wider">Global Medicine</p></div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-sky-300 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-sky-600 text-white shadow-md' : 'text-sky-200 hover:text-white hover:bg-sky-800'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-sky-900">
        <button onClick={handleLogout} className="flex items-center gap-3 text-sky-200 hover:text-white w-full px-4 py-3 rounded-xl font-medium hover:bg-sky-800 transition-colors">
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
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
          <span className="font-bold text-slate-800">Patient Portal</span>
        </div>
        <div className="p-6 lg:p-10">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">{activeTab === 'browse' ? 'Available Medicines' : 'Request Specialized Treatment'}</h1>
            <p className="text-slate-500 mt-1">{activeTab === 'browse' ? 'Browse our catalog of verified standard medicines.' : 'Submit your prescription securely to our verified Medical Agents.'}</p>
          </header>

          {activeTab === 'browse' && (
            medicines.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <p className="text-lg font-semibold text-slate-600">No medicines available</p>
                <p className="text-slate-400 mt-1 text-sm">The catalog is currently empty. Please check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {medicines.map(med => (
                  <div key={med.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-sky-50 text-sky-700 font-bold px-2.5 py-1 rounded-lg text-xs uppercase tracking-wider">{med.brand}</span>
                      <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        In Stock ({med.stock})
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{med.name}</h3>
                    <p className="text-2xl font-black text-slate-900 mb-4">Rs. {med.price}</p>
                    <button onClick={() => toast.success(`${med.name} details viewed!`)} className="mt-auto w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl transition-all active:scale-95 text-sm">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'special_request' && (
            <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 bg-sky-50/30">
                <h2 className="text-xl font-bold text-slate-800">New Special Request</h2>
                <p className="text-slate-500 mt-1 text-sm">Submit your prescription for high-tier or restricted medications.</p>
              </div>
              <form onSubmit={handleSubmitRequest} className="p-8 space-y-5" noValidate>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Requested Medicine Name</label>
                  <input type="text" value={reqMedicine} onChange={e => { setReqMedicine(e.target.value); setFormErrors(p => ({ ...p, reqMedicine: '' })); }}
                    placeholder="e.g. Pembrolizumab (Keytruda)"
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 ${formErrors.reqMedicine ? 'border-red-400' : 'border-slate-200'}`} />
                  {formErrors.reqMedicine && <p className="text-red-500 text-xs mt-1">{formErrors.reqMedicine}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Verified Medical Agent</label>
                  <select value={reqAgent} onChange={e => { setReqAgent(e.target.value); setFormErrors(p => ({ ...p, reqAgent: '' })); }}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 cursor-pointer ${formErrors.reqAgent ? 'border-red-400' : 'border-slate-200'}`}>
                    <option value="">Choose an agent routing path...</option>
                    {agents.map(agent => <option key={agent} value={agent}>{agent}</option>)}
                  </select>
                  {formErrors.reqAgent && <p className="text-red-500 text-xs mt-1">{formErrors.reqAgent}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Upload Valid Prescription <span className="text-red-500">*</span></label>
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center hover:border-sky-400 hover:bg-sky-50/30 transition-colors cursor-pointer ${formErrors.reqFile ? 'border-red-400 bg-red-50/20' : 'border-slate-300 bg-slate-50'}`}>
                    <svg className="mx-auto h-10 w-10 text-slate-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <label htmlFor="rx-upload" className="cursor-pointer text-sky-600 font-semibold hover:text-sky-700 text-sm">
                      {reqFile ? reqFile.name : <span>Click to upload <span className="text-slate-400 font-normal">or drag and drop</span></span>}
                    </label>
                    <input id="rx-upload" type="file" className="sr-only" onChange={e => { setReqFile(e.target.files[0]); setFormErrors(p => ({ ...p, reqFile: '' })); }} />
                    {!reqFile && <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG up to 10MB</p>}
                  </div>
                  {formErrors.reqFile && <p className="text-red-500 text-xs mt-1">{formErrors.reqFile}</p>}
                </div>

                <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl px-4 py-3.5 shadow-md transition-all active:scale-95">
                  Submit Secure Request
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
