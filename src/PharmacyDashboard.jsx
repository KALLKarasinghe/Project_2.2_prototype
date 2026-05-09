import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import toast from 'react-hot-toast';

const EmptyState = ({ icon, title, description }) => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">{icon}</div>
    <p className="text-lg font-semibold text-slate-600">{title}</p>
    <p className="text-slate-400 mt-1 text-sm">{description}</p>
  </div>
);

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const { medicines, orders, placeOrder, logoutUser } = useSystemStore();
  const [activeTab, setActiveTab] = useState('place_orders');
  const [orderQuantities, setOrderQuantities] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handlePlaceOrder = (medicine) => {
    const qty = parseInt(orderQuantities[medicine.id]);
    if (!qty || qty <= 0) {
      toast.error('Please enter a valid quantity greater than 0.');
      return;
    }
    if (qty > medicine.stock) {
      toast.error(`Only ${medicine.stock} units of ${medicine.name} available in stock.`);
      return;
    }
    placeOrder(medicine, qty);
    setOrderQuantities(prev => ({ ...prev, [medicine.id]: '' }));
    toast.success(`Successfully ordered ${qty}× ${medicine.name}!`);
  };

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  const navItems = [
    { id: 'place_orders', label: 'Place Orders', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'track_orders', label: 'Track Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  ];

  const Sidebar = () => (
    <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-teal-900 text-white flex flex-col shadow-xl transition-transform duration-300`}>
      <div className="p-5 border-b border-teal-800 bg-teal-950 flex items-center justify-between">
        <div><h2 className="text-lg font-black text-white">Pharmacy Portal</h2><p className="text-xs text-teal-300 mt-0.5 uppercase tracking-wider">Global Medicine</p></div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-teal-300 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-teal-600 text-white shadow-md' : 'text-teal-200 hover:text-white hover:bg-teal-800'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-teal-800 bg-teal-950">
        <button onClick={handleLogout} className="flex items-center gap-3 text-teal-200 hover:text-white w-full px-4 py-3 rounded-xl font-medium hover:bg-teal-800 transition-colors">
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
          <span className="font-bold text-slate-800">Pharmacy Portal</span>
        </div>
        <div className="p-6 lg:p-10">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">{activeTab === 'place_orders' ? 'Medicine Inventory & Ordering' : 'Order Tracking'}</h1>
            <p className="text-slate-500 mt-1">{activeTab === 'place_orders' ? 'Browse available medicines and place stock requests.' : 'Monitor the status of your recent inventory requests.'}</p>
          </header>

          {activeTab === 'place_orders' && (
            medicines.length === 0 ? (
              <EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} title="No medicines available" description="The inventory is currently empty." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {medicines.map(med => (
                  <div key={med.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-teal-50 text-teal-700 font-bold px-2.5 py-1 rounded-lg text-xs uppercase tracking-wider">{med.brand}</span>
                      <span className={`text-xs font-semibold ${med.stock < 50 ? 'text-red-500' : 'text-slate-400'}`}>Stock: {med.stock}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{med.name}</h3>
                    <p className="text-2xl font-black text-slate-900 mb-4">Rs. {med.price}</p>
                    <div className="mt-auto flex gap-2">
                      <input type="number" min="1" max={med.stock} placeholder="Qty"
                        className="w-20 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-center font-bold"
                        value={orderQuantities[med.id] || ''}
                        onChange={e => setOrderQuantities(prev => ({ ...prev, [med.id]: e.target.value }))}
                      />
                      <button onClick={() => handlePlaceOrder(med)}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-all active:scale-95 text-sm">
                        Place Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'track_orders' && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {orders.length === 0 ? (
                <EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} title="No orders placed yet" description="Your order history will appear here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-4">Order ID</th><th className="px-6 py-4">Medicine</th><th className="px-6 py-4">Qty</th><th className="px-6 py-4">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...orders].reverse().map(order => (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-500 text-xs">#{order.id.slice(-8)}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{order.medicineName}</td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{order.quantity} units</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${order.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default PharmacyDashboard;
