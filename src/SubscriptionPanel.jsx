import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const SubscriptionPanel = ({ currentUser }) => {
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSub();
  }, []);

  const fetchSub = async () => {
    try {
      const res = await fetch(`http://localhost/pharma_backend/api/subscription.php?user_id=${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        setCurrentSub(data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType, amount) => {
    try {
      const orderId = 'SUB-' + Date.now().toString(36).toUpperCase();
      const formattedAmount = Number(amount).toFixed(2);
      
      const res = await fetch('http://localhost/pharma_backend/api/generate_hash.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          amount: formattedAmount,
          currency: 'LKR',
        }),
      });

      const hashData = await res.json();
      if (!hashData.hash) throw new Error('Failed to generate payment hash.');

      const payment = {
        sandbox: true,
        merchant_id: hashData.merchant_id,
        return_url: window.location.origin,
        cancel_url: window.location.origin,
        notify_url: 'http://localhost/pharma_backend/api/notify.php',
        order_id: orderId,
        items: `${planType} Membership Subscription`,
        amount: formattedAmount,
        currency: 'LKR',
        hash: hashData.hash,
        first_name: currentUser.name?.split(' ')[0] || 'User',
        last_name: currentUser.name?.split(' ').slice(1).join(' ') || '-',
        email: currentUser.email || 'user@example.com',
        phone: currentUser.phone || '0770000000',
        address: currentUser.address || 'Colombo',
        city: currentUser.address || 'Colombo',
        country: 'Sri Lanka',
      };

      window.payhere.onCompleted = async function onCompleted(completedOrderId) {
        try {
          const subRes = await fetch('http://localhost/pharma_backend/api/subscription.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUser.id, plan_type: planType })
          });
          const data = await subRes.json();
          if (data.success) {
            toast.success(`Successfully subscribed to ${planType} plan!`);
            fetchSub();
          } else {
            toast.error(data.error || 'Failed to activate subscription.');
          }
        } catch (err) {
          toast.error('Network error during activation.');
        }
      };

      window.payhere.onDismissed = function onDismissed() {
        toast.error('Payment dismissed.');
      };

      window.payhere.onError = function onError(err) {
        toast.error('Payment failed.');
      };

      window.payhere.startPayment(payment);

    } catch (err) {
      toast.error('Could not initiate payment gateway.');
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading membership status...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-extrabold text-slate-900 mb-2">Membership Subscription</h2>
      <p className="text-sm text-slate-500 mb-6">Upgrade your account to unlock premium platform features.</p>
      
      {currentSub && currentSub.status === 'Active' ? (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-8 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-indigo-900">Current Plan: {currentSub.plan_type}</h3>
            <p className="text-xs text-indigo-700 mt-1">Valid until: {new Date(currentSub.expires_at).toLocaleString()}</p>
          </div>
          <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">ACTIVE</span>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mb-8 flex items-center justify-between">
          <p className="font-bold text-amber-800">No active subscription found. Please select a plan below.</p>
          <span className="bg-amber-200 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">EXPIRED</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { type: 'Weekly', priceStr: 'Rs. 1,000', amount: 1000, desc: 'Perfect for short-term access and testing.' },
          { type: 'Monthly', priceStr: 'Rs. 3,500', amount: 3500, desc: 'Best for growing businesses.', popular: true },
          { type: 'Yearly', priceStr: 'Rs. 35,000', amount: 35000, desc: 'Save big with an annual commitment.' }
        ].map(plan => (
          <div key={plan.type} className={`border rounded-2xl p-6 relative flex flex-col ${plan.popular ? 'border-indigo-500 shadow-md shadow-indigo-100 bg-white' : 'border-slate-200 bg-slate-50/50'}`}>
            {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">Most Popular</span>}
            <h3 className="font-bold text-slate-900 text-lg">{plan.type} Plan</h3>
            <p className="text-3xl font-black text-slate-900 mt-2 mb-1">{plan.priceStr}</p>
            <p className="text-xs text-slate-500 mb-6 flex-1">{plan.desc}</p>
            <button onClick={() => handleSubscribe(plan.type, plan.amount)} className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>
              Subscribe {plan.type}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPanel;
