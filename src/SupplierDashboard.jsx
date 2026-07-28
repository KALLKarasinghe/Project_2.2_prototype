import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemStore } from './SystemContext';
import toast from 'react-hot-toast';
import SupplierAnalytics from './SupplierAnalytics';
import OrderChatModal from './OrderChatModal';
import SupplierWallet from './SupplierWallet';
import ProfileSettings from './ProfileSettings';
import Navbar from './Navbar';

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const { currentUser, orders, updateOrderStatus, logoutUser } = useSystemStore();

  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeDashboardTab') || 'orders');

  // Inventory States
  const [inventoryData, setInventoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; 

  // Incoming Orders States
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedOrderForChat, setSelectedOrderForChat] = useState(null);

  // Forms & System States
  const [commissionRate, setCommissionRate] = useState(1.0);
  const [formData, setFormData] = useState({
    brandName: '', genericName: '', description: '', 
    stockQuantity: '', basePrice: '', mrp: '', expiryDate: '', batchNumber: ''
  });

  const [selectedProduct, setSelectedProduct] = useState({
    product_id: '', name: '', brand: '', price: 0, mrp: 0, stock: 0, expireDate: '', description: ''
  });

  // fetch inventory for the supplier
  const fetchInventory = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost/pharma_backend/api/products.php?role=company&company_id=${currentUser.id}`);
      const result = await response.json();
      if (response.ok && result.success) {
        setInventoryData(result.data);
      }
    } catch (error) {
      console.error("Network Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory();
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
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
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    localStorage.setItem('activeDashboardTab', tabName);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (newStatus === 'Rejected' && !rejectionReason) {
      toast.error("Please select a rejection reason first!");
      return;
    }
    
    setUpdatingStatus(true);
    try {
      // In the C: prototype, updateOrderStatus from Context handles this, but since we need rejection reasons:
      const response = await fetch("http://localhost/pharma_backend/api/orders.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          order_id: orderId, 
          status: newStatus,
          reject_reason: newStatus === 'Rejected' ? rejectionReason : null,
          supplier_id: currentUser.id
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(`Order updated to '${newStatus}' successfully! ${newStatus === 'Delivered' ? '(Inventory Auto-Deducted)' : ''}`);
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        updateOrderStatus(orderId, newStatus); // Update global store
      } else {
        toast.error("Error: " + (result.message || "Failed to update status."));
      }
    } catch (error) {
      toast.error("Network Error: " + error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrintPackingSlip = () => {
    window.print();
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const submitData = { 
      brand: formData.brandName, 
      name: formData.genericName, 
      description: formData.description, 
      stock: parseInt(formData.stockQuantity), 
      price: parseFloat(formData.basePrice), 
      mrp: parseFloat(formData.mrp), 
      expireDate: formData.expiryDate,
      role: 'company',
      company_id: currentUser.id
    };
    try {
      const response = await fetch("http://localhost/pharma_backend/api/products.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success("Medicine added successfully!");
        setIsAddFormOpen(false);
        setFormData({ brandName: '', genericName: '', description: '', stockQuantity: '', basePrice: '', mrp: '', expiryDate: '', batchNumber: '' });
        fetchInventory();
      } else {
        toast.error(result.error || "Failed to add medicine");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updateData = { ...selectedProduct, company_id: currentUser.id };
    try {
      const response = await fetch("http://localhost/pharma_backend/api/products.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success("Details modified successfully!");
        setIsEditModalOpen(false);
        fetchInventory();
      } else {
        toast.error(result.error || "Failed to edit medicine");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      const response = await fetch(`http://localhost/pharma_backend/api/products.php?product_id=${productId}`, {
        method: "DELETE"
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success("Item deleted!");
        fetchInventory();
      } else {
        toast.error("Failed to delete medicine");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  const openEditModal = (item) => {
    setSelectedProduct({
      product_id: item.id || item.product_id, name: item.name, brand: item.brand,
      price: item.price, mrp: item.mrp, stock: item.stock,
      expireDate: item.expireDate || item.expire_date || '', description: item.description || ''
    });
    setIsEditModalOpen(true);
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setRejectionReason(''); 
    setIsOrderModalOpen(true);
  };

  const handleLogoutClick = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logoutUser();
      navigate('/login');
    }
  };

  const filteredInventory = inventoryData.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (item.brand?.toLowerCase().includes(search) || item.name?.toLowerCase().includes(search));
  });

  const totalResults = filteredInventory.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const filteredOrders = orders.filter(item => {
    const search = orderSearchTerm.toLowerCase();
    const idStr = item.id ? String(item.id).toLowerCase() : '';
    const nameStr = item.company_name ? item.company_name.toLowerCase() : '';
    return idStr.includes(search) || nameStr.includes(search);
  });

  const totalOrdersResults = filteredOrders.length;
  const indexOfLastOrdItem = currentOrdersPage * itemsPerPage;
  const indexOfFirstOrdItem = indexOfLastOrdItem - itemsPerPage;
  const currentOrdersItems = filteredOrders.slice(indexOfFirstOrdItem, indexOfLastOrdItem);
  const totalOrdersPages = Math.ceil(totalOrdersResults / itemsPerPage);

  const ProfileAvatar = () => (
    <button 
      onClick={() => handleTabChange(activeTab === 'profile' ? 'inventory' : 'profile')}
      className="w-12 h-12 shrink-0 rounded-full overflow-hidden border-2 border-indigo-200 hover:border-indigo-500 shadow-md transition-all hover:scale-105 bg-white flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
      title="My Profile"
    >
      {currentUser?.profile_pic ? (
        <img src={`http://localhost${currentUser.profile_pic}`} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <span className="text-xl font-bold text-slate-400">{currentUser?.name?.charAt(0) || 'U'}</span>
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-50 print:bg-white overflow-hidden">
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="flex flex-1 overflow-hidden relative">
      {/* side bar*/}
      <div className="w-65 bg-indigo-950 flex flex-col justify-between px-5 py-6 sticky top-0 h-full z-10 text-white print:hidden overflow-y-auto">
        <div>
          <h2 className="font-inter text-lg text-white font-black tracking-normal">Company Portal</h2>
          <p className="text-emerald-400 text-sm font-bold m-0">{currentUser?.name || 'Global Medicine'}</p>
          <hr className="border-indigo-900 my-5" />
          
          <ul className="list-none p-0 m-0">
            <li onClick={() => handleTabChange('inventory')} className={`px-3.75 py-3 rounded-xl cursor-pointer mb-2 font-medium transition-all duration-200 ease-in-out ${activeTab === 'inventory' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-transparent text-indigo-200 hover:bg-indigo-600/15 hover:text-white'}`}>
              My Inventory
            </li>
            <li onClick={() => handleTabChange('orders')} className={`px-3.75 py-3 rounded-xl cursor-pointer mb-2 flex items-center justify-between font-medium transition-all duration-200 ease-in-out ${activeTab === 'orders' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-transparent text-indigo-200 hover:bg-indigo-600/15 hover:text-white'}`}>
              Incoming Orders
              {orders.filter(o => o.status === 'Pending').length > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'Pending').length}</span>
              )}
            </li>
            <li onClick={() => handleTabChange('analytics')} className={`px-3.75 py-3 rounded-xl cursor-pointer mb-2 font-medium transition-all duration-200 ease-in-out ${activeTab === 'analytics' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-transparent text-indigo-200 hover:bg-indigo-600/15 hover:text-white'}`}>
              Pro Analytics
            </li>
            <li onClick={() => handleTabChange('wallet')} className={`px-3.75 py-3 rounded-xl cursor-pointer font-medium transition-all duration-200 ease-in-out ${activeTab === 'wallet' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-transparent text-indigo-200 hover:bg-indigo-600/15 hover:text-white'}`}>
              Wallet
            </li>
          </ul>
        </div>
        <div>
          <button onClick={handleLogoutClick} className="w-full bg-indigo-600 text-white p-3 border-none rounded-lg cursor-pointer font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
            ➔ Log Out
          </button>
        </div>
      </div>

      {/*main content */}
      <div className="flex-1 overflow-y-auto py-10 pl-10 pr-24 max-w-full print:p-0 relative">
        
        {/* inventory tab */}
        {activeTab === 'inventory' && (
          <div className="print:hidden">
            <div className="flex justify-between items-center mb-6.25 gap-4">
              <div>
                <h1 className="font-inter text-4xl text-slate-900 font-extrabold tracking-tight">My Inventory</h1>
                <p className="text-slate-500 mt-1.25 mb-0 text-base">Manage your medicines and monitor stock levels.</p>
              </div>
              <div className="flex items-center gap-4">
                {!isAddFormOpen ? (
                  <button onClick={() => setIsAddFormOpen(true)} className="bg-indigo-600 text-white px-6 py-3 border-none rounded-lg cursor-pointer font-bold hover:bg-indigo-700 transition-colors">
                    + Add New Medicine
                  </button>
                ) : (
                  <button onClick={() => setIsAddFormOpen(false)} className="bg-slate-300 text-slate-700 px-6 py-3 border-none rounded-lg cursor-pointer font-bold hover:bg-slate-400 transition-colors">
                    Cancel
                  </button>
                )}
                <ProfileAvatar />
              </div>
            </div>

            {isAddFormOpen && (
              <form onSubmit={handleAddSubmit} className="bg-white p-7.5 rounded-xl shadow-md mb-7.5 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="mt-0 mb-5 text-lg font-bold text-slate-800">Add New Medicine</h3>
                <div className="grid grid-cols-2 gap-5 mb-3.75">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Brand Name</label>
                    <input type="text" name="brandName" value={formData.brandName} onChange={handleAddInputChange} required className="w-full p-2.5 mt-1.25 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Generic Name</label>
                    <input type="text" name="genericName" value={formData.genericName} onChange={handleAddInputChange} required className="w-full p-2.5 mt-1.25 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5 mb-3.75">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Description</label>
                    <input type="text" name="description" value={formData.description} onChange={handleAddInputChange} className="w-full p-2.5 mt-1.25 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Stock Quantity</label>
                    <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleAddInputChange} required className="w-full p-2.5 mt-1.25 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5 mb-3.75">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Base Price (Rs.)</label>
                    <input type="number" step="0.01" name="basePrice" value={formData.basePrice} onChange={handleAddInputChange} required className="w-full p-2.5 mt-1.25 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-600" />
                    <p className="text-xs text-slate-500 mt-1">Platform Commission: {commissionRate}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">MRP (Rs.)</label>
                    <input type="number" step="0.01" name="mrp" value={formData.mrp} onChange={handleAddInputChange} required className="w-full p-2.5 mt-1.25 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5 mb-6.25">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Expiry Date</label>
                    <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleAddInputChange} required className="w-full p-2.5 mt-1.25 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Batch Number</label>
                    <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleAddInputChange} placeholder="e.g. B-544" className="w-full p-2.5 mt-1.25 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-600" />
                  </div>
                </div>
                <button type="submit" className="bg-indigo-600 text-white py-3 px-6 border-none rounded-lg cursor-pointer w-full font-bold hover:bg-indigo-700 transition-colors">Submit Medicine</button>
              </form>
            )}

            <div className="mb-6.25">
              <input type="text" placeholder="Search medicines..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full px-5 py-3.5 rounded-xl border border-slate-300 text-base focus:outline-none focus:border-indigo-600" />
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h3 className="mt-0 mb-5 text-slate-800 font-bold text-base">Current Inventory</h3>
              {loading ? <p className="text-slate-500 text-center py-4">Loading Inventory Data...</p> : (
                <>
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase">Brand</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase">Generic Name</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase">Dosage</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase">Batch No</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase">Base Price</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase">MRP</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase">Expiry</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase">Stock</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length > 0 ? (
                        currentItems.map((item) => (
                          <tr key={item.id || item.product_id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${item.stock < 20 ? 'bg-red-50 border-l-4 border-red-500' : ''}`}>
                            <td className="px-2.5 py-4"><span className="bg-slate-200 text-slate-700 px-2 py-1 rounded-md text-[11px] font-bold inline-block uppercase tracking-wider">{item.brand}</span></td>
                            <td className="px-2.5 py-4 font-bold text-slate-900 text-sm">{item.name}</td>
                            <td className="px-2.5 py-4 text-slate-500 text-xs leading-relaxed">{item.description || 'N/A'}</td>
                            <td className="px-2.5 py-4 text-slate-400 text-xs">{item.batch_number || 'N/A'}</td>
                            <td className="px-2.5 py-4 text-slate-700 text-sm font-bold">Rs. {parseFloat(item.price).toFixed(2)}</td>
                            <td className="px-2.5 py-4 text-indigo-700 text-sm font-black">Rs. {parseFloat(item.mrp).toFixed(2)}</td>
                            <td className="px-2.5 py-4 text-slate-500 text-xs">{item.expireDate || item.expire_date || 'N/A'}</td>
                            <td className="px-2.5 py-4">
                               <span className={`font-bold text-base ${item.stock < 20 ? 'text-red-600' : 'text-emerald-600'}`}>{item.stock}</span>
                            </td>
                            <td className="px-2.5 py-4 flex flex-row gap-2 items-center justify-start">
                              <button onClick={() => openEditModal(item)} className="bg-indigo-600 text-white border-none px-3 py-2 rounded-md cursor-pointer text-xs font-medium inline-flex items-center gap-1.25 shadow-sm hover:bg-indigo-700 transition-colors">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteProduct(item.id || item.product_id)} className="bg-transparent text-indigo-600 border border-indigo-600 px-3 py-1.5 rounded-md cursor-pointer text-xs font-medium inline-flex items-center gap-1 hover:bg-indigo-600/10 transition-colors">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="9" className="p-7.5 text-center text-slate-400">No medicines found.</td></tr>
                      )}
                    </tbody>
                  </table>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                     <div className="flex justify-between items-center mt-6">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold disabled:opacity-50">Previous</button>
                        <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold disabled:opacity-50">Next</button>
                     </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        
        {/*incoming order view */}
        
        {activeTab === 'orders' && (
          <div className="print:hidden">
            <div className="flex justify-between items-center mb-6.25 gap-4">
              <div>
                <h1 className="font-inter text-4xl text-slate-900 font-extrabold tracking-tight">Incoming Orders</h1>
                <p className="text-slate-500 mt-1.25 mb-0 text-base">Review and process pharmacy purchase orders live.</p>
              </div>
              <div className="flex items-center gap-4">
                <ProfileAvatar />
              </div>
            </div>

            {/*upper 3 cards */}
            <div className="grid grid-cols-3 gap-5 mb-7.5 print:hidden">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
                <h3 className="text-2xl font-black text-slate-800 mt-1">
                  {orders.filter(o => o.status?.toLowerCase() === 'pending').length} Orders
                </h3>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Orders</span>
                <h3 className="text-2xl font-black text-slate-800 mt-1">
                  {orders.filter(o => o.status?.toLowerCase() === 'approved' || o.status?.toLowerCase() === 'confirmed' || o.status?.toLowerCase() === 'paid').length} Orders
                </h3>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivered Orders</span>
                <h3 className="text-2xl font-black text-slate-800 mt-1">
                  {orders.filter(o => o.status?.toLowerCase() === 'delivered' || o.status?.toLowerCase() === 'shipped').length} Orders
                </h3>
              </div>
            </div>

            <div className="mb-6.25 print:hidden">
              <input type="text" placeholder="Search by Order ID or Pharmacy Name..." value={orderSearchTerm} onChange={(e) => { setOrderSearchTerm(e.target.value); setCurrentOrdersPage(1); }} className="w-full px-5 py-3.5 rounded-xl border border-slate-300 text-base focus:outline-none focus:border-indigo-600" />
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 print:hidden">
              <h3 className="mt-0 mb-5 text-slate-800 font-bold text-base">Orders List</h3>
              
                <>
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase w-[10%]">Order ID</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase w-[18%]">Pharmacy</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase w-[22%]">Ordered Details</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase w-[15%]">Date & Time</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase w-[13%]">Total Amount</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase w-[10%]">Status</th>
                        <th className="px-2.5 py-3.5 text-xs text-slate-500 uppercase w-[15%] text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrdersItems.length > 0 ? (
                        currentOrdersItems.map((order) => {
                          // calculate total quantity and format product name using simple if/else
                          let qty = 0;
                          let pName = '';
                          
                          if (order.items) {
                            qty = order.items.reduce((sum, item) => sum + item.quantity, 0);
                            pName = order.items[0]?.generic_name;
                            if (order.items.length > 1) {
                              pName += ` + ${order.items.length - 1} more`;
                            }
                          } else {
                            qty = order.order_qty;
                            pName = order.product_name;
                          }

                          return (
                          <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-2.5 py-4 font-bold text-indigo-600 text-xs">#{order.id}</td>
                            <td className="px-2.5 py-4 font-bold text-slate-800 text-sm">{order.company_name}</td>
                            
                            <td className="px-2.5 py-4">
                              <div className="text-sm font-bold text-slate-800">{pName || 'Multiple Items'}</div>
                              <div className="text-[11px] font-semibold mt-0.5 text-slate-500">
                                Total Qty: {qty}
                              </div>
                            </td>

                            <td className="px-2.5 py-4 text-slate-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="px-2.5 py-4 text-slate-800 text-sm font-bold">Rs. {parseFloat(order.total_amount).toFixed(2)}</td>
                            <td className="px-2.5 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold inline-block uppercase tracking-wider ${
                                order.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' :
                                order.status?.toLowerCase() === 'approved' || order.status?.toLowerCase() === 'confirmed' ? 'bg-blue-100 text-blue-700' : 
                                order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'shipped' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              }`}>{order.status}</span>
                            </td>
                            <td className="px-2.5 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button 
                                  onClick={() => { setSelectedOrderForChat(order); setChatModalOpen(true); }}
                                  type="button" 
                                  className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-bold font-inter text-indigo-600 rounded-lg group bg-indigo-50 hover:bg-indigo-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 cursor-pointer shadow-sm active:scale-95 transition-all duration-150"
                                >
                                  <span className="relative px-3 py-2 transition-all duration-700 rounded-md">
                                    Chat
                                  </span>
                                </button>
                                <button 
                                  onClick={() => openOrderModal(order)} 
                                  type="button" 
                                  className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-bold font-inter text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 transition-all duration-150"
                                >
                                  <span className="relative px-3.5 py-2 transition-all duration-700 bg-indigo-600 rounded-md group-hover:bg-opacity-0">
                                    ⚡ Process
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )})
                      ) : (
                        <tr><td colSpan="7" className="p-7.5 text-center text-slate-400">No incoming orders found.</td></tr>
                      )}
                    </tbody>
                  </table>
                  {totalOrdersPages > 1 && (
                     <div className="flex justify-between items-center mt-6 px-2">
                        <button onClick={() => setCurrentOrdersPage(p => Math.max(1, p - 1))} disabled={currentOrdersPage === 1} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold disabled:opacity-50">Previous</button>
                        <span className="text-sm text-slate-600">Page {currentOrdersPage} of {totalOrdersPages}</span>
                        <button onClick={() => setCurrentOrdersPage(p => Math.min(totalOrdersPages, p + 1))} disabled={currentOrdersPage === totalOrdersPages} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold disabled:opacity-50">Next</button>
                     </div>
                  )}
                </>
              
            </div>
          </div>
        )}

        {/* analytics tab */}
        {activeTab === 'analytics' && (
          <SupplierAnalytics currentUser={currentUser} setActiveTab={setActiveTab} />
        )}
      </div>

      {/* Edit Modal popup */}
      {isEditModalOpen && (
        <div className="fixed top-0 left-0 w-full flex justify-center items-center z-[999] h-screen bg-indigo-950/40 backdrop-blur-xs">
          <form onSubmit={handleEditSubmit} className="bg-white p-7.5 rounded-2xl w-96 shadow-2xl animate-in zoom-in-95 duration-200">
             <h3 className="mt-0 mb-5 text-lg font-bold text-slate-800">Edit Medicine</h3>
             <div className="mb-4">
                <label className="text-sm font-medium text-slate-600">Stock Quantity</label>
                <input type="number" name="stock" value={selectedProduct.stock} onChange={handleEditInputChange} required className="w-full p-2.5 mt-1.25 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-600" />
             </div>
             <div className="mb-4">
                <label className="text-sm font-medium text-slate-600">Base Price</label>
                <input type="number" step="0.01" name="price" value={selectedProduct.price} onChange={handleEditInputChange} required className="w-full p-2.5 mt-1.25 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-600" />
             </div>
             <div className="mb-6">
                <label className="text-sm font-medium text-slate-600">MRP</label>
                <input type="number" step="0.01" name="mrp" value={selectedProduct.mrp} onChange={handleEditInputChange} required className="w-full p-2.5 mt-1.25 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-600" />
             </div>
             <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-600 font-bold bg-slate-100 hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-white font-bold bg-indigo-600 hover:bg-indigo-700">Save Changes</button>
             </div>
          </form>
        </div>
      )}

      {/* Process Order popup */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed top-0 left-0 w-full flex justify-center items-center z-[999] h-screen bg-indigo-950/40 backdrop-blur-xs print:absolute print:top-0 print:left-0 print:w-full print:h-auto print:bg-white print:z-0 print:backdrop-blur-none">
          <div className="bg-white p-8 rounded-2xl w-[700px] shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto print:shadow-none print:p-0 print:w-full print:border-none print:max-h-none">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-5 mb-5">
              <div>
                <span className="bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider print:border">
                  {selectedOrder.status === 'Delivered' || selectedOrder.status === 'Shipped' ? 'Official Financial Document' : 'Supply Logistics Document'}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2 uppercase tracking-tight">
                  {selectedOrder.status === 'Delivered' || selectedOrder.status === 'Shipped' ? 'OFFICIAL TAX INVOICE' : 'MEDICAL PACKING SLIP'}
                </h2>
                <p className="text-xs text-slate-400 m-0 mt-1">Order RefID: <strong className="text-slate-700">#{selectedOrder.id}</strong></p>
                <p className="text-xs text-slate-400 m-0">Issue Date & Time: {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <h3 className="text-indigo-600 text-xl font-black m-0">{currentUser?.name}</h3>
                <p className="text-xs text-slate-400 m-0">Pharmaceutical Manufacturing PLC</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl grid grid-cols-2 gap-4 mb-5 print:bg-transparent print:border print:p-3 print:rounded-none">
              <div>
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-widest block">Consignee Address (Client)</span>
                <h4 className="text-slate-900 font-extrabold m-0 text-sm mt-1">{selectedOrder.company_name}</h4>
                <div className="mt-2 text-xs">
                  <span className="text-slate-400">Current Status: </span>
                  <span className="font-bold text-indigo-600 uppercase text-[11px]">{selectedOrder.status}</span>
                </div>
              </div>
              <div className="text-right border-l border-slate-200 pl-4 print:border-l">
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-widest block">Financial Statement</span>
                <h3 className="text-indigo-600 font-black text-lg m-0 mt-1">Rs. {parseFloat(selectedOrder.total_amount).toFixed(2)}</h3>
                <p className="text-[10px] text-slate-500 m-0 font-medium">Terms: 30-Day Credit Account</p>
              </div>
            </div>

            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Itemized Specifications</h5>
            <div className="border border-slate-100 rounded-xl overflow-hidden mb-5 print:border print:rounded-none">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200">
                    <th className="p-3 text-slate-600 uppercase font-bold">Product / Brand Description</th>
                    <th className="p-3 text-slate-600 uppercase font-bold text-center">Batch Allocation</th>
                    <th className="p-3 text-slate-600 uppercase font-bold text-center">Quantity</th>
                    <th className="p-3 text-slate-600 uppercase font-bold text-right">Unit Price</th>
                    <th className="p-3 text-slate-600 uppercase font-bold text-right">Net Value</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0">
                      <td className="p-3">
                        <span className="text-indigo-600 font-mono text-[11px] block font-bold">[PROD-#{item.product_id}]</span>
                        <strong className="text-slate-800 text-sm">{item.generic_name}</strong>
                        <span className="text-slate-400 font-normal block text-[10px] mt-0.5">{item.brand_name}</span>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500 text-[11px]">B-M908</td>
                      <td className="p-3 text-center font-bold text-slate-700">{item.quantity} Packs</td>
                      <td className="p-3 text-right text-slate-600">Rs. {parseFloat(item.price_per_unit).toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">Rs. {(parseFloat(item.price_per_unit) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                  {!selectedOrder.items && (
                    <tr className="border-b border-slate-100">
                      <td className="p-3">
                        <span className="text-indigo-600 font-mono text-[11px] block font-bold">[PROD-#{selectedOrder.product_id || '9'}]</span>
                        <strong className="text-slate-800 text-sm">{selectedOrder.product_name || 'Amoxicillin Capsule'}</strong>
                        <span className="text-slate-400 font-normal block text-[10px] mt-0.5">{selectedOrder.product_brand || 'Morison'}</span>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500 text-[11px]">B-M908</td>
                      <td className="p-3 text-center font-bold text-slate-700">{selectedOrder.order_qty || selectedOrder.total_items} Packs</td>
                      <td className="p-3 text-right text-slate-600">Rs. {parseFloat(selectedOrder.total_amount / (selectedOrder.order_qty || selectedOrder.total_items)).toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">Rs. {parseFloat(selectedOrder.total_amount).toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-6 border-b border-slate-100 pb-4">
              <div className="w-64 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-slate-800 pt-2 border-t text-sm">
                  <span>Grand Total (LKR):</span>
                  <span className="text-indigo-600 font-black">Rs. {parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {selectedOrder.status === 'Rejected' && (
              <div className="mb-5 bg-rose-50 border border-rose-100 p-3.5 rounded-xl print:hidden">
                <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider mb-1.5">⚠️ Specify Rejection Reason:</label>
                <select 
                  value={rejectionReason} 
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-rose-200 text-xs font-semibold focus:outline-none focus:border-rose-600 bg-white text-rose-900"
                >
                  <option value="">-- Choose Reason --</option>
                  <option value="Out of Stock / Insufficient Supply Inventory">Out of Stock / Insufficient Supply Inventory</option>
                  <option value="Expired Batch Allocation / Quality Quarantine Deficit">Expired Batch Allocation / Quality Quarantine Deficit</option>
                </select>
              </div>
            )}

            {/* Workflow Select Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-100 pt-5 print:hidden gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 uppercase">Workflow Status:</label>
                <select 
                  value={selectedOrder.status} 
                  disabled={updatingStatus}
                  onChange={(e) => {
                    const nextStatus = e.target.value;
                    setSelectedOrder(prev => ({ ...prev, status: nextStatus }));
                    if (nextStatus !== 'Rejected') {
                      handleUpdateOrderStatus(selectedOrder.id, nextStatus);
                    }
                  }}
                  className="p-2.5 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:border-indigo-600 bg-white shadow-xs"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option> 
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {selectedOrder.status === 'Rejected' && (
                  <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Rejected')} className="bg-rose-600 text-white font-bold px-3 py-2.5 rounded-lg text-xs hover:bg-rose-700 cursor-pointer">Confirm Reject</button>
                )}
              </div>
              
              <div className="flex gap-2.5">
                {selectedOrder.status === 'Delivered' || selectedOrder.status === 'Shipped' ? (
                  <button type="button" onClick={handlePrintPackingSlip} className="bg-emerald-600 text-white border-none px-4 py-2.5 rounded-lg cursor-pointer font-bold text-xs shadow-md hover:bg-emerald-700 transition-colors">🧾 Print Official Invoice</button>
                ) : (
                  <button type="button" onClick={handlePrintPackingSlip} className="bg-indigo-600 text-white border-none px-4 py-2.5 rounded-lg cursor-pointer font-bold text-xs shadow-md hover:bg-indigo-700 transition-colors">📦 Print Packing Slip</button>
                )}
                <button type="button" onClick={() => setIsOrderModalOpen(false)} className="bg-slate-100 text-slate-600 border-none px-5 py-2.5 rounded-lg cursor-pointer text-xs font-bold hover:bg-slate-200 transition-colors">Close</button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="print:hidden">
          <div className="flex justify-between items-center mb-6.25 gap-4">
            <div>
              <h1 className="font-inter text-4xl text-slate-900 font-extrabold tracking-tight">Wallet</h1>
              <p className="text-slate-500 mt-1.25 mb-0 text-base">Manage your earnings and withdrawals.</p>
            </div>
            <div className="flex items-center gap-4">
              <ProfileAvatar />
            </div>
          </div>
          <SupplierWallet currentUser={currentUser} />
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="print:hidden">
          <div className="flex justify-end mb-4">
            <ProfileAvatar />
          </div>
          <ProfileSettings />
        </div>
      )}

      <OrderChatModal
        isOpen={chatModalOpen}
        onClose={() => { setChatModalOpen(false); setSelectedOrderForChat(null); }}
        order={selectedOrderForChat}
        currentUser={currentUser}
      />
      </div>
    </div>
  );
}
