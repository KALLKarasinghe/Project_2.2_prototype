import React, { useState } from 'react';
import { useSystemStore } from './SystemContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/pharma_backend/api';

const PaymentModal = ({ total, onClose }) => {
  const { clearCart, cart, placeOrder, currentUser } = useSystemStore();
  const navigate = useNavigate();

  // Cache the initial total so it doesn't drop to 0 when clearCart() fires
  const [finalAmount] = useState(total);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderId] = useState(() => 'GM-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase());
  const [hasPremium, setHasPremium] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      const checkSub = async () => {
        try {
          const res = await fetch(`http://localhost/pharma_backend/api/subscription.php?user_id=${currentUser.id}`);
          const data = await res.json();
          if (data.success && data.data?.status === 'Active') {
            setHasPremium(true);
          }
        } catch (err) {}
      };
      checkSub();
    }
  }, [currentUser]);

  const discount = hasPremium ? finalAmount * 0.005 : 0;
  const grandTotal = finalAmount - discount;

  // Buyer details from logged-in user or defaults
  const buyerName  = currentUser?.name || 'Guest';
  const buyerEmail = currentUser?.email || 'guest@globalmedicine.lk';
  const buyerPhone = currentUser?.phone || '0770000000';
  const buyerAddress = currentUser?.address || 'Colombo';

  const handlePayHere = async () => {
    setProcessing(true);
    setError('');

    // Ensure strict 2 decimal formatting
    const formattedAmount = Number(grandTotal).toFixed(2);

    try {
      // Step 1: Fetch hash from PHP backend
      const res = await fetch(`${API_BASE}/generate_hash.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          amount: formattedAmount,
          currency: 'LKR',
        }),
      });

      const hashData = await res.json();
      if (!hashData.hash) {
        throw new Error('Failed to generate payment hash.');
      }

      // Step 2 has been moved to the onCompleted callback so DB saves only after payment success

      // Step 3: Configure PayHere payment object
      const payment = {
        sandbox: true, // Set to false for production
        merchant_id: hashData.merchant_id,
        return_url: window.location.origin,
        cancel_url: window.location.origin + '/products',
        notify_url: `${API_BASE}/notify.php`,
        order_id: orderId,
        items: cart.map(i => i.name).join(', '),
        amount: formattedAmount,
        currency: 'LKR',
        hash: hashData.hash,
        first_name: buyerName.split(' ')[0],
        last_name: buyerName.split(' ').slice(1).join(' ') || '-',
        email: buyerEmail,
        phone: buyerPhone,
        address: buyerAddress,
        city: buyerAddress,
        country: 'Sri Lanka',
      };

      // Step 4: Set up PayHere callbacks
      window.payhere.onCompleted = async function onCompleted(completedOrderId) {
        console.log('PayHere payment completed. Order ID:', completedOrderId);
        try {
          // Trigger the checkout API to convert cart items to real orders
          const checkoutRes = await fetch('http://localhost/pharma_backend/api/checkout.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUser.id, transaction_id: completedOrderId })
          });
          const data = await checkoutRes.json();
          if (data.success) {
            clearCart();
            setSuccess(true);
          } else {
            setError(data.error || 'Payment succeeded but order creation failed.');
          }
        } catch (err) {
          console.error('Checkout API error:', err);
          setError('Payment succeeded but database error occurred.');
        } finally {
          setProcessing(false);
        }
      };

      window.payhere.onDismissed = function onDismissed() {
        console.log('PayHere payment dismissed by user.');
        setProcessing(false);
      };

      window.payhere.onError = function onError(err) {
        console.error('PayHere error:', err);
        setProcessing(false);
        setError('Payment failed. Please try again.');
      };

      // Step 5: Launch PayHere checkout
      window.payhere.startPayment(payment);

    } catch (err) {
      console.error('Payment init error:', err);
      setProcessing(false);
      setError(err.message || 'Could not initiate payment.');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={!processing && !success ? onClose : undefined} />

      {/* Modal */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {success ? (
          /* ─── Success State ─────────────────────────── */
          <div className="p-8 text-center">
            {/* Animated Checkmark */}
            <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
              <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" 
                  style={{ 
                    strokeDasharray: 30, 
                    strokeDashoffset: 0,
                    animation: 'draw-check 0.5s ease-out forwards'
                  }} 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Payment Successful!</h2>
            <p className="text-slate-500 mb-6">Your order has been placed via PayHere and is being processed.</p>
            
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order ID</p>
              <p className="text-xl font-black text-blue-600 tracking-wide font-mono">{orderId}</p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-emerald-800">Amount Paid {hasPremium && '(Premium)'}</span>
                <span className="text-lg font-black text-emerald-700">Rs. {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              onClick={() => { onClose(); navigate('/'); }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          /* ─── Checkout Summary & Pay ────────────────── */
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Secure Checkout</h2>
                  <p className="text-slate-400 text-xs font-medium">Powered by PayHere</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={processing}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Order Summary */}
            <div className="p-6">
              {/* Items */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Summary</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity} × Rs. {item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-bold text-slate-900 text-sm ml-3">
                        Rs. {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 mb-5 relative overflow-hidden">
                {hasPremium && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-sm">
                    Premium Member: 0.5% Off
                  </div>
                )}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-800 font-medium">Subtotal</span>
                    <span className="text-blue-900 font-bold">Rs. {finalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {hasPremium && (
                    <div className="flex justify-between items-center text-sm text-emerald-600">
                      <span className="font-semibold">Premium Discount (0.5%)</span>
                      <span className="font-bold">- Rs. {discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-blue-200/50">
                  <span className="text-sm font-bold text-blue-800">Total Amount</span>
                  <span className="text-2xl font-black text-blue-900">Rs. {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1 font-medium">Currency: LKR · Order: {orderId}</p>
              </div>

              {/* Buyer Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">{buyerName}</p>
                    <p className="text-xs text-slate-500 truncate">{buyerEmail} · {buyerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePayHere}
                disabled={processing}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {processing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Launching PayHere...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Pay with PayHere · Rs. {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </>
                )}
              </button>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-medium pt-4">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  PCI DSS Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  256-bit SSL
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Keyframe for checkmark animation */}
      <style>{`
        @keyframes draw-check {
          from { stroke-dashoffset: 30; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default PaymentModal;
