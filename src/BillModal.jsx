import React, { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';

const BillModal = ({ isOpen, onClose, order, currentUser }) => {
  const printRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !order) return null;

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    const element = printRef.current;
    
    // Add a temporary wrapper to ensure proper styling during PDF generation
    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     `Invoice_Order_${order.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsDownloading(false);
    });
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // To restore React event listeners after print replaces DOM
  };

  // setup icon for download button
  let downloadIcon = null;
  if (isDownloading) {
    downloadIcon = (
      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );
  } else {
    downloadIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
    );
  }

  let downloadText = '';
  if (isDownloading) {
    downloadText = 'Generating PDF...';
  } else {
    downloadText = 'Download PDF';
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
        
        {/* Header Actions */}
        <div className="p-4 border-b border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-t-3xl sticky top-0 z-10">
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-70"
          >
            {downloadIcon}
            {downloadText}
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 py-2 px-4 rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>
        
        {/* Printable Area */}
        <div ref={printRef} className="p-8 sm:p-10 bg-white rounded-b-3xl text-slate-800 font-sans">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-100 pb-6 mb-6 gap-4">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="PharmaCare Logo" className="h-16 w-auto object-contain" />
              <div>
                <h1 className="text-3xl font-black text-blue-600 tracking-tight">INVOICE</h1>
                <p className="text-slate-500 mt-1 font-medium">Order #{order.id}</p>
              </div>
            </div>
            <div className="text-left sm:text-right mt-4 sm:mt-0">
              <h3 className="font-bold text-slate-900 text-lg">PharmaCare System</h3>
              <p className="text-slate-500 text-sm">123 Health Avenue</p>
              <p className="text-slate-500 text-sm">Colombo, Sri Lanka</p>
              <p className="text-slate-500 text-sm mt-1">Date: {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Billing Info */}
          <div className="flex flex-col sm:flex-row justify-between gap-8 mb-8">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To:</h4>
              <p className="font-bold text-slate-800 text-lg">{currentUser?.name || 'Pharmacy'}</p>
              <p className="text-slate-600">{currentUser?.email}</p>
              <p className="text-slate-600 mt-1 capitalize"><span className="font-semibold">Role:</span> {currentUser?.role}</p>
            </div>
            <div className="sm:text-right">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Supplier:</h4>
              <p className="font-bold text-slate-800 text-lg">{order.company_name}</p>
              <p className="text-slate-600">Status: <span className="font-bold uppercase">{order.status}</span></p>
              {order.transaction_id && (
                <p className="text-slate-600">Txn ID: {order.transaction_id}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8 rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-bold text-sm">Description</th>
                  <th className="px-4 py-3 font-bold text-sm text-right">Qty</th>
                  <th className="px-4 py-3 font-bold text-sm text-right">Unit Price</th>
                  <th className="px-4 py-3 font-bold text-sm text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-800">{item.generic_name}</p>
                      <p className="text-xs text-slate-500">{item.brand_name}</p>
                    </td>
                    <td className="px-4 py-4 text-right font-medium">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-slate-600">Rs. {item.price_per_unit.toFixed(2)}</td>
                    <td className="px-4 py-4 text-right font-bold text-slate-900">Rs. {(item.quantity * item.price_per_unit).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full sm:w-1/2 md:w-1/3">
              <div className="flex justify-between py-2">
                <span className="text-slate-600 font-medium">Subtotal</span>
                <span className="font-bold">Rs. {order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Tax / Fees</span>
                <span className="font-bold">Rs. 0.00</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-lg font-black text-slate-900">Total</span>
                <span className="text-lg font-black text-blue-600">Rs. {order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-slate-100 text-slate-500 text-sm">
            <p className="font-bold mb-1">Thank you for your business!</p>
            <p>If you have any questions about this invoice, please contact support.</p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default BillModal;
