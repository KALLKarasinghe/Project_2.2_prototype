import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSystemStore } from './SystemContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logoutUser, toggleCart, cart } = useSystemStore();

  const handleSignOut = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-2 px-6 flex justify-between items-center text-xs sm:text-sm font-medium tracking-wide">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            +9470 345 7402
          </span>
          <span className="hidden sm:flex items-center gap-1 text-blue-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            support@globalmedicine.com
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/special-medicine" className="hover:text-blue-200 cursor-pointer transition-colors">Special Medicine</Link>
          <span className="opacity-40">|</span>
          <span className="hover:text-blue-200 cursor-pointer transition-colors">Help Center</span>
        </div>
      </div>

      {/* Main Logo and Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center cursor-pointer">
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

        {/* Right Section */}
        <div className="flex gap-4 items-center">
          {/* Navigation Links */}
          <nav className="hidden md:flex gap-6 items-center font-medium text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-blue-600 transition-colors">Products</Link>
            <Link to="/suppliers" className="hover:text-blue-600 transition-colors">Suppliers</Link>
            <Link to="/about" className="hover:text-blue-600 transition-colors">About Us</Link>
          </nav>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-slate-200" />

          {/* Cart Icon (always visible) */}
          <button onClick={toggleCart} className="relative w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-50 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-bounce">{cart.length}</span>
            )}
          </button>

          {/* Auth-aware section */}
          {currentUser ? (
            /* ─── Logged In State ─────────────────────── */
            <div className="flex items-center gap-3">
              {/* User greeting */}
              <div className="hidden sm:flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 border border-blue-100">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {currentUser.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-blue-900 max-w-[120px] truncate">
                  Hi, {currentUser.name?.split(' ')[0]}
                </span>
              </div>

              {/* My Orders link */}
              <Link
                to="/my-orders"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                My Orders
              </Link>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold py-2 px-4 rounded-full text-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            /* ─── Logged Out State ────────────────────── */
            <button 
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
