import React, { useState, useEffect } from 'react';

const SupplierReviews = ({ currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost/pharma_backend/api/reviews.php?target_id=${currentUser.id}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [currentUser.id]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) return <div className="p-8 text-center text-slate-500">Loading reviews...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
      <div className="px-6 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Pharmacy Reviews & Ratings</h2>
          <p className="text-sm text-slate-500 mt-1">Feedback provided by pharmacies after completed orders.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="flex text-amber-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">{averageRating}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reviews.length} Ratings</p>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          </div>
          <p className="text-lg font-semibold text-slate-600">No reviews yet</p>
          <p className="text-slate-400 mt-1 text-sm">Pharmacies haven't rated your service yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {reviews.map(review => (
            <div key={review.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900">{review.reviewer_name}</h4>
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} className={`w-4 h-4 ${review.rating >= star ? 'fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-slate-600 text-sm mt-2">{review.comment || <span className="italic text-slate-400">No comment provided.</span>}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierReviews;
