import React from 'react';
import { useSystemStore } from './SystemContext';
import Navbar from './Navbar';
import CartSidebar from './CartSidebar';
import { Link } from 'react-router-dom';

const MyOrders = () => {
  const { orders, currentUser } = useSystemStore();

  // Filter orders for the current user
  const myOrders = orders.filter(
    order => order.pharmacyId === currentUser?.id || order.pharmacyName === currentUser?.name
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':     return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Approved': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending':  return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      default:         return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <CartSidebar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">My Orders</h1>
          <p className="text-slate-500 font-medium">Track all your placed orders and their status.</p>
        </div>

        {!currentUser ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Sign in to view orders</h3>
            <p className="text-slate-500 mb-4">You need to be logged in to see your order history.</p>
            <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
          </div>
        ) : myOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">No orders yet</h3>
            <p className="text-slate-500 mb-4">Start shopping and your orders will appear here.</p>
            <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95 inline-block">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-base">{order.medicineName || 'Medicine'}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span>Qty: <strong className="text-slate-700">{order.quantity}</strong></span>
                      <span className="text-slate-300">·</span>
                      <span>Order #{order.id}</span>
                      {order.date && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span>{order.date}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyOrders;
