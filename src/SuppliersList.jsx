import React from 'react';
import { useSystemStore } from './SystemContext';
import { Link } from 'react-router-dom';

const SuppliersList = () => {
  const { users } = useSystemStore();
  
  // Filter only active suppliers
  const suppliers = users.filter(user => user.role === 'Supplier' && user.status === 'Active');

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
            <Link to="/suppliers" className="text-blue-600 font-bold transition-colors">Suppliers</Link>
            <Link to="/about" className="hover:text-blue-600 transition-colors">About Us</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Our Trusted Suppliers</h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            We partner with the leading pharmaceutical manufacturers and distributors across Sri Lanka to ensure authentic and reliable healthcare supplies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 leading-tight">{supplier.name}</h3>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider mt-1 inline-block">Verified Supplier</span>
                  </div>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    {supplier.email}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {supplier.location || 'Sri Lanka'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-100 border-dashed">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              <h3 className="text-xl font-bold text-slate-800 mb-1">No Suppliers Found</h3>
              <p>We are currently updating our supplier network.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuppliersList;
