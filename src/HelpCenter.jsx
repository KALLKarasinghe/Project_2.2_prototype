import React, { useState } from 'react';
import Navbar from './Navbar';
import toast from 'react-hot-toast';

const HelpCenter = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  
  const faqs = [
    {
      q: "How do I place an order for special medicines?",
      a: "You can visit the 'Special Medicine' section from the top navigation. There, you can describe your symptoms or upload a prescription, and our AI will recommend the appropriate agent to contact."
    },
    {
      q: "How long does shipping take?",
      a: "Standard shipping usually takes 2-3 business days. For urgent or specialized medicines, expedited overnight shipping is available at checkout."
    },
    {
      q: "How can I become a verified supplier?",
      a: "To become a verified supplier, please click 'Register' and select the 'Supplier' role. Our compliance team will review your credentials within 24-48 hours."
    },
    {
      q: "What if I received a damaged batch?",
      a: "Please navigate to your 'Incoming Orders' or 'My Orders' section, click on the relevant order, and open a dispute or use the chat to inform the supplier immediately."
    }
  ];

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast.success("Your message has been sent to our support team!");
    e.target.reset();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-indigo-900 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">How can we help you today?</h1>
          <p className="text-indigo-200 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Search for answers, browse our guides, or get in touch with our support team.
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Search for answers (e.g. 'how to order')" 
              className="w-full px-6 py-4 rounded-full text-slate-800 text-lg shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-400"
            />
            <button className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-full font-bold transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Support Cards */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">User Guides</h3>
            <p className="text-slate-500">Step-by-step tutorials on using the Global Medicine platform.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Community Forum</h3>
            <p className="text-slate-500">Connect with other pharmacies and suppliers to share insights.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">System Status</h3>
            <p className="text-slate-500">Check if our servers, AI models, and APIs are operational.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-6 tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-6 py-4 font-bold text-slate-800 flex justify-between items-center hover:bg-slate-50 transition-colors"
                  >
                    {faq.q}
                    <span className={`transform transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </span>
                  </button>
                  {activeFaq === idx && (
                    <div className="px-6 pb-4 pt-1 text-slate-600 animate-in slide-in-from-top-2 fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Contact Support</h2>
            <p className="text-slate-500 mb-6">Need more help? Send us a message and we'll get back to you within 24 hours.</p>
            
            <form onSubmit={handleContactSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                  <input type="text" required className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                  <input type="text" required className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <input type="email" required className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Topic</label>
                <select className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white">
                  <option>Order Issue</option>
                  <option>Account Access</option>
                  <option>Supplier Verification</option>
                  <option>Technical Support</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Message</label>
                <textarea required rows="4" className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"></textarea>
              </div>
              
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center mt-auto">
        <p>© 2026 Global Medicine. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-4">
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
};

export default HelpCenter;
