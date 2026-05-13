import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import CartSidebar from './CartSidebar';
import Navbar from './Navbar';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const { medicines, currentUser, addReview, addToCart, cart } = useSystemStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  
  // Review Form State
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  // Slider State
  const basePath = import.meta.env.BASE_URL;
  const sliderImages = [`${basePath}1.jpeg`, `${basePath}2.jpeg`, `${basePath}3.jpeg`, `${basePath}4.jpeg`];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 0) {
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
      setSelectedBrands([]);
    }
  };

  // Close search overlay if clicked outside (simplified for now, using a close button instead)
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSelectedBrands([]);
  };

  // 1. Filter by Search Query to get base results
  const baseSearchResults = useMemo(() => {
    if (!searchQuery) return [];
    return medicines.filter((med) =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, medicines]);

  // 2. Extract unique brands from base results
  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(baseSearchResults.map((med) => med.brand)));
  }, [baseSearchResults]);

  // Reset selected brands if search query changes and selected brands are no longer in results
  useEffect(() => {
    setSelectedBrands((prev) => prev.filter((brand) => uniqueBrands.includes(brand)));
  }, [uniqueBrands]);

  // Handle Brand Checkbox toggle
  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // 3. Final Filter for Right Column (Search Query + Selected Brands)
  const finalFilteredMedicines = useMemo(() => {
    if (selectedBrands.length === 0) return baseSearchResults;
    return baseSearchResults.filter((med) => selectedBrands.includes(med.brand));
  }, [baseSearchResults, selectedBrands]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      {/* Search Overlay Container */}
      {isSearchOpen && (
        <div className="absolute top-[180px] left-0 w-full z-50 flex justify-center px-4">
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-5xl rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-blue-100 overflow-hidden flex flex-col md:flex-row min-h-[400px]">
            {/* Left Column: Brand Filters */}
            <div className="w-full md:w-1/3 bg-slate-50/50 p-6 border-r border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg">Filter by Brand</h3>
                <button onClick={closeSearch} className="md:hidden text-slate-500 hover:text-slate-800">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              {uniqueBrands.length > 0 ? (
                <div className="space-y-3">
                  {uniqueBrands.map((brand) => (
                    <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
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
                      <span className="text-slate-600 font-medium group-hover:text-blue-600 transition-colors">{brand}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">No brands found.</p>
              )}
            </div>

            {/* Right Column: Search Results */}
            <div className="w-full md:w-2/3 p-6 bg-white overflow-y-auto max-h-[600px]">
              <div className="flex justify-between items-center mb-6 hidden md:flex">
                <h3 className="font-bold text-slate-800 text-lg">
                  Results for "<span className="text-blue-600">{searchQuery}</span>"
                </h3>
                <button onClick={closeSearch} className="text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-full hover:bg-slate-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {finalFilteredMedicines.length > 0 ? (
                  finalFilteredMedicines.map((med) => (
                    <div 
                      key={med.id} 
                      onClick={() => setSelectedMedicine(med)}
                      className="bg-white border border-slate-100 p-4 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    >
                      <div className="bg-blue-50 text-blue-800 text-xs font-bold px-2 py-1 rounded-md inline-block mb-2">
                        {med.brand}
                      </div>
                      <h4 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{med.name}</h4>
                      <div className="flex justify-between items-end mt-4">
                        <p className="text-xl font-extrabold text-slate-900">Rs. {med.price}</p>
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-sm text-emerald-600 font-medium">In Stock: {med.stock}</p>
                          {med.expireDate && (
                            <p className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                              Exp: {med.expireDate}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <p>No medicines match your specific filter.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Navbar */}
      <Navbar />

      {/* Hero Section & Search */}
      <section className="relative pt-24 pb-12 overflow-hidden flex-grow flex flex-col justify-end min-h-[500px] sm:min-h-[600px] w-full border-b border-slate-200">
        {/* Image Slider Background */}
        {sliderImages.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt={`Slide ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out z-0 ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="max-w-4xl mx-auto w-full px-6 lg:px-8 relative z-10 flex flex-col justify-end h-full mt-auto">

          {/* Advanced Search Bar */}
          <div className="relative max-w-2xl mx-auto group">
            <div className={`absolute inset-0 bg-blue-500 rounded-full blur-lg transition-opacity duration-500 ${isSearchOpen ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'}`}></div>
            <div className="relative flex items-center bg-white p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-300">
              <div className="pl-4 pr-2 text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search for medicines by name..." 
                className="w-full bg-transparent border-none outline-none text-slate-800 text-lg py-3 placeholder-slate-400 font-medium"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition-transform transform active:scale-95 ml-2">
                Search
              </button>
            </div>
          </div>
        </div>


      </section>

      {/* Trust Badges */}
      <section className="bg-white py-12 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-70">
          {[
            { title: '100% Secured', desc: 'Enterprise Grade', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { title: 'Fast Delivery', desc: 'Nationwide Network', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { title: 'Verified Suppliers', desc: 'Top Industry Brands', icon: 'M9 12l2 2 4-4V3H5v14a4 4 0 004 4h10' },
            { title: '24/7 Support', desc: 'Always Here For You', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' }
          ].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="text-blue-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={badge.icon}></path></svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{badge.title}</h4>
                <p className="text-xs text-slate-500 font-medium">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals Mock Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">New Arrivals</h2>
              <p className="text-slate-500">Latest additions to our pharmaceutical network.</p>
            </div>
            <Link to="/products" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors hidden sm:block">View All Inventory &rarr;</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 1, name: 'Cetirizine 10mg', brand: 'Hemas', tag: 'Allergy', price: '15.00', bg: 'bg-indigo-50' },
              { id: 2, name: 'Ibuprofen 400mg', brand: 'SPC', tag: 'Pain Relief', price: '12.00', bg: 'bg-rose-50' },
              { id: 3, name: 'Omeprazole 20mg', brand: 'Astron', tag: 'Digestion', price: '18.00', bg: 'bg-emerald-50' },
              { id: 4, name: 'Samahan', brand: 'Link Natural', tag: 'Immunity', price: '25.00', bg: 'bg-amber-50' }
            ].map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedMedicine({...item, stock: 50, description: 'Newly arrived product, verified by global standards.'})}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
              >
                <div className={`w-full h-40 ${item.bg} rounded-xl mb-4 flex items-center justify-center relative overflow-hidden`}>
                  {/* Decorative pill shape */}
                  <div className="w-16 h-8 bg-white/60 rounded-full border border-white backdrop-blur-sm shadow-sm rotate-45 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="absolute top-2 right-2 bg-white text-xs font-bold px-2 py-1 rounded text-slate-700 shadow-sm">NEW</div>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">{item.brand}</span>
                  <span className="text-xs text-slate-400 font-medium">{item.tag}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-4 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                <div className="flex justify-between items-center mt-auto">
                  <p className="font-extrabold text-xl text-slate-900">Rs. {item.price}</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart({id: `new-${item.id}`, name: item.name, brand: item.brand, price: parseFloat(item.price)}, 1); toast.success(`${item.name} added to cart`); }}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Link to="/products" className="w-full mt-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl sm:hidden hover:bg-slate-50 flex items-center justify-center">View All Inventory</Link>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Global Medicine</h2>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Leading the healthcare supply chain revolution by connecting pharmacies and top tier suppliers worldwide.
            </p>
            <div className="flex gap-4">
              {['twitter', 'facebook', 'linkedin', 'instagram'].map((social) => (
                <div key={social} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer text-white">
                  <span className="text-xs sr-only">{social}</span>
                  <div className="w-4 h-4 bg-current"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Pharmacy Network</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Supplier Directory</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Compliance</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Licenses</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Subscribe</h4>
            <p className="text-sm text-slate-400 mb-4">Get the latest industry updates and platform news directly to your inbox.</p>
            <div className="flex">
              <input type="email" placeholder="Email address" className="bg-slate-800 text-white px-4 py-2 rounded-l-lg outline-none w-full border border-slate-700 focus:border-blue-500" />
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg font-bold text-white transition-colors">&rarr;</button>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Global Medicine Inc. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex gap-4">
            <span>Powered by Vite & React</span>
          </div>
        </div>
      </footer>

      {/* Product Details Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
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
                <p className="text-slate-700 leading-relaxed">{selectedMedicine.description || "High-quality pharmaceutical product sourced directly from verified manufacturers."}</p>
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
              <button 
                onClick={() => { addToCart(selectedMedicine, 1); toast.success(`${selectedMedicine.name} added to cart`); setSelectedMedicine(null); }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:shadow-slate-800/30 active:scale-95 flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Add to Cart
              </button>
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
