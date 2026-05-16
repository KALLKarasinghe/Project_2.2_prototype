import React, { useState } from 'react';
import { useSystemStore } from './SystemContext';
import { Link } from 'react-router-dom';
import CartSidebar from './CartSidebar';
import Navbar from './Navbar';
import toast from 'react-hot-toast';

const Products = () => {
  const { medicines, currentUser, addReview, addToCart } = useSystemStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const uniqueBrands = [...new Set(medicines.map(item => item.brand).filter(Boolean))].sort();

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Review Form State
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

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

  // Step 1: Filter by search text only
  const searchedMedicines = medicines.filter(med =>
    (med.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (med.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (med.description && med.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Step 2: Derive available brands dynamically from search results
  const availableBrands = [...new Set(searchedMedicines.map(item => item.brand).filter(Boolean))].sort();

  // Step 3: Final filter - apply brand checkboxes on top of search results
  const finalDisplayedMedicines = selectedBrands.length === 0
    ? searchedMedicines
    : searchedMedicines.filter(med => selectedBrands.includes(med.brand));

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Shared Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page Heading */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">Full Inventory</h1>
            <p className="text-slate-500 font-medium">Browse our complete pharmaceutical catalog.</p>
          </div>
          <div className="text-sm font-bold text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
            {finalDisplayedMedicines.length} Products
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mb-6 sm:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all pl-12 shadow-sm"
            />
            <svg className="w-5 h-5 absolute left-4 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        {/* Sidebar + Product Grid layout */}
        <div className="flex flex-col md:flex-row gap-8">

          {/* --- Left Filter Sidebar --- */}
          <aside className="w-full md:w-1/4 h-fit bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-800 text-base">Filter by Brand</h3>
              {selectedBrands.length > 0 && (
                <button
                  onClick={() => setSelectedBrands([])}
                  className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {availableBrands.map((brand) => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group py-1">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                    />
                    <svg className="absolute inset-0 m-auto w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm text-slate-600 font-medium group-hover:text-blue-700 transition-colors leading-tight">{brand}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* --- Right Products Grid --- */}
          <div className="w-full md:w-3/4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {finalDisplayedMedicines.length > 0 ? (
                finalDisplayedMedicines.map((med) => (
                  <div
                    key={med.id}
                    onClick={() => setSelectedMedicine(med)}
                    className="bg-white border border-slate-100 p-5 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full"
                  >
                    <div className="bg-blue-50 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md inline-block mb-3 self-start">
                      {med.brand}
                    </div>
                    <h4 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors leading-tight mb-2">{med.name}</h4>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-grow">{med.description || 'High-quality pharmaceutical product.'}</p>
                    <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-50">
                      <p className="text-xl font-black text-slate-900 tracking-tight">Rs. {med.price}</p>
                      <div className="flex flex-col items-end gap-1">
                        <p className={`text-xs font-bold px-2 py-1 rounded-md ${med.stock > 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          Stock: {med.stock}
                        </p>
                        {med.expireDate && (
                          <p className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                            Exp: {med.expireDate}
                          </p>
                        )}
                      </div>
                    </div>
                    {currentUser?.role?.toLowerCase() === 'pharmacy' ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(med, 1); toast.success(`${med.name} added to cart`); }}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Add to Cart
                      </button>
                    ) : (
                      <div className="w-full mt-3 bg-slate-100 text-slate-500 font-semibold py-2.5 rounded-xl text-xs text-center border border-slate-200">
                        Available at registered pharmacies
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-100 border-dashed">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">No products found</h3>
                  <p>Try adjusting your search or clearing filters.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

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
                  {selectedMedicine.expireDate && (
                    <p className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md mt-1 inline-block">
                      Exp: {selectedMedicine.expireDate}
                    </p>
                  )}
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

export default Products;
