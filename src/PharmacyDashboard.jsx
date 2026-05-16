import React, { useState, useEffect } from 'react';
import { useSystemStore } from './SystemContext';
import { useNavigate } from 'react-router-dom';

const PharmacyDashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, logoutUser, addToCart } = useSystemStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await fetch('http://localhost/pharma_backend/api/medicines.php?role=pharmacy');
        const data = await res.json();
        if (data.success) {
          setMedicines(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch medicines:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Pharmacy Portal</h1>
            <p className="text-slate-500 mt-1">Browse and purchase medicines from verified distributors.</p>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-slate-900 font-semibold transition-colors">
            Sign Out
          </button>
        </header>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Browse Medicines</h2>
          
          {loading ? (
            <p className="text-slate-500">Loading medicines...</p>
          ) : medicines.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 font-medium">No medicines available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {medicines.map(med => (
                <div key={med.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="flex-1">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg mb-3 uppercase tracking-wider">
                      {med.brand_name}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{med.generic_name}</h3>
                    <p className="text-slate-500 text-sm mb-4">Dosage: <span className="font-semibold text-slate-700">{med.dosage}</span></p>
                    
                    <div className="bg-slate-50 rounded-xl p-3 mb-4 text-sm">
                      <p className="text-slate-600 flex justify-between mb-1">
                        <span>Supplier:</span>
                        <span className="font-semibold text-slate-900 text-right">{med.company_name || 'Unknown'}</span>
                      </p>
                      <p className="text-slate-600 flex justify-between">
                        <span>Stock:</span>
                        <span className={`font-bold ${med.stock_quantity < 20 ? 'text-amber-600' : 'text-emerald-600'}`}>{med.stock_quantity} units</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Price</p>
                      <p className="text-lg font-black text-slate-900">Rs. {med.price.toFixed(2)}</p>
                    </div>
                    <button onClick={() => addToCart(med)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all active:scale-95">
                      Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
