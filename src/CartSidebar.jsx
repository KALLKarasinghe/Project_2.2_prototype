import React, { useState } from 'react';
import { useSystemStore } from './SystemContext';
import PaymentModal from './PaymentModal';
import toast from 'react-hot-toast';

const CartSidebar = () => {
  const { cart, cartTotal, isCartOpen, toggleCart, removeFromCart, updateCartQty, clearCart, currentUser, fetchCart } = useSystemStore();
  const [showPayment, setShowPayment] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] transition-opacity duration-300"
          onClick={toggleCart}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] transform transition-transform duration-500 ease-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Shopping Cart</h2>
              <p className="text-slate-400 text-xs font-medium">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={toggleCart}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-28 h-28 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                <svg className="w-14 h-14 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Your cart is empty</h3>
              <p className="text-slate-500 text-sm max-w-[240px] leading-relaxed">
                Browse our catalog and add medicines to your cart to get started.
              </p>
              <button
                onClick={toggleCart}
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{item.brand}</span>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight mt-0.5 truncate">{item.name}</h4>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-7 h-7 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => updateCartQty(item.id, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 text-slate-600 font-bold transition-colors"
                      >
                        −
                      </button>
                      <span className="w-10 h-9 flex items-center justify-center text-sm font-bold text-slate-800 border-x border-slate-200 bg-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.id, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 text-slate-600 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    {/* Item Total */}
                    <p className="font-extrabold text-slate-900 text-base tracking-tight">
                      Rs. {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="w-full py-2.5 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors mt-2"
              >
                Clear entire cart
              </button>
            </div>
          )}
        </div>

        {/* Footer with Subtotal & Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 flex-shrink-0">
            {/* Subtotal Breakdown */}
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm text-slate-500 font-medium">Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="text-sm font-bold text-slate-700">
                Rs. {cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-slate-500 font-medium">Delivery</span>
              <span className="text-sm font-bold text-emerald-600">Free</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-slate-200 mb-5">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-xl font-black text-slate-900">
                Rs. {cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={() => { setShowPayment(true); toggleCart(); }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={cartTotal}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
};

export default CartSidebar;
