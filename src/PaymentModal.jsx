import React, { useState } from 'react';
import { useSystemStore } from './SystemContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/pharma_backend/api';

const PaymentModal = ({ total, onClose }) => {
  const { clearCart, cart, currentUser } = useSystemStore();
  const navigate = useNavigate();

  const [finalAmount] = useState(total);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderId] = useState(() => 'GM-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase());
  const [paymentMethod, setPaymentMethod] = useState('PayHere'); // 'PayHere' or 'Bank Transfer'
  const [receiptImage, setReceiptImage] = useState(null);

  const grandTotal = finalAmount;

  const buyerName  = currentUser?.name || 'Guest';
  const buyerEmail = currentUser?.email || 'guest@globalmedicine.lk';
  const buyerPhone = currentUser?.phone || '0770000000';
  const buyerAddress = currentUser?.address || 'Colombo';

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBankTransferSubmit = async () => {
    if (!receiptImage) {
      setError('Please upload a bank receipt to proceed with Bank Transfer.');
      return;
    }
    setProcessing(true);
    setError('');

    try {
      const checkoutRes = await fetch(`${API_BASE}/checkout.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: currentUser.id, 
          transaction_id: orderId,
          payment_method: 'Bank Transfer',
          receipt_image: receiptImage
        })
      });
      const data = await checkoutRes.json();
      if (data.success) {
        clearCart();
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit order.');
      }
    } catch (err) {
      setError('Database error occurred.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayHere = async () => {
    setProcessing(true);
    setError('');

    const formattedAmount = Number(grandTotal).toFixed(2);

    try {
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

      const payment = {
        sandbox: true,
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

      window.payhere.onCompleted = async function onCompleted(completedOrderId) {
        try {
          const checkoutRes = await fetch(`${API_BASE}/checkout.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              user_id: currentUser.id, 
              transaction_id: completedOrderId,
              payment_method: 'PayHere'
            })
          });
          const data = await checkoutRes.json();
          if (data.success) {
            clearCart();
            setSuccess(true);
          } else {
            setError(data.error || 'Order creation failed.');
          }
        } catch (err) {
          setError('Database error occurred.');
        } finally {
          setProcessing(false);
        }
      };

      window.payhere.onDismissed = function onDismissed() {
        setProcessing(false);
      };

      window.payhere.onError = function onError(err) {
        setProcessing(false);
        setError('Payment failed.');
      };

      window.payhere.startPayment(payment);

    } catch (err) {
      setProcessing(false);
      setError(err.message || 'Could not initiate payment.');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={!processing && !success ? onClose : undefined} />

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {success ? (
          <div className="p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
              <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" 
                  style={{ strokeDasharray: 30, strokeDashoffset: 0, animation: 'draw-check 0.5s ease-out forwards' }} 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Order Successful!</h2>
            <p className="text-slate-500 mb-6">Your order has been placed and is being processed.</p>
            
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order ID</p>
              <p className="text-xl font-black text-blue-600 tracking-wide font-mono">{orderId}</p>
            </div>

            <button
              onClick={() => { onClose(); navigate('/'); }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Secure Checkout</h2>
                </div>
              </div>
              <button onClick={onClose} disabled={processing} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 mb-5 relative overflow-hidden">
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold text-blue-800">Total Amount</span>
                  <span className="text-2xl font-black text-blue-900">Rs. {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="PayHere">PayHere (Credit/Debit Card)</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {paymentMethod === 'Bank Transfer' && (
                <div className="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600 mb-3">Please transfer the total amount to Account No: <strong>1234-5678-9012</strong> (BOC, City Branch) and upload the receipt.</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleReceiptUpload} 
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {receiptImage && <img src={receiptImage} alt="Receipt Preview" className="mt-3 h-20 object-cover rounded-lg border border-slate-200" />}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-center gap-2">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {paymentMethod === 'PayHere' ? (
                <button
                  onClick={handlePayHere}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3"
                >
                  {processing ? 'Launching PayHere...' : 'Pay with PayHere'}
                </button>
              ) : (
                <button
                  onClick={handleBankTransferSubmit}
                  disabled={processing}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3"
                >
                  {processing ? 'Submitting...' : 'Submit Order'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes draw-check { from { stroke-dashoffset: 30; } to { stroke-dashoffset: 0; } }`}</style>
    </div>
  );
};

export default PaymentModal;
