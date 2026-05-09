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

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { medicines, orders, approveOrder, addMedicine, logoutUser } = useSystemStore();
  const [activeTab, setActiveTab] = useState('incoming_orders');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newMed, setNewMed] = useState({ name: '', brand: '', stock: '', price: '', expireDate: '' });

  const handleApprove = (orderId) => {
    approveOrder(orderId);
    toast.success(`Order #${orderId.slice(-6)} has been approved and inventory updated!`);
  };

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  const validateMedForm = () => {
    const e = {};
    if (!newMed.name.trim()) e.name = 'Medicine name is required.';
    if (!newMed.brand.trim()) e.brand = 'Brand is required.';
    if (!newMed.stock || isNaN(newMed.stock) || parseInt(newMed.stock) <= 0) e.stock = 'Valid stock quantity required.';
    if (!newMed.price || isNaN(newMed.price) || parseFloat(newMed.price) <= 0) e.price = 'Valid price required.';
    if (!newMed.expireDate) e.expireDate = 'Expiry date is required.';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!validateMedForm()) return;
    addMedicine({ ...newMed, stock: parseInt(newMed.stock), price: parseFloat(newMed.price) });
    toast.success(`${newMed.name} has been added to the inventory!`);
    setNewMed({ name: '', brand: '', stock: '', price: '', expireDate: '' });
    setFormErrors({});
    setShowAddForm(false);
  };

  const navItems = [
    { id: 'incoming_orders', label: 'Incoming Orders', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'inventory', label: 'Global Inventory', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  ];

  const Sidebar = () => (
    <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-indigo-950 text-white flex flex-col shadow-xl transition-transform duration-300`}>
      <div className="p-5 border-b border-indigo-900 flex items-center justify-between">
        <div><h2 className="text-lg font-black text-white">Supplier Portal</h2><p className="text-xs text-indigo-300 mt-0.5 uppercase tracking-wider">Global Medicine</p></div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-indigo-300 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-200 hover:text-white hover:bg-indigo-800'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            {item.label}
            {item.id === 'incoming_orders' && orders.filter(o => o.status === 'Pending').length > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'Pending').length}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-indigo-900">
        <button onClick={handleLogout} className="flex items-center gap-3 text-indigo-200 hover:text-white w-full px-4 py-3 rounded-xl font-medium hover:bg-indigo-800 transition-colors">
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
          <span className="font-bold text-slate-800">Supplier Portal</span>
        </div>
        <div className="p-6 lg:p-10">
          <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">{activeTab === 'incoming_orders' ? 'Incoming Orders' : 'Global Inventory'}</h1>
              <p className="text-slate-500 mt-1">{activeTab === 'incoming_orders' ? 'Review and approve supply requests from pharmacies.' : 'Monitor stock. Approving an order deducts from inventory.'}</p>
            </div>
            {activeTab === 'inventory' && (
              <button onClick={() => setShowAddForm(v => !v)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 text-sm shrink-0">
                {showAddForm ? 'Cancel' : '+ Add Medicine'}
              </button>
            )}
          </header>

          {activeTab === 'inventory' && showAddForm && (
            <form onSubmit={handleAddMedicine} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
              <h3 className="sm:col-span-2 font-bold text-slate-800 text-lg">Add New Medicine</h3>
              {[
                { key: 'name', label: 'Medicine Name', placeholder: 'e.g. Panadol', type: 'text' },
                { key: 'brand', label: 'Brand', placeholder: 'e.g. GSK', type: 'text' },
                { key: 'stock', label: 'Initial Stock', placeholder: 'e.g. 500', type: 'number' },
                { key: 'price', label: 'Unit Price (Rs.)', placeholder: 'e.g. 10.00', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder} value={newMed[field.key]}
                    onChange={e => { setNewMed(p => ({ ...p, [field.key]: e.target.value })); setFormErrors(p => ({ ...p, [field.key]: '' })); }}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 ${formErrors[field.key] ? 'border-red-400' : 'border-slate-200'}`} />
                  {formErrors[field.key] && <p className="text-red-500 text-xs mt-1">{formErrors[field.key]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={newMed.expireDate}
                  onChange={e => { setNewMed(p => ({ ...p, expireDate: e.target.value })); setFormErrors(p => ({ ...p, expireDate: '' })); }}
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 ${formErrors.expireDate ? 'border-red-400' : 'border-slate-200'}`}
                />
                {formErrors.expireDate && <p className="text-red-500 text-xs mt-1">{formErrors.expireDate}</p>}
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all active:scale-95">Add to Inventory</button>
              </div>
            </form>
          )}

          {activeTab === 'incoming_orders' && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {orders.length === 0 ? (
                <EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} title="No incoming orders" description="Pharmacy order requests will appear here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-4">Order ID</th><th className="px-6 py-4">Item</th><th className="px-6 py-4">Qty</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...orders].reverse().map(order => (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-500 text-xs">#{order.id.slice(-8)}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{order.medicineName}</td>
                          <td className="px-6 py-4"><span className="text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 text-xs">{order.quantity} units</span></td>
                          <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${order.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{order.status}</span></td>
                          <td className="px-6 py-4 text-right">
                            {order.status === 'Pending'
                              ? <button onClick={() => handleApprove(order.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95">Approve</button>
                              : <span className="text-slate-400 font-semibold text-xs">Processed</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'inventory' && !showAddForm && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {medicines.length === 0 ? (
                <EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} title="Inventory is empty" description='Click "Add Medicine" to add your first product.' />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-4">Brand</th><th className="px-6 py-4">Medicine</th><th className="px-6 py-4">Price</th><th className="px-6 py-4 text-right">Stock</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {medicines.map(med => (
                        <tr key={med.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4"><span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs uppercase tracking-wider">{med.brand}</span></td>
                          <td className="px-6 py-4 font-bold text-slate-900">{med.name}</td>
                          <td className="px-6 py-4 font-bold text-slate-700">Rs. {med.price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-lg font-black ${med.stock < 50 ? 'text-red-500' : 'text-slate-800'}`}>{med.stock}</span>
                            <span className="text-slate-400 text-xs ml-1">units</span>
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

export default SupplierDashboard;
