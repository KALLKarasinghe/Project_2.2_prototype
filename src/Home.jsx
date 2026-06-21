import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import CartSidebar from './CartSidebar';
import Navbar from './Navbar';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const { medicines, users, currentUser, addReview, addToCart, cart } = useSystemStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const basePath = import.meta.env.BASE_URL;

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewComment.trim() || !currentUser) return;
    const newReview = {
      reviewer: currentUser.name,
      rating: parseInt(rating),
      comment: reviewComment,
      date: new Date().toISOString().split('T')[0]
    };
    addReview(selectedMedicine.id, newReview);
    setSelectedMedicine({...selectedMedicine, reviews: [newReview, ...(selectedMedicine.reviews || [])]});
    setReviewComment('');
    setRating(5);
    setHover(0);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 0) {
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
      setSelectedBrands([]);
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSelectedBrands([]);
  };

  const baseSearchResults = useMemo(() => {
    if (!searchQuery) return [];
    return medicines.filter((med) =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, medicines]);

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(baseSearchResults.map((med) => med.brand)));
  }, [baseSearchResults]);

  useEffect(() => {
    setSelectedBrands((prev) => prev.filter((brand) => uniqueBrands.includes(brand)));
  }, [uniqueBrands]);

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const finalFilteredMedicines = useMemo(() => {
    if (selectedBrands.length === 0) return baseSearchResults;
    return baseSearchResults.filter((med) => selectedBrands.includes(med.brand));
  }, [baseSearchResults, selectedBrands]);

  const supplementsCount = medicines ? medicines.filter(m => /vitamin|supplement|calcium/i.test(m.name) || /vitamin|supplement|calcium/i.test(m.description)).length : 0;
  const otcCount = medicines ? medicines.filter(m => /paracetamol|cetirizine|panadol|ibuprofen/i.test(m.name) || /paracetamol|cetirizine|panadol|ibuprofen/i.test(m.description)).length : 0;
  const totalProducts = medicines ? medicines.length : 0;
  const prescriptionCount = Math.max(0, totalProducts - supplementsCount - otcCount);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      {/* Search Overlay Container */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex justify-center pt-24 px-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[80vh] h-fit">
            {/* Left Column: Brand Filters */}
            <div className="w-full md:w-1/3 bg-slate-50 p-6 border-r border-slate-100 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg">Filter by Brand</h3>
                <button onClick={closeSearch} className="md:hidden text-slate-500 hover:text-slate-800 bg-slate-200/50 p-2 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              {uniqueBrands.length > 0 ? (
                <div className="space-y-3">
                  {uniqueBrands.map((brand) => (
                    <label key={brand} className="flex items-center space-x-3 cursor-pointer group p-2 hover:bg-white rounded-xl transition-colors">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-5 h-5 border-2 border-blue-200 rounded-md checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                        />
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700 font-medium group-hover:text-blue-600 transition-colors">{brand}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                  <p className="text-sm italic">No brands found.</p>
                </div>
              )}
            </div>

            {/* Right Column: Search Results */}
            <div className="w-full md:w-2/3 p-6 bg-white overflow-y-auto max-h-[80vh] custom-scrollbar">
              <div className="flex justify-between items-center mb-6 hidden md:flex sticky top-0 bg-white/90 backdrop-blur-md pb-4 z-10">
                <h3 className="font-bold text-slate-800 text-lg">
                  Results for "<span className="text-blue-600">{searchQuery}</span>"
                </h3>
                <button onClick={closeSearch} className="text-slate-400 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-100 bg-slate-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {finalFilteredMedicines.length > 0 ? (
                  finalFilteredMedicines.map((med) => (
                    <div 
                      key={med.id} 
                      onClick={() => { setSelectedMedicine(med); closeSearch(); }}
                      className="bg-white border border-slate-100 p-4 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col"
                    >
                      <div className="bg-blue-50 text-blue-800 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md inline-block mb-3 self-start">
                        {med.brand}
                      </div>
                      <h4 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors leading-tight mb-3">{med.name}</h4>
                      <div className="flex justify-between items-end mt-auto pt-3 border-t border-slate-50">
                        <p className="text-xl font-black text-slate-900 tracking-tight">Rs. {med.price}</p>
                        <div className="flex flex-col items-end gap-1">
                          <p className={`text-xs font-bold px-2 py-1 rounded-md ${med.stock > 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            Stock: {med.stock}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 flex flex-col items-center text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <p className="font-medium text-slate-600">No medicines match your specific filter.</p>
                    <button onClick={() => setSelectedBrands([])} className="mt-4 text-blue-600 font-bold hover:underline text-sm">Clear filters</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-20 lg:pb-32 overflow-hidden bg-slate-900 flex-shrink-0 z-0">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[100%] rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 blur-3xl" />
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[80%] rounded-full bg-gradient-to-tr from-emerald-500/10 to-teal-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left: Text & Search */}
          <div className="w-full lg:w-3/5 text-center lg:text-left pt-10 lg:pt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6">
              <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
              The B2B Pharmaceutical Network
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
              Empowering Healthcare with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Reliable Supply</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 font-medium mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Connect directly with verified global manufacturers. Streamline your pharmacy's procurement process with enterprise-grade security and transparent pricing.
            </p>

            {/* Advanced Search Input directly in Hero */}
            <div className="relative max-w-2xl mx-auto lg:mx-0 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-2 focus-within:ring-4 focus-within:ring-blue-500/30 transition-all">
                <div className="pl-4 pr-2 text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                  type="text" 
                  placeholder={`Search over ${medicines ? medicines.length : 0}+ medicines, brands, or categories...`}
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-lg py-3 px-2 placeholder-slate-400 font-medium"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button className="hidden sm:flex bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-colors items-center gap-2">
                  Search
                </button>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-400 font-medium">
              <span>Popular:</span>
              <button className="hover:text-blue-400 transition-colors">Panadol</button>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <button className="hover:text-blue-400 transition-colors">Amoxicillin</button>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <button className="hover:text-blue-400 transition-colors">Vitamin C</button>
            </div>
          </div>

          {/* Right: Image / Illustration Area */}
          <div className="w-full lg:w-2/5 relative hidden md:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-800 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src={`${basePath}1.jpeg`} 
                alt="Medical Supplies" 
                className="w-full h-auto object-cover opacity-90 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-emerald-600/80 hidden items-center justify-center p-8 flex-col text-center">
                <svg className="w-16 h-16 text-white mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                <h3 className="text-3xl font-black text-white">Global Medicine Network</h3>
              </div>
            </div>
            
            {/* Floating Stat Card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification</p>
                <p className="text-slate-900 font-black text-lg">100% Authentic</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-slate-100 relative z-10 -mt-4 mx-4 sm:mx-8 lg:mx-auto max-w-7xl rounded-2xl shadow-sm sm:-mt-10 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
          {[
            { value: `${medicines ? medicines.length : 0}+`, label: 'Products Available' },
            { value: `${users ? users.filter(u => u.role?.toLowerCase() === 'supplier' || u.role?.toLowerCase() === 'company').length : 0}+`, label: 'Verified Suppliers' },
            { value: '99.9%', label: 'Order Fulfillment' },
            { value: '24/7', label: 'Customer Support' }
          ].map((stat, i) => (
            <div key={i} className="p-6 sm:p-8 text-center bg-white hover:bg-slate-50 transition-colors">
              <p className="text-3xl sm:text-4xl font-black text-blue-600 mb-1">{stat.value}</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges Details */}
      <section className="bg-slate-50 py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Enterprise Security', desc: 'Bank-grade encryption for all transactions', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'blue' },
              { title: 'Fast Nationwide Delivery', desc: 'Optimized logistics for quick fulfillment', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'emerald' },
              { title: 'Top Global Brands', desc: 'Direct partnerships with manufacturers', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'indigo' },
              { title: 'Dedicated Support', desc: 'Expert assistance whenever you need it', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', color: 'amber' }
            ].map((badge, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-start hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl bg-${badge.color}-50 flex items-center justify-center text-${badge.color}-600 mb-4`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={badge.icon}></path></svg>
                </div>
                <h4 className="font-bold text-slate-800 text-base mb-2">{badge.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Browse by Category</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Explore our comprehensive catalog structured to meet all your pharmaceutical requirements.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Prescription', count: `${prescriptionCount} items`, icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', bg: 'bg-blue-50', text: 'text-blue-600' },
              { name: 'Over-The-Counter', count: `${otcCount} items`, icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', bg: 'bg-emerald-50', text: 'text-emerald-600' },
              { name: 'Supplements', count: `${supplementsCount} items`, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', bg: 'bg-rose-50', text: 'text-rose-600' }

            ].map((cat, i) => (
              <div key={i} className="group cursor-pointer bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:border-blue-200 transition-all text-center">
                <div className={`w-16 h-16 mx-auto ${cat.bg} rounded-full flex items-center justify-center ${cat.text} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={cat.icon}></path></svg>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                <p className="text-xs font-semibold text-slate-400">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured / New Arrivals Mock Grid */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">Trending Products</h2>
              <p className="text-slate-500 text-lg">Highly requested medicines and recent additions.</p>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
              View Complete Inventory
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 1, name: 'Cetirizine 10mg', brand: 'Hemas', tag: 'Allergy', price: '15.00', bg: 'from-indigo-100 to-blue-50', icon: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5' },
              { id: 2, name: 'Ibuprofen 400mg', brand: 'SPC', tag: 'Pain Relief', price: '12.00', bg: 'from-rose-100 to-orange-50', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { id: 3, name: 'Omeprazole 20mg', brand: 'Astron', tag: 'Digestion', price: '18.00', bg: 'from-emerald-100 to-teal-50', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
              { id: 4, name: 'Vitamin C 500mg', brand: 'Link Natural', tag: 'Immunity', price: '25.00', bg: 'from-amber-100 to-yellow-50', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' }
            ].map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedMedicine({...item, stock: 50, description: 'Premium quality pharmaceutical product sourced from verified global manufacturers.'})}
                className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full"
              >
                <div className={`w-full h-48 bg-gradient-to-br ${item.bg} rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300`}>
                  <img src="/medicine_placeholder.png" alt={item.name} className="w-full h-full object-cover opacity-90 mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md text-[10px] font-black px-2 py-1 rounded text-slate-800 shadow-sm uppercase tracking-widest">TRENDING</div>
                </div>
                <div className="px-4 pb-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-blue-600 tracking-wider uppercase bg-blue-50 px-2 py-0.5 rounded">{item.brand}</span>
                    <span className="text-xs text-slate-400 font-bold">{item.tag}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-4 group-hover:text-blue-600 transition-colors leading-tight">{item.name}</h4>
                  <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-50">
                    <p className="font-black text-2xl text-slate-900 tracking-tight"><span className="text-sm text-slate-400 font-bold">Rs.</span> {item.price}</p>
                    {currentUser?.role?.toLowerCase() === 'pharmacy' ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart({id: `new-${item.id}`, name: item.name, brand: item.brand, price: parseFloat(item.price)}, 1); toast.success(`${item.name} added to cart`); }}
                        className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/login'); }}
                        className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-all shadow-sm"
                        title="Sign in as pharmacy to purchase"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            
            <div className="lg:w-1/2 p-10 sm:p-16 relative z-10 flex flex-col justify-center">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 leading-tight">Streamline Your Pharmacy's Procurement</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Join thousands of pharmacies that have revolutionized their supply chain. Access real-time inventory, negotiate directly with suppliers, and manage all your orders in one centralized platform.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  'Direct access to top manufacturers',
                  'Transparent pricing and bulk discounts',
                  'Automated inventory restock alerts',
                  'Comprehensive order tracking system'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center text-slate-300 font-medium">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex gap-4">
                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-colors text-center inline-block shadow-lg shadow-blue-600/30">Create Free Account</Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 bg-slate-800 relative hidden lg:block overflow-hidden">
              {/* Decorative elements representing a dashboard */}
              <div className="absolute top-10 right-10 bottom-10 left-10 bg-slate-900 rounded-2xl border border-slate-700 p-6 shadow-2xl transform translate-x-12 translate-y-12">
                <div className="flex gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                  <div className="h-32 bg-slate-800/50 rounded border border-slate-700/50"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-slate-800/50 rounded border border-slate-700/50"></div>
                    <div className="h-20 bg-blue-900/20 rounded border border-blue-500/20"></div>
                    <div className="h-20 bg-slate-800/50 rounded border border-slate-700/50"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="bg-slate-950 text-slate-400 py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Global Medicine</h2>
              </div>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-sm">
                Leading the healthcare supply chain revolution by connecting pharmacies and top tier suppliers worldwide through an intelligent B2B platform.
              </p>
              <div className="flex gap-3">
                {['twitter', 'facebook', 'linkedin', 'instagram'].map((social) => (
                  <div key={social} className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all cursor-pointer">
                    <span className="text-xs sr-only">{social}</span>
                    <div className="w-4 h-4 bg-current"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Platform</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Browse Products</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">For Pharmacies</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">For Suppliers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing Structure</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Company</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Press & Media</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Legal</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Compliance & Licenses</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-medium">&copy; {new Date().getFullYear()} Global Medicine Inc. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>

      {/* Product Details Modal (Reused) */}
      {selectedMedicine && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-0">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedMedicine(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 border-b border-blue-100 flex-shrink-0">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">{selectedMedicine.brand}</span>
                <button onClick={() => setSelectedMedicine(null)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-2">{selectedMedicine.name}</h2>
              <p className="text-blue-800 font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Verified Authentic
              </p>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-slate-700 leading-relaxed">{selectedMedicine.description || "Premium quality pharmaceutical product sourced from verified global manufacturers."}</p>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 mb-8">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Unit Price</h4>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">Rs. {selectedMedicine.price}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Availability</h4>
                  <p className={`font-bold ${selectedMedicine.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {selectedMedicine.stock > 0 ? `${selectedMedicine.stock} in stock` : 'Out of Stock'}
                  </p>
                </div>
              </div>
              
              {/* Reviews Section */}
              <div className="mb-8 border-t border-slate-100 pt-6">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  Customer Reviews
                </h4>
                
                <div className="space-y-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedMedicine.reviews && selectedMedicine.reviews.length > 0 ? (
                    selectedMedicine.reviews.map((review, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-800 text-sm">{review.reviewer}</span>
                          <span className="text-xs text-slate-400">{review.date}</span>
                        </div>
                        <div className="flex text-amber-400 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                          ))}
                        </div>
                        <p className="text-slate-600 text-sm">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic py-2 text-center bg-slate-50 rounded-lg">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </div>

              {/* Write Review Form */}
              <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Write a Review</h4>
                {currentUser ? (
                  <form onSubmit={handleReviewSubmit}>
                    <div className="flex flex-col gap-3 mb-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((index) => (
                          <svg
                            key={index}
                            onClick={() => setRating(index)}
                            onMouseEnter={() => setHover(index)}
                            onMouseLeave={() => setHover(0)}
                            className={`w-7 h-7 cursor-pointer transition-colors duration-200 ${index <= (hover || rating) ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Share your experience..." 
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                      />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors text-sm">
                      Submit Review
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-600 mb-2">You must be logged in to leave a review.</p>
                    <Link to="/login" className="text-blue-600 font-bold text-sm hover:underline">Log in here</Link>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 sm:p-8 pt-4 border-t border-slate-100 bg-white flex-shrink-0">
              {currentUser?.role?.toLowerCase() === 'pharmacy' ? (
                <button 
                  onClick={() => { addToCart(selectedMedicine, 1); toast.success(`${selectedMedicine.name} added to cart`); setSelectedMedicine(null); }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:shadow-slate-800/30 active:scale-95 flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  Add to Cart
                </button>
              ) : (
                <div className="w-full bg-slate-100 text-slate-500 font-bold py-4 rounded-xl text-sm text-center border border-slate-200">
                  Available exclusively at registered pharmacies
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
};

export default Home;
