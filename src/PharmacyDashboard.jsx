import React, { useState } from 'react';
import { useSystemStore } from './SystemContext';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import CartSidebar from './CartSidebar';

const PharmacyDashboard = () => {
  const { currentUser, orders, updateOrderStatus } = useSystemStore();
  const navigate = useNavigate();

  // Calculate metrics
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => ['pending', 'approved', 'paid'].includes(o.status?.toLowerCase())).length;
  const completedOrders = orders.filter(o => o.status?.toLowerCase() === 'delivered').length;
  const totalExpenditure = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'delivered':     return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'approved': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':  return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default:         return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleCancel = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await updateOrderStatus(orderId, 'cancelled');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <CartSidebar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Pharmacy Portal</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your orders and business metrics.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/products" className="bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm">
              Browse Catalog
            </Link>
            <Link to="/my-orders" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95">
              Detailed Orders
            </Link>
          </div>
        </header>

        {/* Overview Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Total Orders</h3>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{totalOrders}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Active Orders</h3>
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{activeOrders}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Completed</h3>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{completedOrders}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Total Spent</h3>
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">Rs. {totalExpenditure.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
        </section>

        {/* Order History Table */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Order History</h2>
          </div>
          
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-medium">No orders found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">#{order.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{order.company_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {order.items?.length > 0 ? (
                            <span>{order.items[0].generic_name} <span className="text-slate-400 text-xs">x{order.items[0].quantity}</span> {order.items.length > 1 && `+ ${order.items.length - 1} more`}</span>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">Rs. {Number(order.total_amount).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {order.status?.toLowerCase() === 'pending' && (
                          <button onClick={() => handleCancel(order.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm transition-colors mr-3 hover:underline">
                            Cancel
                          </button>
                        )}
                        <Link to="/my-orders" className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default PharmacyDashboard;
