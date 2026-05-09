import React, { useState } from 'react';
import { useSystemStore } from './SystemContext';
import { Link } from 'react-router-dom';

const SpecialMedicine = () => {
  const { specialMedicines } = useSystemStore();
  const [selectedAgent, setSelectedAgent] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Global Medicine Logo"
              className="h-14 md:h-16 w-auto object-contain"
            />
            <div className="flex flex-col ml-3 leading-tight">
              <span className="font-extrabold text-2xl md:text-3xl text-blue-900 tracking-tight">Global Medicine</span>
              <span className="font-semibold text-[10px] md:text-xs text-gray-500 tracking-widest uppercase mt-0.5">Healthcare Supply Chain</span>
            </div>
          </Link>
          <nav className="hidden md:flex gap-6 items-center font-medium text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-blue-600 transition-colors">Products</Link>
            <Link to="/suppliers" className="hover:text-blue-600 transition-colors">Suppliers</Link>
            <Link to="/about" className="hover:text-blue-600 transition-colors">About Us</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-rose-50 border-b border-rose-100 text-slate-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-500 mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">Critical Care Directory</h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            This is a free community service to help patients locate critical, hard-to-find medicines. Online ordering is disabled for these items. Please contact the verified medical agents directly to discuss availability and procurement.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialMedicines && specialMedicines.length > 0 ? (
            specialMedicines.map((medicine) => (
              <div key={medicine.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-rose-50 text-rose-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Critical Care</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{medicine.name}</h3>
                  <p className="text-slate-600 text-sm font-medium mb-6 flex items-start gap-2">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    <span>{medicine.usedFor}</span>
                  </p>
                </div>
                
                <button 
                  onClick={() => setSelectedAgent(medicine)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors mt-auto"
                >
                  View Agent Contact
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-500">
              No critical care medicines listed at this moment.
            </div>
          )}
        </div>
      </main>

      {/* Agent Contact Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedAgent(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-rose-50 p-6 border-b border-rose-100 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Agent Contact Info</h3>
                <p className="text-sm text-slate-600 mt-1">For {selectedAgent.name}</p>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Medical Agent</p>
                <p className="text-lg font-black text-slate-900 mb-4">{selectedAgent.agentName}</p>
                
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Direct Phone</p>
                <a href={`tel:${selectedAgent.agentPhone.replace(/\s+/g, '')}`} className="text-2xl font-black text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  {selectedAgent.agentPhone}
                </a>
              </div>
              
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <p className="text-sm text-amber-900 font-medium leading-relaxed">
                    Please contact the agent directly to verify current availability. Direct online ordering is disabled for critical care medicines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialMedicine;
