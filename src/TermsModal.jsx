import React from 'react';

const TermsModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            Terms and Conditions & Platform Policies
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-600 text-sm leading-relaxed space-y-5 custom-scrollbar">
          
          <p className="font-semibold text-slate-800">
            Welcome to the Global Medicine Online Pharmaceutical Supply Chain Management System. 
            By registering and using this platform, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <div>
            <h3 className="text-base font-bold text-slate-800 mb-2">1. Registration and Regulatory Compliance</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>All Pharmacies, Suppliers, and Medical Agents must possess valid licenses issued by the National Medicines Regulatory Authority (NMRA) or Sri Lanka Medical Council (SLMC) to operate on this platform.</li>
              <li>Providing false, expired, or manipulated licenses/documents during registration will result in immediate termination of your account and reporting to the relevant law enforcement and health authorities.</li>
              <li>You are solely responsible for keeping your login credentials confidential and secure.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800 mb-2">2. Nature of the Platform</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>This platform acts solely as a B2B (Business-to-Business) intermediary connecting Pharmacies with Suppliers and Medical Agents.</li>
              <li>We do not manufacture, store, verify the medical efficacy, or physically distribute pharmaceutical products.</li>
              <li>The platform owners provide no warranties regarding the quality, safety, or legality of the medicines sold by Suppliers.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800 mb-2">3. Limitation of Liability</h3>
            <p className="mb-2 text-slate-500">To the maximum extent permitted by applicable law, the platform shall NOT be liable for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Any delays in medicine delivery, stock inaccuracies, or out-of-stock situations caused by Suppliers.</li>
              <li>Any financial loss, revenue loss, or data loss resulting from system downtimes or technical failures.</li>
              <li>Any medical emergencies, health issues, or damages arising from the use or misuse of medicines ordered through this platform.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800 mb-2">4. Order and Payment Policies</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>All payments for confirmed orders are processed centrally through the Platform. Pharmacies make payments directly to the Platform's designated bank accounts or via our payment gateway.</li>
              <li>The Platform acts solely as a payment collection agent and is not responsible for the quality of the goods delivered. Disputes regarding product quality must be resolved directly with the Supplier.</li>
              <li>Once the Supplier successfully delivers the order, the Platform will remit the funds to the Supplier, after deducting the agreed platform commission.</li>
              <li>Uploaded bank receipts must be authentic. Fraudulent payment proofs will lead to account suspension and legal action.</li>
              <li>Refunds for cancelled or rejected orders will be processed back to the Pharmacy by the Platform within standard processing times, subject to verification.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800 mb-2">5. Data Privacy and Confidentiality</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>We collect and process your business data, order history, and contact details to facilitate platform operations.</li>
              <li>Your data will not be sold to third parties, but may be shared with regulatory bodies (e.g., NMRA) if legally requested.</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800">
            <p className="font-semibold mb-1">Declaration of Agreement</p>
            <p className="text-xs">
              By clicking "I Agree", I confirm that I have read, understood, and accept all the terms and conditions outlined above. I acknowledge that failure to comply with these rules may result in the immediate revocation of my platform access.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Decline
          </button>
          <button 
            onClick={() => { onAccept(); onClose(); }}
            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            I Agree to Terms
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
