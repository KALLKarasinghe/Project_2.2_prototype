import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import toast from 'react-hot-toast';
import SupplierAnalytics from './SupplierAnalytics';
import InvoiceModal from './InvoiceModal';

const EmptyState = ({ icon, title, description }) => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">{icon}</div>
    <p className="text-lg font-semibold text-slate-600">{title}</p>
    <p className="text-slate-400 mt-1 text-sm">{description}</p>
  </div>
);

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, orders, updateOrderStatus, logoutUser } = useSystemStore();
  const [activeTab, setActiveTab] = useState('inventory');
  const [activeOrderTab, setActiveOrderTab] = useState('All');
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [medicines, setMedicines] = useState([]);
  
  const [commissionRate, setCommissionRate] = useState(1.0);
  const initialMedState = { brand: '', name: '', description: '', price: '', mrp: '', expireDate: '', stock: '' };
  const [newMed, setNewMed] = useState(initialMedState);

  const fetchInventory = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await fetch(`http://localhost/pharma_backend/api/products.php?role=company&company_id=${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        setMedicines(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    }
  };

  useEffect(() => {
    fetchInventory();
    
    // Fetch platform commission rate
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost/pharma_backend/api/settings.php');
        const data = await res.json();
        if (data.success && data.commission_rate) {
          setCommissionRate(parseFloat(data.commission_rate));
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };
    fetchSettings();
  }, [currentUser]);

  const handleUpdateStatus = (orderId, status) => {
    updateOrderStatus(orderId, status);
    toast.success(`Order #${orderId} marked as ${status}!`);
  };

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  const validateMedForm = () => {
    const e = {};
    if (!newMed.brand.trim()) e.brand = 'Brand name is required.';
    if (!newMed.name.trim()) e.name = 'Generic name is required.';
    if (!newMed.stock || isNaN(newMed.stock) || parseInt(newMed.stock) <= 0) e.stock = 'Valid stock required.';
    if (!newMed.price || isNaN(newMed.price) || parseFloat(newMed.price) <= 0) e.price = 'Valid base price required.';
    if (!newMed.mrp || isNaN(newMed.mrp) || parseFloat(newMed.mrp) <= 0) e.mrp = 'Valid MRP required.';
    if (newMed.price && newMed.mrp) {
        const finalPrice = parseFloat(newMed.price) * (1 + (commissionRate / 100));
        if (finalPrice > parseFloat(newMed.mrp)) {
            e.mrp = `Final platform price (Rs. ${finalPrice.toFixed(2)}) exceeds MRP! Reduce base price or increase MRP.`;
        }
    }
    if (!newMed.expireDate) e.expireDate = 'Expiry date is required.';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!validateMedForm()) return;
    
    try {
      const res = await fetch('http://localhost/pharma_backend/api/products.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMed,
          role: 'company',
          company_id: currentUser.id,
          stock: parseInt(newMed.stock),
          price: parseFloat(newMed.price)
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Medicine added to inventory successfully!`);
        setNewMed(initialMedState);
        setFormErrors({});
        setShowAddForm(false);
        fetchInventory(); // refresh list
      } else {
        toast.error(data.error || 'Failed to add medicine');
      }
    } catch (err) {
      toast.error('Network error occurred.');
    }
  };

  const navItems = [
    { id: 'inventory', label: 'My Inventory', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'incoming_orders', label: 'Incoming Orders', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'analytics', label: 'Pro Analytics', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
  ];

  const Sidebar = () => (
    <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-indigo-950 text-white flex flex-col shadow-xl transition-transform duration-300`}>
      <div className="p-5 border-b border-indigo-900 flex items-center justify-between">
        <div><h2 className="text-lg font-black text-white">Company Portal</h2><p className="text-xs text-indigo-300 mt-0.5 uppercase tracking-wider">{currentUser?.name || 'Global Medicine'}</p></div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-indigo-300 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-200 hover:text-white hover:bg-indigo-800'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            {item.label}
            {item.id === 'incoming_orders' && orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'pending').length}</span>
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
          <span className="font-bold text-slate-800">Company Portal</span>
        </div>
        <div className="p-6 lg:p-10">
          <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'incoming_orders' ? 'Incoming Orders' : activeTab === 'analytics' ? 'Pro Analytics' : 'My Inventory'}
              </h1>
              <p className="text-slate-500 mt-2">
                {activeTab === 'incoming_orders' ? 'Review and approve supply requests from pharmacies.' : activeTab === 'analytics' ? 'Advanced insights into your business performance.' : 'Manage your medicines and monitor stock levels.'}
              </p>
            </div>
            {activeTab === 'inventory' && (
              <button onClick={() => setShowAddForm(v => !v)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 text-sm shrink-0">
                {showAddForm ? 'Close Form' : '+ Add New Medicine'}
              </button>
            )}
          </header>

          {activeTab === 'inventory' && showAddForm && (
            <form onSubmit={handleAddMedicine} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300" noValidate>
              <h3 className="sm:col-span-2 font-bold text-slate-800 text-lg border-b border-slate-100 pb-2 mb-2">Add New Medicine</h3>
              {[
                { key: 'brand', label: 'Brand Name', placeholder: 'e.g. GSK', type: 'text' },
                { key: 'name', label: 'Generic Name', placeholder: 'e.g. Paracetamol', type: 'text' },
                { key: 'description', label: 'Description / Dosage', placeholder: 'e.g. 500mg tablets', type: 'text' },
                { key: 'stock', label: 'Stock Quantity', placeholder: 'e.g. 1000', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder} value={newMed[field.key]}
                    onChange={e => { setNewMed(p => ({ ...p, [field.key]: e.target.value })); setFormErrors(p => ({ ...p, [field.key]: '' })); }}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 ${formErrors[field.key] ? 'border-red-400' : 'border-slate-200'}`} />
                  {formErrors[field.key] && <p className="text-red-500 text-xs mt-1">{formErrors[field.key]}</p>}
                </div>
              ))}
              
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Your Base Price (Rs.)</label>
                  <input type="number" placeholder="e.g. 10.00" value={newMed.price}
                    onChange={e => { setNewMed(p => ({ ...p, price: e.target.value })); setFormErrors(p => ({ ...p, price: '' })); }}
                    className={`w-full bg-white border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 ${formErrors.price ? 'border-red-400' : 'border-slate-200'}`} />
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Platform Commission: {commissionRate}%
                  </p>
                  {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">Maximum Retail Price (MRP)</label>
                  <input type="number" placeholder="e.g. 12.00" value={newMed.mrp}
                    onChange={e => { setNewMed(p => ({ ...p, mrp: e.target.value })); setFormErrors(p => ({ ...p, mrp: '' })); }}
                    className={`w-full bg-white border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900 shadow-sm ${formErrors.mrp ? 'border-red-400 ring-1 ring-red-400' : 'border-indigo-200 ring-1 ring-indigo-100'}`} />
                  <p className="text-[11px] font-bold text-indigo-600 mt-1.5 flex items-center gap-1">
                    Final buyer price: Rs. {newMed.price ? (parseFloat(newMed.price) * (1 + (commissionRate/100))).toFixed(2) : '0.00'}
                  </p>
                  {formErrors.mrp && <p className="text-red-600 font-bold text-xs mt-1">{formErrors.mrp}</p>}
                </div>
              </div>
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
              <div className="sm:col-span-2 flex justify-end mt-4">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-sm transition-all active:scale-95">Submit Medicine</button>
              </div>
            </form>
          )}

          {activeTab === 'inventory' && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-extrabold text-slate-900">Current Inventory</h2>
              </div>
              {medicines.length === 0 ? (
                <EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} title="Inventory is empty" description='Add new medicines to see them here.' />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-4">Brand</th>
                      <th className="px-6 py-4">Generic Name</th>
                      <th className="px-6 py-4">Dosage</th>
                      <th className="px-6 py-4">Batch No</th>
                      <th className="px-6 py-4">Base Price</th>
                      <th className="px-6 py-4">MRP</th>
                      <th className="px-6 py-4">Expiry</th>
                      <th className="px-6 py-4 text-right">Stock</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {medicines.map(med => (
                        <tr key={med.id} className={`transition-colors ${med.stock < 20 ? 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-red-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}>
                          <td className="px-6 py-4"><span className="bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs uppercase tracking-wider">{med.brand}</span></td>
                          <td className="px-6 py-4 font-bold text-slate-900">{med.name}</td>
                          <td className="px-6 py-4 text-slate-600 text-sm font-semibold">{med.description || 'N/A'}</td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-mono">N/A</td>
                          <td className="px-6 py-4 font-bold text-slate-700">Rs. {(Number(med.price) || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 font-black text-indigo-700">Rs. {(Number(med.mrp) || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-slate-500 text-sm">{med.expireDate}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-lg font-black ${med.stock < 20 ? 'text-red-600' : 'text-emerald-600'}`}>
                              {med.stock}
                            </span>
                            {med.stock < 20 && (
                              <div className="mt-1">
                                <span className="bg-red-100 text-red-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-red-200">
                                  Low Stock Alert
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'incoming_orders' && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {orders.length === 0 ? (
                <EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} title="No incoming orders" description="Pharmacy order requests will appear here." />
              ) : (
                <div className="p-6 space-y-6">
                  {[...orders].map(order => (
                    <div key={order.id} className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm p-5">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-slate-200">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-lg mb-1 flex items-center gap-2">
                            Order #{order.id}
                            <span className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded font-semibold border border-blue-100">
                              Tracking ID: {order.transaction_id || 'N/A'}
                            </span>
                          </h4>
                          <p className="text-sm text-slate-500 mt-0.5">
                            Pharmacy: <span className="font-bold text-slate-700">{order.company_name}</span>
                            <span className="mx-2 text-slate-300">|</span>
                            Date: {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-black text-slate-900">Rs. {order.total_amount.toFixed(2)}</p>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider ${
                            order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            order.status?.toLowerCase() === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            order.status?.toLowerCase() === 'confirmed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            order.status?.toLowerCase() === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                            order.status?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Items</h5>
                        <ul className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-white border border-slate-100 rounded-xl px-4 py-2 text-sm">
                              <div>
                                <span className="font-bold text-slate-800">{item.generic_name}</span>
                                <span className="text-slate-500 ml-2">({item.brand_name})</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg mr-4">{item.quantity} units</span>
                                <span className="font-bold text-slate-900">Rs. {(item.quantity * item.price_per_unit).toFixed(2)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200">
                        {(order.status?.toLowerCase() === 'pending' || order.status?.toLowerCase() === 'paid') && (
                          <>
                            <button onClick={() => handleUpdateStatus(order.id, 'cancelled')} className="px-4 py-2 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 transition-colors">Cancel Order</button>
                            <button onClick={() => handleUpdateStatus(order.id, 'confirmed')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm">Confirm Order</button>
                          </>
                        )}
                        {order.status?.toLowerCase() === 'confirmed' && (
                          <button onClick={() => handleUpdateStatus(order.id, 'shipped')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm">Mark as Shipped</button>
                        )}
                        {order.status?.toLowerCase() === 'shipped' && (
                          <button onClick={() => handleUpdateStatus(order.id, 'delivered')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm">Mark as Delivered</button>
                        )}
                        {(order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'cancelled') && (
                          <span className="text-slate-400 font-semibold text-xs py-2">Order Finalized</span>
                        )}
                        {['confirmed', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) && (
                          <button
                            onClick={() => { setSelectedInvoiceOrder(order); setInvoiceModalOpen(true); }}
                            className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ml-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            View Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}


          {activeTab === 'analytics' && (
            <SupplierAnalytics currentUser={currentUser} setActiveTab={setActiveTab} />
          )}
        </div>
      </main>

      <InvoiceModal 
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        order={selectedInvoiceOrder}
        currentUserRole="supplier"
      />
    </div>
  );
};

export default SupplierDashboard;
