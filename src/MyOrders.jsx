import React from 'react';
import { useSystemStore } from './SystemContext';
import Navbar from './Navbar';
import CartSidebar from './CartSidebar';
import { Link } from 'react-router-dom';
import RateSupplierModal from './RateSupplierModal';
import { useState } from 'react';

const MyOrders = () => {
  const { orders, currentUser, updateOrderStatus } = useSystemStore();
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrderToRate, setSelectedOrderToRate] = useState(null);

  const myOrders = orders;

  const handleCancel = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await updateOrderStatus(orderId, 'cancelled');
    }
  };

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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-lg mb-1 flex items-center gap-2">
                      Order #{order.id}
                      <span className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded font-semibold border border-blue-100">
                        Tracking ID: {order.transaction_id || 'N/A'}
                      </span>
                    </h4>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Supplier: <span className="font-bold text-slate-700">{order.company_name}</span>
                      <span className="mx-2 text-slate-300">|</span>
                      Placed on: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-black text-slate-900">Rs. {order.total_amount.toFixed(2)}</p>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-500 font-bold">
                      <tr>
                        <th className="px-4 py-2.5">Medicine</th>
                        <th className="px-4 py-2.5 text-right">Qty</th>
                        <th className="px-4 py-2.5 text-right">Price</th>
                        <th className="px-4 py-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-800 block">{item.generic_name}</span>
                            <span className="text-xs text-slate-500">{item.brand_name}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-700">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-slate-600">Rs. {item.price_per_unit.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">Rs. {(item.quantity * item.price_per_unit).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {order.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
                
                {order.status?.toLowerCase() === 'delivered' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => { setSelectedOrderToRate(order); setRatingModalOpen(true); }}
                      className="text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      Rate Supplier
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <RateSupplierModal 
          isOpen={ratingModalOpen} 
          onClose={() => { setRatingModalOpen(false); setSelectedOrderToRate(null); }} 
          order={selectedOrderToRate}
          currentUser={currentUser}
        />
      </main>
    </div>
  );
};

export default MyOrders;
