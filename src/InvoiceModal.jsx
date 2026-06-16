import React from 'react';

const InvoiceModal = ({ isOpen, onClose, order, currentUserRole }) => {
  if (!isOpen || !order) return null;

  // Extract necessary details. The backend returns company_name, but it acts as Supplier for Pharmacy, and Pharmacy for Supplier.
  const isPharmacy = currentUserRole === 'pharmacy';
  const customerName = isPharmacy ? 'You (Pharmacy)' : (order.company_name || order.pharmacy_name || 'Pharmacy');
  const supplierName = isPharmacy ? (order.company_name || 'Supplier') : 'You (Supplier)';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:bg-transparent print:p-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:max-w-full print:h-auto print:max-h-full print:rounded-none">
        
        {/* Header - Hidden on print */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 print:hidden">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Invoice / Bill
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Print
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-8 overflow-y-auto flex-1 bg-white custom-scrollbar print:p-4 print:overflow-visible" id="printable-invoice">
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight mb-1">INVOICE</h1>
              <p className="text-sm font-medium text-slate-500">Order ID: #{order.id}</p>
              <p className="text-sm font-medium text-slate-500">Date: {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-900">Global Medicine</h2>
              <p className="text-sm text-slate-500">B2B Pharmaceutical Supply Chain</p>
              <p className="text-sm text-slate-500">Sri Lanka</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 border-t border-b border-slate-100 py-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To (Pharmacy)</p>
              <h3 className="text-lg font-bold text-slate-800">{customerName}</h3>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Supplied By</p>
              <h3 className="text-lg font-bold text-slate-800">{supplierName}</h3>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Description</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qty</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Unit Price</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{item.generic_name}</p>
                      <p className="text-xs font-medium text-slate-500">{item.brand_name}</p>
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-slate-700">{item.quantity}</td>
                    <td className="py-4 px-4 text-right font-medium text-slate-700">LKR {Number(item.price_per_unit).toFixed(2)}</td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">LKR {(item.quantity * item.price_per_unit).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm font-semibold text-slate-600">
                <span>Subtotal</span>
                <span>LKR {Number(order.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-slate-600">
                <span>Tax (0%)</span>
                <span>LKR 0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total</span>
                <span className="text-blue-700">LKR {Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status & Footer */}
          <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Status</p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  order.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                  order.payment_status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-200 text-slate-800'
                }`}>
                  {order.payment_status || 'N/A'}
                </span>
                <span className="text-sm font-medium text-slate-500">via {order.payment_method || 'Unknown Method'}</span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                order.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-slate-200 text-slate-800'
              }`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs font-medium text-slate-400">
            <p>This is a system generated invoice and does not require a physical signature.</p>
            <p>Thank you for using Global Medicine B2B Platform.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
