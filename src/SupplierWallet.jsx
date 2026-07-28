import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SupplierWallet({ currentUser }) {
  const [walletData, setWalletData] = useState({
    balance: 0,
    total_earnings: 0,
    total_withdrawn: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // fetch wallet data on load
  const fetchWallet = async () => {
    try {
      const response = await fetch(`http://localhost/pharma_backend/api/wallet.php?supplier_id=${currentUser.id}`);
      const data = await response.json();
      if (data.success) {
        setWalletData(data);
      }
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchWallet();
    }
  }, [currentUser]);

  // handle withdrawal request
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || !bankDetails) {
      toast.error("Please fill all fields.");
      return;
    }
    const amount = parseFloat(withdrawAmount);
    if (amount <= 0 || amount > walletData.balance) {
      toast.error("Invalid amount. Check your available balance.");
      return;
    }

    setIsWithdrawing(true);
    try {
      const response = await fetch('http://localhost/pharma_backend/api/wallet.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: currentUser.id,
          amount: amount,
          bank_details: bankDetails
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Withdrawal requested successfully!");
        setWithdrawModalOpen(false);
        setWithdrawAmount('');
        setBankDetails('');
        fetchWallet(); // refresh data
      } else {
        toast.error(data.error || "Failed to process withdrawal.");
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-indigo-100 font-semibold text-sm uppercase tracking-wider mb-2">Available Balance</h3>
            <p className="text-4xl font-black mb-6">Rs. {walletData.balance.toFixed(2)}</p>
            <button 
              onClick={() => setWithdrawModalOpen(true)}
              className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm active:scale-95 text-sm"
            >
              Withdraw Funds
            </button>
          </div>
          <svg className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.97-1.31-3.26-3.06-3.56V4h-2.02v2.05C9.46 6.35 8 7.7 8 9.5c0 2.28 1.94 3.08 4.35 3.68 1.83.47 2.27 1.05 2.27 1.79 0 1-.89 1.55-2.23 1.55-1.39 0-2.12-.73-2.18-1.76H8.5c.06 1.92 1.33 3.08 3.12 3.42V20h2.02v-2.06c1.62-.25 3.09-1.49 3.09-3.29 0-2.48-2.06-3.15-4.42-3.51z"/></svg>
        </div>

        {/* Earnings Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Total Earnings</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">Rs. {walletData.total_earnings.toFixed(2)}</p>
        </div>

        {/* Withdrawn Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Total Withdrawn</h3>
            <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">Rs. {walletData.total_withdrawn.toFixed(2)}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          {walletData.transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium">No transactions found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {walletData.transactions.map((txn, idx) => {
                  
                  // determine transaction type style
                  let typeStyle = 'bg-rose-50 text-rose-600 border-rose-200';
                  if (txn.type === 'credit') {
                    typeStyle = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                  }

                  // determine status style
                  let statusStyle = 'bg-red-50 text-red-600 border-red-200';
                  if (txn.status === 'Completed' || !txn.status) {
                    statusStyle = 'bg-blue-50 text-blue-600 border-blue-200';
                  } else if (txn.status === 'Pending') {
                    statusStyle = 'bg-amber-50 text-amber-600 border-amber-200';
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{new Date(txn.date).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-800 font-semibold">{txn.description}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${typeStyle}`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${statusStyle}`}>
                          {txn.status || 'Completed'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-black ${txn.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {txn.type === 'credit' ? '+' : '-'} Rs. {txn.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-extrabold text-slate-900">Request Withdrawal</h2>
              <button onClick={() => setWithdrawModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Available Balance</p>
                <p className="font-bold text-indigo-600 text-2xl">Rs. {walletData.balance.toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Amount to Withdraw (Rs.)</label>
                <input
                  type="number"
                  min="1"
                  max={walletData.balance}
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 5000.00"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Details</label>
                <textarea
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  placeholder="Bank Name, Account Name, Account Number, Branch"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isWithdrawing || !withdrawAmount || !bankDetails || parseFloat(withdrawAmount) > walletData.balance}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? 'Processing...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
