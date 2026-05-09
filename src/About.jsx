import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Global Medicine Logo"
              className="h-14 md:h-16 w-auto object-contain"
            />
            <div className="flex flex-col ml-3 leading-tight">
              <span className="font-extrabold text-2xl md:text-3xl text-blue-900 tracking-tight">Global Medicine</span>
              <span className="font-semibold text-[10px] md:text-xs text-gray-500 tracking-widest uppercase mt-0.5">Healthcare Supply Chain</span>
            </div>
          </Link>
          <nav className="hidden md:flex gap-6 items-center font-medium text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-blue-600 transition-colors">Products</Link>
            <Link to="/suppliers" className="hover:text-blue-600 transition-colors">Suppliers</Link>
            <Link to="/about" className="text-blue-600 font-bold transition-colors">About Us</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-900 to-indigo-900 text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[300px] h-[300px] bg-indigo-400/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Empowering Healthcare in Sri Lanka</h1>
            <p className="text-xl text-blue-100 font-medium leading-relaxed max-w-3xl mx-auto">
              Global Medicine is dedicated to bridging the gap between world-class pharmaceutical manufacturers and local pharmacies, ensuring that every patient has access to safe, authentic, and affordable medication.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Our Mission</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  To revolutionize the medical supply chain in Sri Lanka through transparency, efficiency, and a relentless commitment to quality. We strive to empower pharmacies to serve their communities better by providing seamless access to essential medicines.
                </p>
              </div>
              
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Our Vision</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  A future where no clinic or pharmacy faces a stockout of critical medication, and where every citizen can trust the authenticity of the medicine they receive.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-3xl p-6 text-center transform translate-y-8">
                <h3 className="text-4xl font-black text-blue-600 mb-2">100%</h3>
                <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">Verified Products</p>
              </div>
              <div className="bg-indigo-50 rounded-3xl p-6 text-center">
                <h3 className="text-4xl font-black text-indigo-600 mb-2">24/7</h3>
                <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">Support System</p>
              </div>
              <div className="bg-emerald-50 rounded-3xl p-6 text-center transform translate-y-8">
                <h3 className="text-4xl font-black text-emerald-600 mb-2">50+</h3>
                <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">Partner Pharmacies</p>
              </div>
              <div className="bg-amber-50 rounded-3xl p-6 text-center">
                <h3 className="text-4xl font-black text-amber-600 mb-2">Fast</h3>
                <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">Islandwide Delivery</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
